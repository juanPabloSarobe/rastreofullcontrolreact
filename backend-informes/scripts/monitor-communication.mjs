/**
 * Monitor de Comunicación - Detecta caídas del módulo receptor de datos
 * En desarrollo: Usa AWS Secrets Manager (USE_AWS_SECRETS=true)
 * En producción: Usa variables de entorno (.env)
 */

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import nodemailer from 'nodemailer';

dotenv.config();

const ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = ENV === 'production';
const MONTH_TABLE_REGEX = /^ActividadDiaria\d{4}-\d{2}$/;

// Logger simple
class Logger {
  constructor() {
    this.timestamp = () => new Date().toISOString();
  }

  info(msg, data = {}) {
    console.log(`[${this.timestamp()}] INFO: ${msg}`, data);
  }

  warn(msg, data = {}) {
    console.warn(`[${this.timestamp()}] WARN: ${msg}`, data);
  }

  error(msg, data = {}) {
    console.error(`[${this.timestamp()}] ERROR: ${msg}`, data);
  }

  debug(msg, data = {}) {
    if (process.env.DEBUG === 'true') {
      console.log(`[${this.timestamp()}] DEBUG: ${msg}`, data);
    }
  }
}

const logger = new Logger();
const ACTIVE_WINDOW_SECONDS = 10;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Obtiene credenciales DB desde AWS Secrets (desarrollo) o env (producción)
 */
async function getDatabaseConfig() {
  try {
    if (IS_PRODUCTION) {
      // Producción: usar variables de entorno
      logger.debug('Usando configuración desde variables de entorno (PRODUCCIÓN)');
      
      const config = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 1,
      };

      // Validar que todas las credenciales estén presentes
      const required = ['host', 'port', 'database', 'user', 'password'];
      const missing = required.filter(key => !config[key]);
      if (missing.length > 0) {
        throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
      }

      return config;
    } else {
      // Desarrollo: usar AWS Secrets Manager
      logger.debug('Usando configuración desde AWS Secrets Manager (DESARROLLO)');
      
      const { SecretsManagerClient, GetSecretValueCommand } = await import('@aws-sdk/client-secrets-manager');
      
      const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
      const SECRET_NAME = process.env.SECRET_NAME || 'basededatosisis';

      const client = new SecretsManagerClient({ region: AWS_REGION });
      const response = await client.send(
        new GetSecretValueCommand({
          SecretId: SECRET_NAME,
          VersionStage: 'AWSCURRENT',
        })
      );

      let secret;
      if ('SecretString' in response) {
        secret = JSON.parse(response.SecretString);
      } else {
        throw new Error('Secret retornado en formato binario');
      }

      return {
        host: secret.host,
        port: secret.port || 5432,
        database: secret.database,
        user: secret.username,
        password: secret.password,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 1,
      };
    }
  } catch (error) {
    logger.error('Error obteniendo configuración de BD', { message: error.message });
    throw error;
  }
}

function formatMonthTable(date, useUTC = false) {
  const year = useUTC ? date.getUTCFullYear() : date.getFullYear();
  const month = String((useUTC ? date.getUTCMonth() : date.getMonth()) + 1).padStart(2, '0');
  return `ActividadDiaria${year}-${month}`;
}

function shiftMonth(date, deltaMonths, useUTC = false) {
  const d = new Date(date);
  if (useUTC) {
    d.setUTCMonth(d.getUTCMonth() + deltaMonths);
  } else {
    d.setMonth(d.getMonth() + deltaMonths);
  }
  return d;
}

function buildMonthTableCandidates() {
  const now = new Date();
  const localCandidates = [
    formatMonthTable(shiftMonth(now, -1, false), false),
    formatMonthTable(now, false),
    formatMonthTable(shiftMonth(now, 1, false), false),
  ];

  const utcCandidates = [
    formatMonthTable(shiftMonth(now, -1, true), true),
    formatMonthTable(now, true),
    formatMonthTable(shiftMonth(now, 1, true), true),
  ];

  return [...new Set([...localCandidates, ...utcCandidates])].filter((name) => MONTH_TABLE_REGEX.test(name));
}

