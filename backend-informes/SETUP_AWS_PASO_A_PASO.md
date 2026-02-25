# Guía Paso a Paso: Configurar AWS Secrets Manager desde Cero

*Para usuarios que nunca han usado AWS o lo quieren hacer por primera vez*

## Prerequisitos

- ✅ Cuenta AWS activa
- ✅ Acceso a AWS Management Console
- ✅ AWS CLI instalado en tu máquina (`brew install awscli` en Mac)
- ✅ Tu RDS endpoint a mano

---

## PARTE 1: Configurar AWS CLI en Local

### 1.1 Instalar AWS CLI

**Mac:**
```bash
brew install awscli
```

**Windows:**
```bash
# Descarga desde: https://aws.amazon.com/cli/
# O con Chocolatey:
choco install awscli
```

**Linux:**
```bash
apt-get install awscli
```

### 1.2 Obtener Credenciales IAM

Ve a AWS Management Console → IAM → Users:

1. Haz click en tu usuario (o crea uno nuevo)
2. Ve a "Security credentials"
3. Crea una "Access key" si no tienes una
4. Copia:
   - Access Key ID: `AKIA...`
   - Secret Access Key: `xxxxx...`

⚠️ **IMPORTANTE**: Guarda esto en un lugar seguro, solo lo verás una vez.

### 1.3 Configurar AWS CLI

En tu terminal, ejecuta:

```bash
aws configure
```

Te pedirá:
```
AWS Access Key ID [None]: AKIA...
AWS Secret Access Key [None]: xxxxx...
AWS Default region name [None]: us-east-1
AWS Default output format [None]: json
```

**Regiones comunes:**
- `us-east-1` - Virginia (USA)
- `us-west-2` - Oregon (USA)
- `eu-west-1` - Irlanda
- `sa-east-1` - São Paulo (Brasil)

### 1.4 Verificar Configuración

```bash
aws sts get-caller-identity
```

**Output esperado:**
```json
{
    "UserId": "AIDAJ...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/tunombre"
}
```

Si ves esto, ¡las credenciales están configuradas! ✅

---

## PARTE 2: Crear Secreto en AWS Secrets Manager

### 2.1 (Opción A) Vía AWS Console

1. Ve a AWS Management Console
2. Busca "Secrets Manager" en la barra de búsqueda
3. Haz click en "Store a new secret"
4. Selecciona "Other type of secret"
5. En "Key/value pairs", agrega:
   - `db_host`: `tu-rds-endpoint.rds.amazonaws.com`
   - `db_port`: `5432`
   - `db_name`: `fullcontrol_db`
   - `db_user`: `postgres`
   - `db_password`: `tu_contraseña_rds`
   - `api_port`: `3002`
   - `log_level`: `info`
   - `cors_origin`: `*`
6. Haz click "Next"
7. Secret name: `fullcontrol/backend`
8. Final: "Store secret"

### 2.2 (Opción B) Vía AWS CLI (Recomendado)

```bash
aws secretsmanager create-secret \
  --name fullcontrol/backend \
  --secret-string '{
    "db_host": "tu-rds-endpoint.rds.amazonaws.com",
    "db_port": "5432",
    "db_name": "fullcontrol_db",
    "db_user": "postgres",
    "db_password": "tu_contraseña_rds",
    "api_port": "3002",
    "log_level": "info",
    "cors_origin": "*"
  }' \
  --region us-east-1
```

**Output:**
```json
{
    "ARN": "arn:aws:secretsmanager:us-east-1:123456789:secret:fullcontrol/backend-xxxxx",
    "Name": "fullcontrol/backend",
    "VersionId": "12345678-1234-1234-1234-123456789012"
}
```

### 2.3 Verificar que se Creó

```bash
aws secretsmanager list-secrets --region us-east-1
```

Deberías ver `fullcontrol/backend` en la lista.

### 2.4 Leer Secreto (Verificar contenido)

```bash
aws secretsmanager get-secret-value \
  --secret-id fullcontrol/backend \
  --region us-east-1
```

**Output:**
```json
{
    "ARN": "arn:aws:...",
    "Name": "fullcontrol/backend",
    "VersionId": "...",
    "SecretString": "{\"db_host\":\"...\",\"db_port\":\"5432\",...}",
    "VersionStages": ["AWSCURRENT"]
}
```

Si ves esto, ¡el secreto está guardado correctamente! ✅

---

## PARTE 3: Configurar Backend Local

### 3.1 Editar .env

En tu carpeta `backend-informes/`, edita `.env`:

```env
NODE_ENV=development
USE_AWS_SECRETS=true
AWS_REGION=us-east-1
SECRET_NAME=fullcontrol/backend
LOG_LEVEL=info
```

### 3.2 Instalar Dependencias

```bash
cd backend-informes
npm install
```

### 3.3 Probar Conexión

```bash
npm run dev
```

