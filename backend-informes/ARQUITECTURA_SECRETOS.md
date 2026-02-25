# Arquitectura de Secretos - Technical Deep Dive

## Overview de Flujo

```
┌─────────────────────────────────────────────┐
│  Aplicación Backend (index.js)              │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │  getSecrets()        │
        │ (config/secrets.js)  │
        └──────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        ↓                     ↓
    ┌─────────────┐    ┌──────────────────────┐
    │ NODE_ENV &  │    │ USE_AWS_SECRETS=     │
    │ vars .env   │    │ true/false?          │
    └─────────────┘    └──────────┬───────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ↓                             ↓
            ┌─────────────────┐      ┌──────────────────────┐
            │ useEnv Vars     │      │ AWS Secrets Manager  │
            │ (.env local)    │      │ (credenciales IAM)   │
            └──────┬──────────┘      └──────────┬───────────┘
                   │                           │
                   └───────────────┬───────────┘
                                   ↓
                    ┌──────────────────────────┐
                    │ Pool Conexión PostgreSQL │
                    │ (config.db)              │
                    └──────────┬───────────────┘
                               ↓
                    ┌──────────────────────────┐
                    │ RDS (Base de Datos)      │
                    └──────────────────────────┘
```

## Flujo de Captura de Secretos

### 1. Development Mode (Local)

```javascript
// .env file
NODE_ENV=development
USE_AWS_SECRETS=false
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fullcontrol_db
DB_USER=postgres
DB_PASSWORD=my_password

// En config/secrets.js:
// 1. Lee las variables de proceso (cargadas por dotenv)
// 2. No intenta conectar a AWS
// 3. Retorna los valores directamente
```

**Ventajas:**
- ✅ Rápido (sin llamadas a AWS)
- ✅ No necesita credenciales AWS
- ✅ Ideal para desarrollo rápido

**Desventajas:**
- ❌ .env no debe commitearse (riesgo de seguridad)
- ❌ Secretos visibles en memoria

### 2. Production Mode (AWS + EC2)

```javascript
// .env en EC2
NODE_ENV=production
USE_AWS_SECRETS=true
AWS_REGION=us-east-1
SECRET_NAME=fullcontrol/backend

// En config/secrets.js:
// 1. Detecta USE_AWS_SECRETS=true
// 2. Inicializa SecretsManager de AWS SDK
// 3. Usa credenciales del IAM Role (asociado a la EC2)
// 4. Obtiene secreto de AWS Secrets Manager
// 5. Cachea el resultado por 5 minutos
// 6. Retorna los valores
```

**Ventajas:**
- ✅ Secretos cifrados en AWS
- ✅ Rotación automática posible
- ✅ Auditoría completa en CloudTrail
- ✅ No necesita credenciales hardcodeadas

**Desventajas:**
- ⚠️ Requiere IAM Role en EC2
- ⚠️ Requiere acceso de red a AWS Secrets Manager API

### 3. Development + AWS Secrets (Híbrido)

```javascript
// .env local
NODE_ENV=development
USE_AWS_SECRETS=true
AWS_REGION=us-east-1
SECRET_NAME=fullcontrol/backend

// Requiere:
// 1. $ aws configure (credenciales IAM)
// 2. VPN conectada (si RDS es privada)
// 3. Credenciales con permisos a getSecretValue
```

**Caso de uso:**
- Te conectas a VPN
- Ejecutas `aws configure` con tu IAM user
- El código obtiene secretos de AWS
- Conecta a RDS vía VPN
- Útil para testing antes de deploy

## Código: Flujo Paso a Paso

### Paso 1: Inicializar Secrets

```javascript
// src/config/secrets.js
const ENV = process.env.NODE_ENV || 'development';
const USE_AWS_SECRETS = process.env.USE_AWS_SECRETS === 'true';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
```

### Paso 2: Decidir Fuente

```javascript
if (USE_AWS_SECRETS && ENV === 'production') {
  // Opción A: AWS Secrets Manager
  secrets = await fetchFromAWSSecrets();
}

if (!secrets) {
  // Fallback: Variables de entorno
  secrets = getFromEnvironment();
}
```

### Paso 3: Obtener de AWS

```javascript
async function fetchFromAWSSecrets() {
  const client = new SecretsManager({ region: AWS_REGION });
  const response = await client.getSecretValue({
    SecretId: SECRET_NAME
  });
  
  return JSON.parse(response.SecretString);
}
```

### Paso 4: Validar Secretos

```javascript
function validateSecrets(secrets) {
  const required = ['db_host', 'db_port', 'db_name', 'db_user', 'db_password'];
  const missing = required.filter(key => !secrets[key]);
  
  if (missing.length > 0) {
    throw new Error(`Secretos faltantes: ${missing.join(', ')}`);
  }
}
```

