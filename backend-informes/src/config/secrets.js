/**
 * Gestión centralizada de secretos
 * Soporta:
 * - AWS Secrets Manager (producción)
 * - Variables de entorno locales (desarrollo)
 * - Fallback a .env
 */

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import dotenv from 'dotenv';

dotenv.config();

const ENV = process.env.NODE_ENV || 'development';
const USE_AWS_SECRETS = process.env.USE_AWS_SECRETS === 'true';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const SECRET_NAME = process.env.SECRET_NAME || 'basededatosisis';

let secretsCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene secretos de AWS Secrets Manager
 */
async function fetchFromAWSSecrets() {
  try {
    const now = Date.now();
    if (secretsCache && (now - lastFetchTime) < CACHE_TTL) {
      console.log('[SECRETS] Usando cache de AWS Secrets Manager');
      return secretsCache;
    }

    console.log('[SECRETS] Obteniendo secretos de AWS Secrets Manager...');
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
      throw new Error('Secret retornado en formato binario (no soportado)');
    }

    secretsCache = secret;
    lastFetchTime = now;
    console.log('[SECRETS] ✓ Secretos obtenidos exitosamente de AWS');
    return secret;
  } catch (error) {
    console.error('[SECRETS] ✗ Error obteniendo AWS Secrets Manager:', error.message);
    console.error('[SECRETS] Usando variables de entorno como fallback');
    return null;
  }
}

/**
 * Obtiene secretos de variables de entorno
 */
function getFromEnvironment() {
  return {
    db_host: process.env.DB_HOST,
    db_port: process.env.DB_PORT,
    db_name: process.env.DB_NAME,
    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    api_port: process.env.API_PORT || 3002,
    log_level: process.env.LOG_LEVEL || 'info',
    cors_origin: process.env.CORS_ORIGIN || '*',
  };
}

/**
 * Mapea campos de AWS Secrets Manager a formato interno
 */
function mapAWSSecretFields(secret) {
  return {
    db_host: secret.host,
    db_port: secret.port,
    db_name: secret.database,
    db_user: secret.username,
    db_password: secret.password,
    api_port: secret.api_port || 3002,
    log_level: secret.log_level || 'info',
    cors_origin: secret.cors_origin || '*',
  };
}

/**
 * Obtiene configuración final (AWS o variables de entorno)
 */
export async function getSecrets() {
  console.log(`[CONFIG] Iniciando en modo: ${ENV}`);
  console.log(`[CONFIG] USE_AWS_SECRETS: ${USE_AWS_SECRETS}`);

  let secrets;

  if (USE_AWS_SECRETS && ENV === 'production') {
    const awsSecret = await fetchFromAWSSecrets();
    if (awsSecret) {
      secrets = mapAWSSecretFields(awsSecret);
    }
  }

  // Fallback a variables de entorno
  if (!secrets) {
    secrets = getFromEnvironment();
  }

  // Validar que tengamos lo mínimo necesario
  validateSecrets(secrets);

  return {
    db: {
      host: secrets.db_host,
      port: parseInt(secrets.db_port, 10),
      database: secrets.db_name,
      user: secrets.db_user,
      password: secrets.db_password,
      max: 20, // Pool máximo de conexiones
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    server: {
      port: parseInt(secrets.api_port, 10),
      env: ENV,
      corsOrigin: secrets.cors_origin,
    },
    logging: {
      level: secrets.log_level || 'info',
    },
  };
}

/**
 * Valida que los secretos requeridos estén presentes
 */
function validateSecrets(secrets) {
  const required = ['db_host', 'db_port', 'db_name', 'db_user', 'db_password'];
  const missing = required.filter(key => !secrets[key]);

  if (missing.length > 0) {
    throw new Error(
      `[CONFIG] Secretos faltantes: ${missing.join(', ')}. ` +
      `Configura variables de entorno o AWS Secrets Manager.`
    );
  }

  console.log('[CONFIG] ✓ Todos los secretos requeridos están presentes');
}

export default { getSecrets };
