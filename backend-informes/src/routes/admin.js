/**
 * Rutas de Administración - Dashboard
 * Endpoints para monitoreo de sistema, BD, email y acciones de instancia
 */

import dotenv from 'dotenv';
import express from 'express';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import axios from 'axios';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeInstanceStatusCommand,
  DescribeInstanceTypesCommand,
  DescribeVolumesCommand,
  RebootInstancesCommand,
} from '@aws-sdk/client-ec2';
import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
  ListMetricsCommand,
} from '@aws-sdk/client-cloudwatch';
import nodemailer from 'nodemailer';
import { getPool } from '../db/pool.js';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

dotenv.config();

const router = express.Router();
const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESTART_COOLDOWN_MS = 5 * 60 * 1000;
const LEGACY_RESTART_STATE_FILE = path.resolve(__dirname, '../../tmp/admin-restart-state.json');
const DEFAULT_RESTART_STATE_FILE = path.join(
  os.tmpdir(),
  'rastreofullcontrol',
  'admin-restart-state.json'
);
const RESTART_STATE_FILE = process.env.ADMIN_RESTART_STATE_FILE || DEFAULT_RESTART_STATE_FILE;
let lastRestartAtMs = 0;

// Logger simple
const logger = {
  info: (msg, data) => console.log(`[ADMIN] ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`[ADMIN WARN] ${msg}`, data || ''),
  error: (msg, data) => console.error(`[ADMIN ERROR] ${msg}`, data || ''),
  debug: (msg, data) => {
    if (process.env.DEBUG === 'true') {
      console.log(`[ADMIN DEBUG] ${msg}`, data || '');
    }
  },
};

function parseCookies(headerValue) {
  const cookies = {};
  if (!headerValue) return cookies;

  headerValue.split(';').forEach((cookie) => {
    const [rawKey, ...rest] = cookie.trim().split('=');
    if (!rawKey) return;
    cookies[rawKey] = decodeURIComponent(rest.join('='));
  });

  return cookies;
}

function isAllowedOrigin(req) {
  const allowedOrigins = [
    process.env.FRONTEND_ORIGIN,
    'https://plataforma.fullcontrolgps.com.ar',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean);

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (!origin && !referer) {
    return true;
  }

  try {
    const source = origin || new URL(referer).origin;
    return allowedOrigins.includes(source);
  } catch {
    return false;
  }
}

function formatDurationFromDate(startDate) {
  if (!startDate) return 'N/A';
  const ms = Date.now() - new Date(startDate).getTime();
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatDurationFromMs(elapsedMs) {
  const safeMs = Math.max(0, Number(elapsedMs) || 0);
  const totalMinutes = Math.floor(safeMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m`;
}

async function readLastRestartAtMs() {
  const candidates = [RESTART_STATE_FILE, LEGACY_RESTART_STATE_FILE].filter(
    (file, index, arr) => arr.indexOf(file) === index
  );

  for (const filePath of candidates) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      const ts = Number(parsed?.lastRestartAtMs || 0);
      if (Number.isFinite(ts) && ts > 0) {
        return ts;
      }
    } catch {
      // Continue with next candidate.
    }
  }

  return 0;
}

