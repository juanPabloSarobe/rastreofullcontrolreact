/**
 * Monitor de Comunicación - Detecta caídas del módulo receptor de datos
 * En desarrollo: Usa AWS Secrets Manager (USE_AWS_SECRETS=true)
 * En producción: Usa variables de entorno (.env)
 */

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import nodemailer from 'nodemailer';

dotenv.config();

const ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = ENV === 'production';

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

/**
 * Obtiene el nombre de tabla según el mes actual
 * Ejemplo: 2026-03 → "ActividadDiaria2026-03"
 */
function getTableName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `ActividadDiaria${year}-${month}`;
}

/**
 * Ejecuta el query de monitoreo de comunicación
 */
async function checkCommunicationStatus(pool, tableName) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT COUNT(*) as event_count
      FROM "${tableName}"
      WHERE "horarioServer" > NOW() - INTERVAL '10 seconds'
    `;

    const startTime = Date.now();
    const result = await client.query(query);
    const duration = Date.now() - startTime;

    const eventCount = parseInt(result.rows[0].event_count, 10);
    
    logger.debug('Query ejecutado', {
      table: tableName,
      eventCount,
      durationMs: duration,
    });

    return {
      success: true,
      eventCount,
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
 * Evalúa el estado basado en el conteo de eventos
 * 
 * OK: >= 5 eventos
 * CRITICAL: < 5 eventos
 */
function evaluateStatus(eventCount) {
  if (eventCount < 5) {
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
function formatStatusReport(eventCount, status, message, durationMs, tableName) {
  return {
    timestamp: new Date().toISOString(),
    environment: ENV,
    table: tableName,
    eventCount,
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

    // Obtener nombre de tabla
    const tableName = getTableName();
    logger.debug('Tabla objetivo', { tableName });

    // Ejecutar query
    const result = await checkCommunicationStatus(pool, tableName);

    // Evaluar estado
    const { status, message } = evaluateStatus(result.eventCount);

    // Generar reporte
    const report = formatStatusReport(
      result.eventCount,
      status,
      message,
      result.durationMs,
      tableName
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
