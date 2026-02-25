# Backend FullControl - Guía de Configuración AWS Secrets Manager

## Overview

El backend está configurado para soportar secretos desde dos fuentes:
1. **AWS Secrets Manager** - Recomendado para producción
2. **Variables de entorno (.env)** - Para desarrollo

## Configuración por Entorno

### 🖥️ DESARROLLO (Tu máquina local)

#### Opción A: Variables de Entorno (Recomendado para desarrollo rápido)

1. Crea un archivo `.env` en la raíz de `backend-informes/`:
```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales:
```env
NODE_ENV=development
DB_HOST=<tu-endpoint-rds-via-vpn>
DB_PORT=5432
DB_NAME=fullcontrol_db
DB_USER=<tu-usuario-rds>
DB_PASSWORD=<tu-contraseña-rds>
API_PORT=3002
USE_AWS_SECRETS=false
LOG_LEVEL=info
```

3. Instala dependencias:
```bash
npm install
```

4. Inicia en modo desarrollo:
```bash
npm run dev
```

#### Opción B: AWS Secrets Manager desde desarrollo + VPN

**Prerrequisitos:**
- Conectado a VPN
- AWS CLI configurado con credenciales IAM:
```bash
aws configure
# Ingresa tu Access Key ID y Secret Access Key
```

**Configuración:**
1. Crea el secreto en AWS Secrets Manager:
```bash
aws secretsmanager create-secret \
  --name fullcontrol/backend \
  --secret-string '{
    "db_host": "tu-rds-endpoint.rds.amazonaws.com",
    "db_port": "5432",
    "db_name": "fullcontrol_db", 
    "db_user": "postgres",
    "db_password": "tu-contraseña",
    "api_port": "3002",
    "log_level": "info",
    "cors_origin": "*"
  }' \
  --region us-east-1
```

2. En tu `.env`:
```env
NODE_ENV=development
USE_AWS_SECRETS=true
AWS_REGION=us-east-1
SECRET_NAME=fullcontrol/backend
LOG_LEVEL=info
```

3. Inicia:
```bash
npm run dev
```

---

### 🚀 PRODUCCIÓN (EC2 AWS)

#### Configuración de Secrets Manager

1. **En tu máquina local**, crea el secreto:
```bash
aws secretsmanager create-secret \
  --name fullcontrol/backend \
  --secret-string '{
    "db_host": "fullcontrol-prod.cxxxxxx.rds.amazonaws.com",
    "db_port": "5432",
    "db_name": "fullcontrol_db",
    "db_user": "postgres",
    "db_password": "contraseña-super-fuerte-aquí",
    "api_port": "3002",
    "log_level": "info",
    "cors_origin": "https://tudominio.com"
  }' \
  --region us-east-1
```

2. **En la EC2**, configura el IAM Role para acceder al secreto:
   - Asigna un rol IAM a la EC2 con política:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789:secret:fullcontrol/backend-*"
    }
  ]
}
```

3. **En la EC2**, crea `.env`:
```env
NODE_ENV=production
USE_AWS_SECRETS=true
AWS_REGION=us-east-1
SECRET_NAME=fullcontrol/backend
LOG_LEVEL=warn
```

4. **Despliega e inicia**:
```bash
git clone ...
cd backend-informes
npm install
npm start
```

---

## Estructura de Secretos en AWS

```json
{
  "db_host": "endpoint-rds",
  "db_port": "5432",
  "db_name": "fullcontrol_db",
  "db_user": "postgres",
  "db_password": "password",
  "api_port": "3002",
  "log_level": "info",
  "cors_origin": "https://yourdomain.com,https://app.yourdomain.com"
}
```

**Notas:**
- `api_port`: Generalmente 3002 en EC2 (nginx reverse proxy en 443/80)
- `cors_origin`: Separa múltiples dominios con comas (sin espacios)
- `log_level`: `debug` en dev, `warn` en prod

---

## Instalación de Dependencias

```bash
cd backend-informes
npm install
```

Verifica que se instalen:
- `express` - Framework web
- `pg` - Driver PostgreSQL
- `@aws-sdk/client-secrets-manager` - SDK AWS
- `dotenv` - Manejo de .env

---

## Prueba Local

### 1. Health Check
```bash
curl http://localhost:3002/servicio/v2/health
```

### 2. Listar Informes
```bash
curl http://localhost:3002/api/informes
```

### 3. Crear Informe
```bash
curl -X POST http://localhost:3002/api/informes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Mi primer informe",
    "descripcion": "Descripción del informe",
    "usuario_id": 1
  }'
```

---

## Scripts Disponibles

```json
{
  "start": "node src/index.js",        // Producción
  "dev": "node --watch src/index.js",  // Desarrollo (hot reload)
  "lint": "eslint ."                   // Linting
}
```

---

## Troubleshooting

### ❌ "ECONNREFUSED" en pool de conexiones
- Verifica conexión VPN (si está activa)
- Comprueba credenciales RDS en .env
- Revisa que el security group de RDS permita tu IP

### ❌ "NoCredentialsError" con AWS Secrets Manager
- En local: Asegúrate de `aws configure` está hecho
- En EC2: Verifica que el EC2 tiene el IAM Role asignado
- Prueba: `aws sts get-caller-identity`

### ❌ "Secret not found"
- Verifica `SECRET_NAME` en .env
- Confirma que el secreto existe: `aws secretsmanager list-secrets`

### ❌ Puerto 3002 ya en uso
- Cambia en `.env`: `API_PORT=3003`
- O mata el proceso: `lsof -i :3002 | grep LISTEN | awk '{print $2}' | xargs kill -9`

---

## Próximas Fases

Esta es la base del backend. Próximamente agregaremos:
- [ ] Autenticación JWT
- [ ] Rate limiting
- [ ] Caching Redis
- [ ] Alertas (WhatsApp)
- [ ] Reportes avanzados