async function writeLastRestartAtMs(lastRestartMs) {
  const payload = {
    lastRestartAtMs: Number(lastRestartMs) || 0,
    updatedAt: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(RESTART_STATE_FILE), { recursive: true });
  await fs.writeFile(RESTART_STATE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
}

function getHourPrefix(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  return `communication-monitor/${year}/${month}/${day}/${hour}/`;
}

async function getLatestMetricValue(
  cloudwatchClient,
  {
    namespace,
    metricName,
    dimensions,
    statistic = 'Average',
    unit,
    period = 300,
    lookbackMinutes = 30,
  }
) {
  const command = new GetMetricStatisticsCommand({
    Namespace: namespace,
    MetricName: metricName,
    Dimensions: dimensions,
    StartTime: new Date(Date.now() - lookbackMinutes * 60 * 1000),
    EndTime: new Date(),
    Period: period,
    Statistics: [statistic],
    Unit: unit,
  });

  const response = await cloudwatchClient.send(command);
  const datapoints = (response?.Datapoints || []).sort(
    (a, b) => new Date(a.Timestamp) - new Date(b.Timestamp)
  );

  if (datapoints.length === 0) {
    return null;
  }

  return {
    value: datapoints[datapoints.length - 1][statistic],
    timestamp: datapoints[datapoints.length - 1].Timestamp,
  };
}

async function getCWAgentMetricValue(
  cloudwatchClient,
  {
    metricName,
    instanceId,
    statistic = 'Average',
    period = 300,
    lookbackMinutes = 30,
    preferredDimensions = {},
  }
) {
  try {
    const listResp = await cloudwatchClient.send(
      new ListMetricsCommand({
        Namespace: 'CWAgent',
        MetricName: metricName,
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
      })
    );

    const metrics = listResp?.Metrics || [];
    if (metrics.length === 0) {
      return null;
    }

    let selectedMetric = metrics[0];

    if (Object.keys(preferredDimensions).length > 0) {
      const found = metrics.find((m) => {
        const dimMap = Object.fromEntries((m.Dimensions || []).map((d) => [d.Name, d.Value]));
        return Object.entries(preferredDimensions).every(([name, value]) => dimMap[name] === value);
      });
      if (found) {
        selectedMetric = found;
      }
    }

    const result = await getLatestMetricValue(cloudwatchClient, {
      namespace: 'CWAgent',
      metricName,
      dimensions: selectedMetric.Dimensions || [],
      statistic,
      period,
      lookbackMinutes,
    });

    return result?.value ?? null;
  } catch (error) {
    logger.warn('No se pudo obtener métrica CWAgent', {
      metricName,
      error: error?.name || error?.message,
    });
    return null;
  }
}

async function getRecentMonitorObjects(s3, bucket, lookbackHours = 48) {
  const objects = [];

  for (let i = 0; i < lookbackHours; i++) {
    const date = new Date(Date.now() - i * 60 * 60 * 1000);
    const prefix = getHourPrefix(date);
    const { Contents = [] } = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: 60,
      })
    );

    const monitorFiles = Contents.filter(
      (obj) => obj.Key && obj.Key.includes('monitor-') && obj.Key.endsWith('.json')
    );

    objects.push(...monitorFiles);

    if (objects.length >= 20) {
      break;
    }
  }

  return objects;
}

async function resolveMonitorBucket(s3) {
  const candidates = [
    process.env.COMMUNICATION_LOG_BUCKET,
    process.env.S3_LOG_BUCKET,
    'fullcontrolgps-logs',
    'rastreofullcontrol-logs',
  ].filter(Boolean);

  const uniqueCandidates = [...new Set(candidates)];

  for (const bucket of uniqueCandidates) {
    try {
      await s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: 'communication-monitor/',
          MaxKeys: 1,
        })
      );
      return bucket;
    } catch (error) {
      logger.warn('Bucket no utilizable para monitor-logs', {
        bucket,
        error: error?.name || error?.message,
      });
    }
  }

  return null;
}