async function fetchExistingCandidateTables(client, candidates) {
  const result = await client.query(
    `
      SELECT relname
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
        AND relname = ANY($1::text[])
      ORDER BY relname
    `,
    [candidates]
  );

  return result.rows.map((row) => row.relname).filter((name) => MONTH_TABLE_REGEX.test(name));
}

async function fetchInsertCounters(client, tableNames) {
  const result = await client.query(
    `
      SELECT relname, COALESCE(n_tup_ins, 0)::bigint AS total_inserts
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
        AND relname = ANY($1::text[])
    `,
    [tableNames]
  );

  const counters = {};
  for (const row of result.rows) {
    counters[row.relname] = Number(row.total_inserts || 0);
  }
  return counters;
}

async function fetchWindowDiagnostics(client, tableName) {
  if (!MONTH_TABLE_REGEX.test(tableName)) {
    return {
      dbNow: null,
      maxHorarioServer: null,
      windowEventCount: 0,
    };
  }

  const windowResult = await client.query(`
    SELECT
      COUNT(*)::int AS event_count,
      MAX("horarioServer") AS max_horario_server,
      NOW() AS db_now
    FROM "${tableName}"
    WHERE "horarioServer" > NOW() - INTERVAL '10 seconds'
      AND "horarioServer" <= NOW() + INTERVAL '15 seconds'
  `);

  return {
    windowEventCount: Number(windowResult.rows[0]?.event_count || 0),
    maxHorarioServer: windowResult.rows[0]?.max_horario_server || null,
    dbNow: windowResult.rows[0]?.db_now || null,
  };
}

/**
 * Ejecuta el query de monitoreo de comunicación
 */
async function checkCommunicationStatus(pool) {
  const client = await pool.connect();
  try {
    const candidates = buildMonthTableCandidates();
    const monitoredTables = await fetchExistingCandidateTables(client, candidates);

    if (monitoredTables.length === 0) {
      throw new Error(`No se encontraron tablas candidatas para monitoreo: ${candidates.join(', ')}`);
    }

    const startTime = Date.now();
    const insertsBefore = await fetchInsertCounters(client, monitoredTables);

    await sleep(ACTIVE_WINDOW_SECONDS * 1000);
    const insertsAfter = await fetchInsertCounters(client, monitoredTables);

    const duration = Date.now() - startTime;

    const deltasByTable = monitoredTables.map((table) => {
      const before = Number(insertsBefore[table] || 0);
      const after = Number(insertsAfter[table] || 0);
      const delta = Math.max(0, after - before);
      return {
        table,
        totalInsertsBefore: before,
        totalInsertsAfter: after,
        insertsDelta: delta,
      };
    });

    const eventCount = deltasByTable.reduce((acc, row) => acc + row.insertsDelta, 0);
    const primary = [...deltasByTable].sort((a, b) => b.insertsDelta - a.insertsDelta)[0] || deltasByTable[0];
    const diagnostics = await fetchWindowDiagnostics(client, primary.table);

    const detectionSource = `pg_stat_user_tables.n_tup_ins_delta_${ACTIVE_WINDOW_SECONDS}s`;
    
    logger.debug('Query ejecutado', {
      tables: monitoredTables,
      primaryTable: primary.table,
      eventCount,
      deltasByTable,
      detectionSource,
      durationMs: duration,
    });

    return {
      success: true,
      table: primary.table,
      monitoredTables,
      deltasByTable,
      eventCount,
      insertsDelta: eventCount,
      totalInsertsBefore: deltasByTable.reduce((acc, row) => acc + row.totalInsertsBefore, 0),
      totalInsertsAfter: deltasByTable.reduce((acc, row) => acc + row.totalInsertsAfter, 0),
      windowEventCount: diagnostics.windowEventCount,
      detectionSource,
      dbNow: diagnostics.dbNow,
      maxHorarioServer: diagnostics.maxHorarioServer,
      activeWindowSeconds: ACTIVE_WINDOW_SECONDS,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Error ejecutando query', {
      message: error.message,
      code: error.code,
    });
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Evalúa el estado basado en inserciones reales en ventana activa de 10s
 */
function evaluateStatus(eventCount, detectionSource) {
  const criticalThreshold = detectionSource.startsWith('pg_stat_user_tables.n_tup_ins_delta_') ? 1 : 5;
  if (eventCount < criticalThreshold) {
    return { status: 'CRITICAL', message: `Sin comunicación - solo ${eventCount} eventos en últimos 10 segundos` };
  }
  return { status: 'OK', message: `Comunicación activa (${eventCount} eventos)` };
}

/**
 * Crea transporter nodemailer para AWS SES
 */
function createEmailTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.debug('Credenciales SMTP no configuradas, alertas por email deshabilitadas');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true para puerto 465, false para otros
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    logger.debug('Email transporter configurado', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
    });

    return transporter;
  } catch (error) {
    logger.error('Error configurando email transporter', { message: error.message });
    return null;
  }
}

