# 🚀 Primeros Pasos - Backend FullControl v2

**Tiempo estimado:** 15 minutos

## Opción A: Desarrollo Rápido (USA Variables de Entorno)

### Paso 1: Copiar configuración
```bash
cd backend-informes
cp .env.example .env
```

### Paso 2: Editar .env con tus credenciales RDS
```bash
nano .env
```

Busca y reemplaza:
```env
DB_HOST=tu-rds-endpoint.rds.amazonaws.com  # (via VPN)
DB_USER=postgres
DB_PASSWORD=tu-contraseña
DB_NAME=fullcontrol_db
NODE_ENV=development
USE_AWS_SECRETS=false  ← Importante
```

### Paso 3: Instalar y ejecutar
```bash
npm install
npm run dev
```

**Deberías ver:**
```
🚀 Iniciando Backend FullControl v2...
[CONFIG] Iniciando en modo: development
[DB] ✓ Pool inicializado exitosamente
✓ Servidor escuchando en http://localhost:3002
```

### Paso 4: Probar
```bash
# En otra terminal
curl http://localhost:3002/servicio/v2/health | jq .
```

✅ **¡Backend andando!**

---

## Opción B: Desarrollo Profesional (USA AWS Secrets Manager)

### Paso 1: Configurar AWS CLI
```bash
# Instalar (si no lo tienes)
brew install awscli

# Configurar
aws configure
# Ingresa Access Key ID
# Ingresa Secret Access Key
# Región: us-east-1
# Formato: json

# Verificar
aws sts get-caller-identity
```

### Paso 2: Crear secreto en AWS
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

### Paso 3: Configurar backend
```bash
cp .env.example .env
nano .env
```

```env
NODE_ENV=development
USE_AWS_SECRETS=true
AWS_REGION=us-east-1
SECRET_NAME=fullcontrol/backend
```

### Paso 4: Instalar y ejecutar
```bash
npm install
npm run dev
```

### Paso 5: Probar
```bash
curl http://localhost:3002/servicio/v2/health | jq .
```

✅ **¡Backend con AWS Secrets Manager!**

---

## Probar Todos los Endpoints

```bash
bash ejemplos-api.sh
```

Este script:
1. ✅ Health check
2. ✅ Listar informes
3. ✅ Crear informe
4. ✅ Obtener informe
5. ✅ Actualizar informe
6. ✅ Listar con filtros

---

## Inicializar Base de Datos (Primera Vez)

```bash
# Conectar a tu RDS y ejecutar:
psql -h tu-rds-endpoint.rds.amazonaws.com -U postgres -d fullcontrol_db < sql/schema.sql

# Esto crea:
# - Tabla: informes
# - Tabla: informes_generacion
# - Índices
# - Triggers
```

---

## Agregar Nuevo Endpoint (Ejemplo)

### 1. Crear servicio
Crea `src/services/miservicio.js`:
```javascript
export async function obtenerDatos() {
  const result = await query('SELECT * FROM datos');
  return result.rows;
}
```

### 2. Crear rutas
Crea `src/routes/miservicio.js`:
```javascript
import express from 'express';
import * as miServicio from '../services/miservicio.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const datos = await miServicio.obtenerDatos();
    res.json({ ok: true, data: datos });
  } catch (error) {
    next(error);
  }
});

export default router;
```

### 3. Registrar en index.js
```javascript
import miServicioRoutes from './routes/miservicio.js';
app.use('/api/miservicio', miServicioRoutes);
```

### 4. Probar
```bash
curl http://localhost:3002/api/miservicio
```

---

## Logging

```javascript
import { logger } from './utils/logger.js';

logger.info('Mensaje');      // INFO
logger.warn('Advertencia');  // WARN
logger.error('Error');       // ERROR
logger.debug('Debug data'); // DEBUG (solo en desarrollo)
```

En .env controla el nivel:
```env
LOG_LEVEL=debug    # debug, info, warn, error
```

---

## Scripts Disponibles

```bash
npm start         # Producción
npm run dev       # Desarrollo (hot reload)
npm run lint      # Verificar código
```

---

## Variables de Entorno (Referencia)

| Variable | Ejemplo | Requerido |
|----------|---------|-----------|
| `NODE_ENV` | development | Sí |
| `DB_HOST` | rds.amazonaws.com | Sí |
| `DB_PORT` | 5432 | Sí |
| `DB_NAME` | fullcontrol_db | Sí |
| `DB_USER` | postgres | Sí |
| `DB_PASSWORD` | xxxxx | Sí |
| `API_PORT` | 3002 | No (default 3002) |
| `USE_AWS_SECRETS` | false/true | No (default false) |
| `LOG_LEVEL` | info | No (default info) |

---

## Documentación Completa

Si necesitas más detalles:

1. **Primeros pasos con AWS:** [SETUP_AWS_PASO_A_PASO.md](./SETUP_AWS_PASO_A_PASO.md)
2. **Arquitectura detallada:** [ARQUITECTURA_SECRETOS.md](./ARQUITECTURA_SECRETOS.md)
3. **Configuración por entorno:** [CONFIGURACION_AWS_SECRETS.md](./CONFIGURACION_AWS_SECRETS.md)
4. **Índice de docs:** [DOCUMENTACION.md](./DOCUMENTACION.md)
5. **API completa:** [README.md](./README.md)

---

## Troubleshooting Rápido

**Error: ECONNREFUSED**
```
→ Verifica que estés en VPN
→ Verifica endpoint en .env
→ Verifica credenciales RDS
```

**Error: NoCredentialsError**
```
→ aws configure
```

**Error: Secret not found**
```
→ aws secretsmanager list-secrets
```

**Error: Puerto 3002 ocupado**
```
→ Cambia en .env: API_PORT=3003
```

---

## ¿Necesitas ayuda rápida?

| Pregunta | Respuesta |
|----------|-----------|
| ¿Cómo inicio el backend? | `npm run dev` |
| ¿Cómo creo un endpoint? | Ver sección "Agregar Nuevo Endpoint" arriba |
| ¿Dónde veo los logs? | En la consola cuando ejecutas `npm run dev` |
| ¿Cómo loggueo data? | Usa `logger.info()`, `logger.error()`, etc |
| ¿Cómo conecto a BD? | Importa `{ query }` desde `db/pool.js` |
| ¿Es seguro para producción? | Sí, with AWS Secrets Manager + IAM Roles |

---

## Próximo: Conectar con Frontend

1. El frontend hace requests a `http://localhost:3002/api/informes`
2. El backend responde con JSON
3. El frontend renderiza los datos

**Ejemplo en React:**
```javascript
async function getInformes() {
  const response = await fetch('http://localhost:3002/api/informes');
  const { data } = await response.json();
  setInformes(data);
}
```

---

**Versión:** 2.0.0  
**Creado:** 24 de febrero de 2026  

**¡Éxito en tu desarrollo!** 🚀