**Output esperado:**
```
🚀 Iniciando Backend FullControl v2...

[CONFIG] Iniciando en modo: development
[CONFIG] USE_AWS_SECRETS: true
[SECRETS] Obteniendo secretos de AWS Secrets Manager...
[SECRETS] ✓ Secretos obtenidos exitosamente de AWS
[DB] Inicializando pool de conexiones...
[DB] ✓ Pool inicializado exitosamente
✓ Servidor escuchando en http://localhost:3002
```

### 3.4 Probar Health Check

```bash
curl http://localhost:3002/servicio/v2/health | jq .
```

Deberías ver:
```json
{
  "ok": true,
  "service": "fullcontrol-backend-informes-v2",
  "database": {
    "connected": true
  }
}
```

¡Felicidades! Tu backend está conectado a AWS Secrets Manager! 🎉

---

## PARTE 4: Preparar para Producción (EC2)

### 4.1 Crear IAM Role para EC2

**En AWS Console:**

1. Ve a IAM → Roles
2. Click "Create role"
3. Selecciona "AWS service" → "EC2"
4. Click "Next"
5. En "Attach policies", busca y selecciona:
   - `AmazonEC2FullAccess` (o más restrictivo, ver abajo)
6. Crea una custom policy para Secrets Manager
7. Click "Create role"

**Policy Custom (Recomendado para Mayor Seguridad):**

En lugar de darle acceso a todo, crea esta policy:

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

Reemplaza `123456789` con tu Account ID (lo viste en `get-caller-identity`).

### 4.2 Asignar Role a tu EC2

1. Va a EC2 Dashboard → Instances
2. Haz click derecho en tu instancia
3. Security → Modify IAM role
4. Selecciona el role que creaste
5. Haz click Update

### 4.3 Configurar en EC2

```bash
# SSH a tu EC2
ssh -i tu-clave.pem ec2-user@tu-ip-ec2

# Clonar repositorio
git clone https://github.com/tuusuario/rastreofullcontrolreact.git
cd rastreofullcontrolreact/backend-informes

# Instalar dependencias
npm install

# Crear .env
cat > .env << EOF
NODE_ENV=production
USE_AWS_SECRETS=true
AWS_REGION=us-east-1
SECRET_NAME=fullcontrol/backend
LOG_LEVEL=warn
EOF

# Iniciar con PM2
sudo npm install -g pm2
pm2 start src/index.js --name "fullcontrol-backend"
pm2 save
pm2 startup
```

### 4.4 Verificar en Producción

```bash
curl http://tu-ip-ec2:3002/servicio/v2/health
```

¡Si funciona, tu backend está en producción! 🚀

---

## PARTE 5: Troubleshooting

### Error: "NoCredentialsError"

```
Problem: NoCredentialsError: Unable to locate credentials
```

**Solución:**
```bash
# Verifica que aws configure fue ejecutado
aws sts get-caller-identity

# Si no ves nada, configura de nuevo:
aws configure
```

### Error: "User is not authorized to perform iam..."

```
Problem: User: arn:aws:iam::... is not authorized
```

**Solución:**
- El tu IAM user no tiene permisos suficientes
- Pídele a un admin que agregue: `SecretsManager:GetSecretValue`

### Error: "AccessDenied en EC2"

```
Problem: EC2 no puede acceder al secreto
```

**Solución:**
- Verifica que el EC2 tiene el IAM Role asignado
- El role tiene la policy de Secrets Manager

### Error: "Secret not found"

```
Problem: secret not found
```

**Solución:**
```bash
# Verifica que el secreto existe:
aws secretsmanager list-secrets --region us-east-1

# Si no está, créalo de nuevo
```

---

## Checklist Final

- [ ] AWS CLI instalado: `aws --version`
- [ ] Credenciales configuradas: `aws sts get-caller-identity`
- [ ] Secreto creado: `aws secretsmanager get-secret-value --secret-id fullcontrol/backend`
- [ ] Backend local funciona: `npm run dev`
- [ ] Health check responde: `curl http://localhost:3002/servicio/v2/health`
- [ ] EC2 tiene IAM Role asignado (si hay)
- [ ] .env con `USE_AWS_SECRETS=true` en EC2 (si hay)

---

## Referencia Rápida

```bash
# Crear secreto
aws secretsmanager create-secret --name fullcontrol/backend --secret-string '{...}'

# Listar secretos
aws secretsmanager list-secrets

# Ver secreto
aws secretsmanager get-secret-value --secret-id fullcontrol/backend

# Actualizar secreto
aws secretsmanager update-secret --secret-id fullcontrol/backend --secret-string '{...}'

# Eliminar secreto
aws secretsmanager delete-secret --secret-id fullcontrol/backend
```

---

**¿Problemas?** Revisa:
- [CONFIGURACION_AWS_SECRETS.md](./CONFIGURACION_AWS_SECRETS.md)
- [ARQUITECTURA_SECRETOS.md](./ARQUITECTURA_SECRETOS.md)

**¡Éxito!** 🎉