/**
 * Envía alerta por email cuando status === CRITICAL
 */
async function sendCriticalAlert(report, transporter) {
  if (!transporter) {
    logger.debug('Email transporter no disponible, saltando envío de alerta');
    return;
  }

  if (!process.env.COMMUNICATION_ALERT_EMAIL) {
    logger.warn('COMMUNICATION_ALERT_EMAIL no configurado');
    return;
  }

  try {
    const hostname = process.env.HOSTNAME || 'servidor';
    const timestamp = new Date(report.timestamp).toLocaleString('es-AR');

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.COMMUNICATION_ALERT_EMAIL,
      subject: `🔴 ALERTA CRÍTICA: Sin comunicación - ${hostname}`,
      html: `
        <h2 style="color: #d32f2f;">⚠️ ALERTA CRÍTICA - SIN COMUNICACIÓN</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Hora:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${timestamp}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Servidor:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${hostname}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Eventos (últimos 10 seg):</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #d32f2f;"><strong>${report.eventCount}</strong></td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Tabla:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${report.table}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Mensaje:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${report.message}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #666;">Este es un mensaje automático generado por el Monitor de Comunicación.</p>
      `,
      text: `
ALERTA CRÍTICA - SIN COMUNICACIÓN
Hora: ${timestamp}
Servidor: ${hostname}
Eventos (últimos 10 seg): ${report.eventCount}
Tabla: ${report.table}
Mensaje: ${report.message}

Este es un mensaje automático generado por el Monitor de Comunicación.
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info('✓ Alerta crítica enviada por email', {
      to: process.env.COMMUNICATION_ALERT_EMAIL,
      timestamp: report.timestamp,
    });
  } catch (error) {
    logger.error('Error enviando alerta por email', {
      message: error.message,
      to: process.env.COMMUNICATION_ALERT_EMAIL,
    });
  }
}

/**
 * Genera resumen del estado
 */
function formatStatusReport(checkResult, status, message, durationMs) {
  return {
    timestamp: new Date().toISOString(),
    environment: ENV,
    table: checkResult.table,
    monitoredTables: checkResult.monitoredTables,
    deltasByTable: checkResult.deltasByTable,
    eventCount: checkResult.eventCount,
    detectionSource: checkResult.detectionSource,
    insertsDelta: checkResult.insertsDelta,
    totalInsertsBefore: checkResult.totalInsertsBefore,
    totalInsertsAfter: checkResult.totalInsertsAfter,
    windowEventCount: checkResult.windowEventCount,
    dbNow: checkResult.dbNow,
    maxHorarioServer: checkResult.maxHorarioServer,
    activeWindowSeconds: checkResult.activeWindowSeconds,
    status,
    message,
    queryDurationMs: durationMs,
    // Los thresholds ya no son necesarios en la evaluación, pero se pueden agregar en Fase 2
  };
}

/**
 * Guarda el reporte en:
 * - S3 en producción (COMMUNICATION_LOG_BUCKET)
 * - Archivo local en desarrollo (COMMUNICATION_LOG_FILE)
 */
async function logStatusReport(report) {
  try {
    const logEntry = JSON.stringify(report) + '\n';
    const timestamp = new Date().toISOString();
    
    if (IS_PRODUCTION && process.env.COMMUNICATION_LOG_BUCKET) {
      // Producción: Enviar a S3
      await logToS3(report, timestamp);
    } else if (process.env.COMMUNICATION_LOG_FILE) {
      // Desarrollo o fallback local: Archivo
      const logFile = process.env.COMMUNICATION_LOG_FILE;
      await fs.appendFile(logFile, logEntry);
      logger.debug('Reporte guardado en archivo local', { file: logFile });
    } else {
      logger.debug('No se configuró almacenamiento de logs (S3 ni archivo local)');
    }

    // Siempre log en stdout (será capturado por cron y/o systemd)
    console.log(JSON.stringify(report));
  } catch (error) {
    logger.error('Error guardando reporte', { message: error.message });
    // Fallback: al menos imprimir en stdout
    console.log(JSON.stringify(report));
  }
}

/**
 * Envía logs a S3 con estructura particionada
 * s3://bucket/communication-monitor/YYYY/MM/DD/HH/monitor-{timestamp}.jsonl
 */
async function logToS3(report, timestamp) {
  try {
    const bucketName = process.env.COMMUNICATION_LOG_BUCKET;
    const awsRegion = process.env.AWS_REGION || 'us-east-1';
    
    if (!bucketName) {
      logger.warn('COMMUNICATION_LOG_BUCKET no configurado, saltando S3');
      return;
    }

    // Generar path particionado por fecha
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');
    
    // Nombre de archivo: monitor-2026-03-16T19-25-30.json
    const fileName = `monitor-${timestamp.replace(/[:.]/g, '-')}.json`;
    const s3Key = `communication-monitor/${year}/${month}/${day}/${hour}/${fileName}`;
    
    logger.debug('Enviando a S3', {
      bucket: bucketName,
      key: s3Key,
      region: awsRegion,
    });

    const s3Client = new S3Client({ region: awsRegion });
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: JSON.stringify(report),
      ContentType: 'application/json',
      Metadata: {
        'monitor-status': report.status,
        'event-count': String(report.eventCount || 0),
        'environment': ENV,
      },
    });

    await s3Client.send(command);
    logger.debug('✓ Reporte guardado en S3', { key: s3Key });
  } catch (error) {
    logger.error('Error enviando a S3', {
      message: error.message,
      bucket: process.env.COMMUNICATION_LOG_BUCKET,
    });
    // No relanzar error - fallback a stdout ya está hecho en logStatusReport()
  }
}

/**
 * Ejecuta la monitorización
 */
async function main() {
  let pool = null;
  let emailTransporter = null;

  try {
    logger.info('Iniciando Monitor de Comunicación', {
      environment: ENV,
      nodeVersion: process.version,
    });

    // Configurar email transporter
    emailTransporter = createEmailTransporter();

    // Obtener configuración
    const dbConfig = await getDatabaseConfig();
    logger.debug('Configuración de BD obtenida', {
      host: dbConfig.host,
      database: dbConfig.database,
    });

    // Crear pool
    pool = new pg.Pool(dbConfig);
    pool.on('error', (err) => {
      logger.error('Error en pool', { message: err.message });
    });

    // Ejecutar query
    const result = await checkCommunicationStatus(pool);

    // Evaluar estado
    const { status, message } = evaluateStatus(result.eventCount, result.detectionSource);

    // Generar reporte
    const report = formatStatusReport(
      result,
      status,
      message,
      result.durationMs
    );

    // Guardar reporte
    await logStatusReport(report);

    // Log según estado y enviar alertas
    if (status === 'OK') {
      logger.info('✓ Comunicación normal', { eventCount: result.eventCount });
    } else if (status === 'WARNING') {
      logger.warn('⚠️ ALERTA: Comunicación degradada', {
        eventCount: result.eventCount,
        message,
      });
      // Fase 2: Alertas por email/WhatsApp
    } else if (status === 'CRITICAL') {
      logger.error('🔴 CRITICA: Sin comunicación', {
        eventCount: result.eventCount,
        message,
      });
      // Enviar alerta crítica
      await sendCriticalAlert(report, emailTransporter);
    }

    logger.debug('Monitor completado exitosamente');
    process.exit(0);
  } catch (error) {
    logger.error('Fallo crítico en monitor', {
      message: error.message,
      stack: error.stack,
    });

    const errorReport = {
      timestamp: new Date().toISOString(),
      environment: ENV,
      status: 'ERROR',
      message: `Fallo en monitorización: ${error.message}`,
      error: error.message,
    };

    console.log(JSON.stringify(errorReport));

    // TODO: Fase 2 - Agregar alerta de error crítico aquí
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      logger.debug('Pool de conexiones cerrado');
    }
  }
}

// Ejecutar
main().catch(error => {
  logger.error('Unhandled error', { message: error.message });
  process.exit(1);
});