### Paso 5: Retornar Configuración

```javascript
return {
  db: {
    host: secrets.db_host,
    port: parseInt(secrets.db_port, 10),
    database: secrets.db_name,
    user: secrets.db_user,
    password: secrets.db_password,
    max: 20,
  },
  server: {
    port: parseInt(secrets.api_port, 10),
    env: ENV,
    corsOrigin: secrets.cors_origin,
  }
};
```

## Caching de Secretos

Por rendimiento, cachea los secretos de AWS durante 5 minutos:

```javascript
let secretsCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

if (secretsCache && (now - lastFetchTime) < CACHE_TTL) {
  return secretsCache; // ✅ Usa cache
}

// Si cache expiró, obtiene nuevamente de AWS
const secret = await client.getSecretValue(...);
secretsCache = secret;
lastFetchTime = now;
```

## Manejo de Errores

```javascript
try {
  secrets = await fetchFromAWSSecrets();
} catch (error) {
  logger.error('AWS Secrets Manager error:', error);
  
  // Fallback automático a variables de entorno
  console.error('Usando .env como fallback');
  secrets = getFromEnvironment();
}
```

## Seguridad: Best Practices

### ✅ HACER:

1. **Nunca committear .env a git**
   ```bash
   # En .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Usar AWS Secrets Manager en producción**
   - Secretos cifrados
   - Rotación automática
   - Auditoría en CloudTrail

3. **Limitar IAM Permissions**
   ```json
   {
     "Effect": "Allow",
     "Action": ["secretsmanager:GetSecretValue"],
     "Resource": "arn:aws:secretsmanager:*:*:secret:fullcontrol/*"
   }
   ```

4. **Monitorear acceso a secretos**
   - CloudTrail logs
   - CloudWatch alarms

### ❌ NO HACER:

1. ❌ No commitees .env
2. ❌ No hardcodees secretos en el código
3. ❌ No uses IAM Access Keys en código (usa IAM Roles)
4. ❌ No loguees secretos completos

## Troubleshooting

### Error: "NoCredentialsError"

```bash
# Solución: Configura credenciales AWS
aws configure
# Ingresa Access Key ID
# Ingresa Secret Access Key
# Ingresa región (us-east-1)

# Verifica:
aws sts get-caller-identity
```

### Error: "AccessDenied" en AWS Secrets Manager

```bash
# Verifica que el IAM user tenga permiso:
aws secretsmanager get-secret-value --secret-id fullcontrol/backend

# Si falla, agrega política al IAM user
```

### Error: "Secret not found"

```bash
# Verifica que el secreto existe:
aws secretsmanager list-secrets

# Si no existe, créalo:
aws secretsmanager create-secret --name fullcontrol/backend --secret-string '{"db_host":"..."}'
```

### Error: Pool no conecta a BD

```bash
# 1. Verifica credenciales en .env o AWS Secrets
# 2. Verifica que RDS endpoint es accesible
# 3. Si es RDS privada, verifica VPN
# 4. Verifica Security Group de RDS permite tu IP
```

## Transición Dev → Production

1. **En local**: Usa `.env` con USE_AWS_SECRETS=false
2. **Crea secreto en AWS**: `aws secretsmanager create-secret --name fullcontrol/backend ...`
3. **Configura EC2**: Asigna IAM Role con permisos
4. **En EC2**: Usa .env con USE_AWS_SECRETS=true
5. **Redeploy**: Git pull + npm start
6. **Verifica**: `curl http://ec2-ip:3002/servicio/v2/health`

## Diagrama de Permiso IAM

```
┌──────────────┐
│   IAM User   │  (Tu cuenta personal)
│ (Local)      │
└──────┬───────┘
       │ aws configure
       │ .env: USE_AWS_SECRETS=true
       ↓
┌──────────────────────────────┐
│ AWS Secrets Manager          │
│ (getSecretValue permission)  │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ Secret: fullcontrol/backend  │
│ {db_host, db_port, ...}      │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ RDS (Base de Datos)          │
└──────────────────────────────┘


┌──────────────┐
│    EC2       │  (Servidor producción)
│  Instance    │
└──────┬───────┘
       │ Attached IAM Role
       │ (roleName: FullControlBackendRole)
       ↓
┌──────────────────────────────┐
│ AWS Secrets Manager          │
│ (getSecretValue permission)  │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ Secret: fullcontrol/backend  │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ RDS (Base de Datos)          │
└──────────────────────────────┘
```

---

## Próximo Paso

Ahora que entiendes la arquitectura:
1. Copia tu `.env.example` a `.env`
2. Ingresa tus credenciales RDS
3. Ejecuta: `npm run dev`
4. Verifica en `http://localhost:3002/servicio/v2/health`

¡Listo! El backend está andando.
