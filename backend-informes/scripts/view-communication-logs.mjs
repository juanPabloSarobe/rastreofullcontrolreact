#!/usr/bin/env node

/**
 * script-view-communication-logs.mjs
 * 
 * Herramienta para ver los logs de comunicación almacenados en S3
 * 
 * Uso:
 *   node scripts/view-communication-logs.mjs today
 *   node scripts/view-communication-logs.mjs yesterday  
 *   node scripts/view-communication-logs.mjs 2026-03-15
 *   node scripts/view-communication-logs.mjs stats
 */

import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const bucketName = process.env.COMMUNICATION_LOG_BUCKET;
const awsRegion = process.env.AWS_REGION || 'us-east-1';

if (!bucketName) {
  console.error('❌ COMMUNICATION_LOG_BUCKET no configurado en .env');
  process.exit(1);
}

const s3Client = new S3Client({ region: awsRegion });

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorizeStatus(status) {
  const colorMap = {
    OK: colors.green,
    WARNING: colors.yellow,
    CRITICAL: colors.red,
    ERROR: colors.red,
  };
  return `${colorMap[status] || colors.reset}${status}${colors.reset}`;
}

function getDatePath(dateStr) {
  let date;
  
  if (dateStr === 'today') {
    date = new Date();
  } else if (dateStr === 'yesterday') {
    date = new Date();
    date.setDate(date.getDate() - 1);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    date = new Date(dateStr);
  } else {
    throw new Error('Formato de fecha inválido. Usa: today, yesterday, o YYYY-MM-DD');
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `communication-monitor/${year}/${month}/${day}/`;
}

async function listLogsForDate(dateStr) {
  try {
    const prefix = getDatePath(dateStr);
    console.log(`\n📁 Listando logs en S3: s3://${bucketName}/${prefix}\n`);

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      console.log('No hay logs para esta fecha.');
      return;
    }

    // Agrupar por hora
    const byHour = {};
    response.Contents.forEach(obj => {
      const match = obj.Key.match(/\/(\d{2})\/monitor-/);
      if (match) {
        const hour = match[1];
        if (!byHour[hour]) byHour[hour] = [];
        byHour[hour].push(obj);
      }
    });

    // Mostrar por hora
    Object.keys(byHour)
      .sort()
      .forEach(hour => {
        console.log(`${colors.bright}Hora ${hour}:00${colors.reset}`);
        byHour[hour].forEach(obj => {
          const timestamp = obj.LastModified.toISOString();
          console.log(`  ${timestamp} - ${obj.Key.split('/').pop()}`);
        });
      });

    console.log(`\n✓ Total de archivos: ${response.Contents.length}`);
  } catch (error) {
    console.error('❌ Error listando S3:', error.message);
    process.exit(1);
  }
}

async function readLogFile(s3Key) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    const response = await s3Client.send(command);
    const body = await response.Body.transformToString();
    return JSON.parse(body);
  } catch (error) {
    console.error('❌ Error leyendo archivo S3:', error.message);
    return null;
  }
}

async function showLatestLogs(dateStr, limit = 12) {
  try {
    const prefix = getDatePath(dateStr);

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: limit,
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      console.log('No hay logs para esta fecha.');
      return;
    }

    // Ordenar por fecha DESC (más recientes primero)
    const sorted = response.Contents.sort(
      (a, b) => b.LastModified - a.LastModified
    );

    console.log(`\n${colors.bright}Últimos ${limit} logs para ${dateStr}:${colors.reset}\n`);

    for (const obj of sorted.slice(0, limit)) {
      const log = await readLogFile(obj.Key);
      if (log) {
        const status = colorizeStatus(log.status);
        const eventCount = log.eventCount || 0;
        const timestamp = log.timestamp.slice(11, 19); // HH:MM:SS
        console.log(
          `[${timestamp}] ${status} - Events: ${eventCount} - ${log.message || ''}`
        );
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function showStats(dateStr) {
  try {
    const prefix = getDatePath(dateStr);

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      console.log('No hay logs para esta fecha.');
      return;
    }

    // Leer todos y calcular estadísticas
    console.log(
      `\n${colors.bright}Estadísticas de logs para ${dateStr}:${colors.reset}\n`
    );

    const stats = {
      total: 0,
      OK: 0,
      WARNING: 0,
      CRITICAL: 0,
      ERROR: 0,
      avgEventCount: 0,
      minEventCount: Infinity,
      maxEventCount: 0,
      totalEventCount: 0,
    };

    for (const obj of response.Contents) {
      const log = await readLogFile(obj.Key);
      if (log) {
        stats.total++;
        stats[log.status] = (stats[log.status] || 0) + 1;
        const ec = log.eventCount || 0;
        stats.totalEventCount += ec;
        stats.minEventCount = Math.min(stats.minEventCount, ec);
        stats.maxEventCount = Math.max(stats.maxEventCount, ec);
      }
    }

    stats.avgEventCount = (stats.totalEventCount / stats.total).toFixed(2);

    console.log(`Total de reportes:     ${stats.total}`);
    console.log(`${colorizeStatus('OK')}:          ${stats.OK}`);
    console.log(`${colorizeStatus('WARNING')}:     ${stats.WARNING}`);
    console.log(`${colorizeStatus('CRITICAL')}:    ${stats.CRITICAL}`);
    console.log(`${colorizeStatus('ERROR')}:       ${stats.ERROR}`);
    console.log(`\nEventos por 10 segundos:`);
    console.log(`  Promedio:  ${colors.bright}${stats.avgEventCount}${colors.reset}`);
    console.log(`  Mínimo:    ${stats.minEventCount}`);
    console.log(`  Máximo:    ${stats.maxEventCount}`);
    console.log(`  Total:     ${stats.totalEventCount}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'today';

  try {
    if (command === 'stats') {
      const dateStr = args[1] || 'today';
      await showStats(dateStr);
    } else {
      await showLatestLogs(command);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