async function checkBackendHealth(url, timeoutMs = 4000) {
  const startedAt = Date.now();
  try {
    const response = await axios.get(url, {
      timeout: timeoutMs,
      validateStatus: () => true,
    });

    const durationMs = Date.now() - startedAt;
    const ok = response.status >= 200 && response.status < 300;

    return {
      url,
      ok,
      httpStatus: response.status,
      responseTimeMs: durationMs,
      payload: response.data,
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    return {
      url,
      ok: false,
      httpStatus: null,
      responseTimeMs: durationMs,
      error: error?.message || error?.code || 'request_failed',
    };
  }
}

async function checkBackendHealthWithFallback(urlCandidates, timeoutMs = 4000) {
  const tried = [];

  for (const url of urlCandidates.filter(Boolean)) {
    const result = await checkBackendHealth(url, timeoutMs);
    tried.push({
      url,
      ok: result.ok,
      httpStatus: result.httpStatus,
      error: result.error || null,
    });

    if (result.ok) {
      return {
        ...result,
        tried,
      };
    }
  }

  const last = tried[tried.length - 1] || {};
  return {
    url: last.url || null,
    ok: false,
    httpStatus: last.httpStatus || null,
    responseTimeMs: null,
    error: last.error || 'No se pudo conectar a ningún endpoint de health',
    tried,
  };
}

/**
 * Middleware: Solo administradores
 */
const adminOnly = (req, res, next) => {
  // Por defecto solo confiar en cookies/sesión del navegador.
  // Fallback por header deshabilitado salvo que se habilite explícitamente por entorno.
  const cookies = parseCookies(req.headers.cookie);
  const roleFromCookie = cookies.rol;
  const roleFromHeader = req.headers['x-user-role'];
  const allowRoleHeader = process.env.ADMIN_ALLOW_ROLE_HEADER === 'true';
  const rol = roleFromCookie || (allowRoleHeader ? roleFromHeader : undefined);
  
  logger.info('AdminOnly middleware - Verificando acceso', {
    roleFromCookie,
    roleFromHeader,
    allowRoleHeader,
    finalRol: rol,
  });
  
  if (rol !== 'Administrador') {
    logger.error('Acceso denegado - rol insuficiente', { rol });
    return res.status(403).json({ 
      error: 'Acceso denegado', 
      message: 'Solo administradores pueden acceder al dashboard',
      receivedRole: rol,
    });
  }
  
  next();
};

/**
 * GET /api/admin/system-status
 * Obtiene estado del sistema: uptime, CPU, memoria, disk
 */
router.get('/system-status', adminOnly, async (req, res) => {
  try {
    const instanceId = process.env.EC2_INSTANCE_ID || 'i-061ac6edbeef9e8da';
    const region = process.env.AWS_REGION || 'us-east-1';

    const ec2Client = new EC2Client({ region });
    const cloudwatchClient = new CloudWatchClient({ region });

    const [instanceResp, instanceStatusResp] = await Promise.all([
      ec2Client.send(
        new DescribeInstancesCommand({
          InstanceIds: [instanceId],
        })
      ),
      ec2Client.send(
        new DescribeInstanceStatusCommand({
          InstanceIds: [instanceId],
          IncludeAllInstances: true,
        })
      ),
    ]);

    const instance = instanceResp?.Reservations?.[0]?.Instances?.[0];
    const checks = instanceStatusResp?.InstanceStatuses?.[0];

    if (!instance) {
      return res.status(404).json({
        error: 'Instancia EC2 no encontrada',
        instanceId,
      });
    }

    const [instanceTypeResp, volumesResp, cpuMetricResp, cpuPeak1mResp, netInResp, netOutResp] = await Promise.all([
      ec2Client.send(
        new DescribeInstanceTypesCommand({
          InstanceTypes: [instance.InstanceType],
        })
      ),
      ec2Client.send(
        new DescribeVolumesCommand({
          Filters: [{ Name: 'attachment.instance-id', Values: [instanceId] }],
        })
      ),
      cloudwatchClient.send(
        new GetMetricStatisticsCommand({
          Namespace: 'AWS/EC2',
          MetricName: 'CPUUtilization',
          Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
          StartTime: new Date(Date.now() - 30 * 60 * 1000),
          EndTime: new Date(),
          Period: 300,
          Statistics: ['Average'],
          Unit: 'Percent',
        })
      ),
      cloudwatchClient.send(
        new GetMetricStatisticsCommand({
          Namespace: 'AWS/EC2',
          MetricName: 'CPUUtilization',
          Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
          StartTime: new Date(Date.now() - 10 * 60 * 1000),
          EndTime: new Date(),
          Period: 60,
          Statistics: ['Maximum'],
          Unit: 'Percent',
        })
      ),
      cloudwatchClient.send(
        new GetMetricStatisticsCommand({
          Namespace: 'AWS/EC2',
          MetricName: 'NetworkIn',
          Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
          StartTime: new Date(Date.now() - 30 * 60 * 1000),
          EndTime: new Date(),
          Period: 300,
          Statistics: ['Sum'],
          Unit: 'Bytes',
        })
      ),
      cloudwatchClient.send(
        new GetMetricStatisticsCommand({
          Namespace: 'AWS/EC2',
          MetricName: 'NetworkOut',
          Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
          StartTime: new Date(Date.now() - 30 * 60 * 1000),
          EndTime: new Date(),
          Period: 300,
          Statistics: ['Sum'],
          Unit: 'Bytes',
        })
      ),
    ]);

    const instanceType = instanceTypeResp?.InstanceTypes?.[0];
    const memoryMiB = instanceType?.MemoryInfo?.SizeInMiB;
    const memoryGiB = memoryMiB ? (memoryMiB / 1024).toFixed(1) : null;
    const volumeSizeGiB = (volumesResp?.Volumes || []).reduce((acc, v) => acc + (v.Size || 0), 0);

    const datums = (cpuMetricResp?.Datapoints || []).sort(
      (a, b) => new Date(a.Timestamp) - new Date(b.Timestamp)
    );
    const latestCpu = datums.length > 0 ? datums[datums.length - 1].Average : null;

    const cpuPeakDatums = (cpuPeak1mResp?.Datapoints || []).sort(
      (a, b) => new Date(a.Timestamp) - new Date(b.Timestamp)
    );
    const latestCpuPeak = cpuPeakDatums.length > 0 ? cpuPeakDatums[cpuPeakDatums.length - 1].Maximum : null;

    const netInDatums = (netInResp?.Datapoints || []).sort(
      (a, b) => new Date(a.Timestamp) - new Date(b.Timestamp)
    );
    const netOutDatums = (netOutResp?.Datapoints || []).sort(
      (a, b) => new Date(a.Timestamp) - new Date(b.Timestamp)
    );

    const latestNetInBytes = netInDatums.length > 0 ? Number(netInDatums[netInDatums.length - 1].Sum || 0) : 0;
    const latestNetOutBytes = netOutDatums.length > 0 ? Number(netOutDatums[netOutDatums.length - 1].Sum || 0) : 0;

    const volumeIds = (volumesResp?.Volumes || [])
      .map((v) => v.VolumeId)
      .filter(Boolean);

    let ebsReadBytes = 0;
    let ebsWriteBytes = 0;
    let ebsQueueAvg = 0;

    if (volumeIds.length > 0) {
      const ebsMetrics = await Promise.all(
        volumeIds.map(async (volumeId) => {
          const dimensions = [{ Name: 'VolumeId', Value: volumeId }];
          const [readResp, writeResp, queueResp] = await Promise.all([
            getLatestMetricValue(cloudwatchClient, {
              namespace: 'AWS/EBS',
              metricName: 'VolumeReadBytes',
              dimensions,
              statistic: 'Sum',
              unit: 'Bytes',
            }),
            getLatestMetricValue(cloudwatchClient, {
              namespace: 'AWS/EBS',
              metricName: 'VolumeWriteBytes',
              dimensions,
              statistic: 'Sum',
              unit: 'Bytes',
            }),
            getLatestMetricValue(cloudwatchClient, {
              namespace: 'AWS/EBS',
              metricName: 'VolumeQueueLength',
              dimensions,
              statistic: 'Average',
              unit: 'Count',
            }),
          ]);

          return {
            readBytes: Number(readResp?.value || 0),
            writeBytes: Number(writeResp?.value || 0),
            queue: Number(queueResp?.value || 0),
          };
        })
      );

      ebsReadBytes = ebsMetrics.reduce((acc, item) => acc + item.readBytes, 0);
      ebsWriteBytes = ebsMetrics.reduce((acc, item) => acc + item.writeBytes, 0);
      ebsQueueAvg = ebsMetrics.reduce((acc, item) => acc + item.queue, 0) / ebsMetrics.length;
    }

    const [memUsedPercent, swapUsedPercent, rootDiskUsedPercentPrimary, rootDiskUsedPercentFallback] = await Promise.all([
      getCWAgentMetricValue(cloudwatchClient, {
        metricName: 'mem_used_percent',
        instanceId,
        statistic: 'Average',
      }),
      getCWAgentMetricValue(cloudwatchClient, {
        metricName: 'swap_used_percent',
        instanceId,
        statistic: 'Average',
      }),
      getCWAgentMetricValue(cloudwatchClient, {
        metricName: 'disk_used_percent',
        instanceId,
        statistic: 'Average',
        preferredDimensions: { path: '/' },
      }),
      getCWAgentMetricValue(cloudwatchClient, {
        metricName: 'used_percent',
        instanceId,
        statistic: 'Average',
        preferredDimensions: { path: '/' },
      }),
    ]);

    const rootDiskUsedPercent =
      rootDiskUsedPercentPrimary !== null ? rootDiskUsedPercentPrimary : rootDiskUsedPercentFallback;

    const persistedLastRestartAt = await readLastRestartAtMs();
    if (persistedLastRestartAt > lastRestartAtMs) {
      lastRestartAtMs = persistedLastRestartAt;
    }

    const restartTracking = lastRestartAtMs > 0
      ? {
          lastRestartRequestedAt: new Date(lastRestartAtMs).toISOString(),
          uptimeSinceRestartRequest: formatDurationFromMs(Date.now() - lastRestartAtMs),
          source: 'dashboard_restart_endpoint',
          hasBaseline: true,
        }
      : {
          lastRestartRequestedAt: null,
          uptimeSinceRestartRequest: 'N/A',
          source: 'no_baseline',
          hasBaseline: false,
        };

    const apiStartedAt = new Date(Date.now() - process.uptime() * 1000).toISOString();

    const systemInfo = {
      instanceId,
      state: instance?.State?.Name || 'unknown',
      instanceType: instance?.InstanceType || 'unknown',
      availabilityZone: instance?.Placement?.AvailabilityZone || 'unknown',
      privateIp: instance?.PrivateIpAddress || 'N/A',
      publicIp: instance?.PublicIpAddress || 'N/A',
      launchTime: instance?.LaunchTime || null,
      uptime: formatDurationFromDate(instance?.LaunchTime),
      healthChecks: {
        systemStatus: checks?.SystemStatus?.Status || 'unknown',
        instanceStatus: checks?.InstanceStatus?.Status || 'unknown',
      },
      memory: {
        total: memoryGiB ? `${memoryGiB} GiB` : 'N/A',
        used: memUsedPercent !== null ? `${Number(memUsedPercent).toFixed(2)}%` : 'N/A',
        usedPercent: memUsedPercent !== null ? Number(memUsedPercent).toFixed(2) : 'N/A',
        source: 'EC2 instance type',
      },
      swap: {
        usedPercent: swapUsedPercent !== null ? Number(swapUsedPercent).toFixed(2) : 'N/A',
      },
      disk: {
        size: volumeSizeGiB ? `${volumeSizeGiB} GiB` : 'N/A',
        used: 'N/A',
        usage: rootDiskUsedPercent !== null ? `${Number(rootDiskUsedPercent).toFixed(2)}%` : 'N/A',
        rootUsedPercent: rootDiskUsedPercent !== null ? Number(rootDiskUsedPercent).toFixed(2) : 'N/A',
        volumeCount: volumesResp?.Volumes?.length || 0,
      },
      cpu: {
        cloudwatch5mAvgPercent: latestCpu !== null ? Number(latestCpu).toFixed(2) : 'N/A',
        cloudwatch1mMaxPercent: latestCpuPeak !== null ? Number(latestCpuPeak).toFixed(2) : 'N/A',
        source: 'CloudWatch',
      },
      network: {
        in5mBytes: latestNetInBytes,
        out5mBytes: latestNetOutBytes,
        in5mMB: Number(latestNetInBytes / (1024 * 1024)).toFixed(2),
        out5mMB: Number(latestNetOutBytes / (1024 * 1024)).toFixed(2),
      },
      ebs: {
        read5mBytes: ebsReadBytes,
        write5mBytes: ebsWriteBytes,
        read5mMB: Number(ebsReadBytes / (1024 * 1024)).toFixed(2),
        write5mMB: Number(ebsWriteBytes / (1024 * 1024)).toFixed(2),
        queueAvg5m: Number(ebsQueueAvg).toFixed(2),
      },
      hardware: {
        vcpu: instanceType?.VCpuInfo?.DefaultVCpus ?? 'N/A',
        networkPerformance: instanceType?.NetworkInfo?.NetworkPerformance || 'N/A',
      },
      cwAgent: {
        available:
          memUsedPercent !== null || swapUsedPercent !== null || rootDiskUsedPercent !== null,
      },
      apiProcess: {
        startedAt: apiStartedAt,
        uptime: formatDurationFromMs(process.uptime() * 1000),
      },
      restartTracking,
    };

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      system: systemInfo,
    });
  } catch (error) {
    logger.error('Error obteniendo estado del sistema', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/db-status
 * Obtiene estado de salud de la BD
 */
router.get('/db-status', adminOnly, async (req, res) => {
  try {
    const pool = getPool();

    const [
      connResult,
      sizeResult,
      maxConnResult,
      connStatsResult,
      longRunningResult,
      waitingResult,
      dbStatsResult,
    ] = await Promise.all([
      pool.query('SELECT NOW() AS time, version() AS version'),
      pool.query('SELECT pg_size_pretty(pg_database_size(current_database())) AS size, pg_database_size(current_database()) AS size_bytes'),
      pool.query("SELECT setting::int AS max_connections FROM pg_settings WHERE name = 'max_connections'"),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE state = 'active') AS active,
          COUNT(*) FILTER (WHERE state = 'idle') AS idle,
          COUNT(*) AS total
        FROM pg_stat_activity
        WHERE datname = current_database()
      `),
      pool.query(`
        SELECT COUNT(*)::int AS long_running
        FROM pg_stat_activity
        WHERE datname = current_database()
          AND state = 'active'
          AND now() - query_start > interval '30 seconds'
      `),
      pool.query(`
        SELECT COUNT(*)::int AS waiting
        FROM pg_stat_activity
        WHERE datname = current_database()
          AND wait_event_type IS NOT NULL
      `),
      pool.query(`
        SELECT
          round(
            CASE
              WHEN blks_hit + blks_read = 0 THEN 100
              ELSE (blks_hit::numeric / (blks_hit + blks_read)::numeric) * 100
            END,
            2
          ) AS cache_hit_ratio
        FROM pg_stat_database
        WHERE datname = current_database()
      `),
    ]);

    const maxConnections = Number(maxConnResult.rows[0]?.max_connections || 0);
    const activeConnections = Number(connStatsResult.rows[0]?.active || 0);
    const idleConnections = Number(connStatsResult.rows[0]?.idle || 0);
    const totalConnections = Number(connStatsResult.rows[0]?.total || 0);
    const waitingConnections = Number(waitingResult.rows[0]?.waiting || 0);
    const longRunningQueries = Number(longRunningResult.rows[0]?.long_running || 0);
    const connectionUsagePct =
      maxConnections > 0 ? Number(((totalConnections / maxConnections) * 100).toFixed(2)) : 0;

    const issues = [];
    let health = 'ok';

    if (connectionUsagePct >= 85) {
      health = 'critical';
      issues.push(`Uso de conexiones alto: ${connectionUsagePct}%`);
    } else if (connectionUsagePct >= 70) {
      health = 'warning';
      issues.push(`Uso de conexiones elevado: ${connectionUsagePct}%`);
    }

    if (longRunningQueries > 5) {
      health = health === 'critical' ? 'critical' : 'warning';
      issues.push(`Consultas largas activas: ${longRunningQueries}`);
    }

    if (waitingConnections > 10) {
      health = 'critical';
      issues.push(`Sesiones en espera altas: ${waitingConnections}`);
    }

    const dbInfo = {
      connected: true,
      health,
      issues,
      serverTime: connResult.rows[0].time,
      version: connResult.rows[0].version,
      size: sizeResult.rows[0].size,
      sizeBytes: Number(sizeResult.rows[0].size_bytes || 0),
      maxConnections,
      totalConnections,
      activeConnections,
      idleConnections,
      waitingConnections,
      longRunningQueries,
      connectionUsagePct,
      cacheHitRatioPct: Number(dbStatsResult.rows[0]?.cache_hit_ratio || 0),
    };

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbInfo,
    });
  } catch (error) {
    logger.error('Error obteniendo estado de BD', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/backends-health
 * Verifica health de backend v2 y backend legacy
 */
router.get('/backends-health', adminOnly, async (req, res) => {
  try {
    const backendV2Candidates = [
      process.env.BACKEND_V2_HEALTH_URL,
      'http://localhost:3003/servicio/v2/health',
      'http://localhost:3002/servicio/v2/health',
      'https://api-v2.fullcontrolgps.com.ar/servicio/v2/health',
    ];

    const backendLegacyCandidates = [
      process.env.BACKEND_LEGACY_HEALTH_URL,
      'http://localhost:3001/servicio/v2/health',
      'https://plataforma.fullcontrolgps.com.ar/servicio/v2/health',
    ];

    const [v2, legacy] = await Promise.all([
      checkBackendHealthWithFallback(backendV2Candidates),
      checkBackendHealthWithFallback(backendLegacyCandidates),
    ]);

    const summary = {
      total: 2,
      okCount: Number(v2.ok) + Number(legacy.ok),
      degraded: !(v2.ok && legacy.ok),
    };

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      summary,
      backends: {
        v2,
        legacy,
      },
    });
  } catch (error) {
    logger.error('Error obteniendo health de backends', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/monitor-logs
 * Obtiene últimos 5 logs del monitor desde S3
 */
router.get('/monitor-logs', adminOnly, async (req, res) => {
  try {
    const awsRegion = process.env.AWS_REGION || 'us-east-1';

    const s3 = new S3Client({ region: awsRegion });
    const bucket = await resolveMonitorBucket(s3);

    if (!bucket) {
      return res.status(400).json({
        error: 'No se pudo resolver un bucket S3 válido para communication-monitor',
        tried: [
          process.env.COMMUNICATION_LOG_BUCKET,
          process.env.S3_LOG_BUCKET,
          'fullcontrolgps-logs',
          'rastreofullcontrol-logs',
        ].filter(Boolean),
      });
    }

    const objects = await getRecentMonitorObjects(s3, bucket, 48);
    const sorted = objects
      .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified))
      .slice(0, 5);

    if (sorted.length === 0) {
      return res.json({ logs: [], message: 'No hay archivos monitor-*.json' });
    }

    const logs = [];
    for (const obj of sorted) {
      try {
        const { Body } = await s3.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: obj.Key,
          })
        );

        const content = await Body.transformToString();
        const parsed = JSON.parse(content);

        logs.push({
          timestamp: parsed.timestamp || new Date(obj.LastModified).toISOString(),
          status: parsed.status || 'UNKNOWN',
          eventCount: Number(parsed.eventCount || 0),
          message: parsed.message || parsed.status || 'sin mensaje',
          sourceKey: obj.Key,
        });
      } catch (error) {
        logger.error(`Error leyendo log ${obj.Key}`, error.message);
      }
    }

    res.json({
      status: 'ok',
      bucket,
      logsCount: logs.length,
      logs: logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    });
  } catch (error) {
    logger.error('Error obteniendo logs del monitor', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/run-monitor-manual
 * Ejecuta manualmente el monitor de comunicación (timeout 30s)
 */
router.post('/run-monitor-manual', adminOnly, async (req, res) => {
  try {
    const projectRoot = path.resolve(__dirname, '../../');
    const scriptPath = path.resolve(projectRoot, 'scripts/monitor-communication.mjs');

    const { stdout, stderr } = await execFileAsync('node', [scriptPath], {
      cwd: projectRoot,
      env: process.env,
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    });

    const lines = String(stdout || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const jsonLines = [];
    for (const line of lines) {
      try {
        jsonLines.push(JSON.parse(line));
      } catch {
        // ignorar líneas no JSON
      }
    }

    const result = jsonLines.length > 0 ? jsonLines[jsonLines.length - 1] : null;

    res.json({
      status: 'ok',
      message: 'Monitoreo manual ejecutado',
      monitorResult: result,
      stderr: stderr ? String(stderr).slice(-500) : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const timedOut = error?.killed || error?.signal === 'SIGTERM';
    if (timedOut) {
      return res.status(504).json({
        error: 'Timeout ejecutando monitoreo manual',
        timeoutSeconds: 30,
      });
    }

    logger.error('Error ejecutando monitoreo manual', error.message);
    res.status(500).json({
      error: error.message,
      stderr: error?.stderr ? String(error.stderr).slice(-500) : null,
    });
  }
});

/**
 * POST /api/admin/test-email
 * Envía un email de prueba
 */
router.post('/test-email', adminOnly, async (req, res) => {
  try {
    // Validar credenciales SMTP
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      return res.status(400).json({ error: 'SMTP no configurado' });
    }

    // Crear transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Enviar email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.COMMUNICATION_ALERT_EMAIL,
      subject: '✅ [TEST] Email desde Dashboard Admin',
      html: `
        <h2>✅ Prueba de Envío Exitosa</h2>
        <p>Este es un email de prueba generado desde el Dashboard de Administración.</p>
        <p><strong>Hora:</strong> ${new Date().toLocaleString('es-AR')}</p>
        <p style="color: #666; font-size: 12px;">Sistema de alertas funcionando correctamente.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info('Email de test enviado', { messageId: info.messageId });

    res.json({
      status: 'ok',
      message: 'Email enviado correctamente',
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error enviando email', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/restart-instance
 * Reinicia la instancia EC2
 * Body: { confirmationToken: "reiniciar" }
 */
router.post('/restart-instance', adminOnly, async (req, res) => {
  try {
    if (!isAllowedOrigin(req)) {
      return res.status(403).json({
        error: 'Origen no permitido para acción sensible',
      });
    }

    const { confirmationToken } = req.body;
    const normalizedToken = String(confirmationToken || '').trim().toLowerCase();

    // Validar token de confirmación
    if (normalizedToken !== 'reiniciar') {
      return res.status(400).json({ 
        error: 'Token de confirmación inválido',
        message: 'Debes escribir "reiniciar" para confirmar' 
      });
    }

    const instanceId = process.env.EC2_INSTANCE_ID || 'i-061ac6edbeef9e8da';
    const region = process.env.AWS_REGION || 'us-east-1';

    const persistedLastRestartAt = await readLastRestartAtMs();
    if (persistedLastRestartAt > lastRestartAtMs) {
      lastRestartAtMs = persistedLastRestartAt;
    }

    const now = Date.now();
    const elapsed = now - lastRestartAtMs;
    if (lastRestartAtMs > 0 && elapsed < RESTART_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((RESTART_COOLDOWN_MS - elapsed) / 1000);
      return res.status(429).json({
        error: 'Cooldown activo para reinicio',
        message: `Espera ${remainingSeconds} segundos antes de volver a reiniciar`,
      });
    }

    logger.info('Reiniciando instancia', { instanceId });

    const ec2Client = new EC2Client({ region });
    await ec2Client.send(
      new RebootInstancesCommand({
        InstanceIds: [instanceId],
      })
    );

    lastRestartAtMs = now;
    let trackingPersisted = true;
    try {
      await writeLastRestartAtMs(now);
    } catch (persistError) {
      trackingPersisted = false;
      logger.warn('No se pudo persistir restartTracking (reinicio enviado igual)', {
        error: persistError?.message,
        file: RESTART_STATE_FILE,
      });
    }
    logger.info('Comando de reinicio enviado por SDK', { instanceId, region });

    res.json({
      status: 'ok',
      message: 'Instancia reiniciándose...',
      instanceId,
      trackingPersisted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error reiniciando instancia', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/test-whatsapp
 * Placeholder para prueba WhatsApp (aún no implementado)
 */
router.post('/test-whatsapp', adminOnly, async (req, res) => {
  try {
    res.json({
      status: 'pending',
      message: 'WhatsApp no está configurado aún',
      note: 'Esta funcionalidad será implementada en Fase 3.2',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
