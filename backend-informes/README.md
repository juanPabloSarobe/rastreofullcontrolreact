# Backend FullControl - Informes v2

API RESTful para generación y gestión de informes en FullControl GPS. Diseñado para escalar en AWS (EC2 + RDS).

## Características

✅ **Gestión de Secretos**
- AWS Secrets Manager para producción
- Variables de entorno para desarrollo
- Fallback automático

✅ **Base de Datos**
- PostgreSQL en RDS
- Pool de conexiones con reintentos
- Triggers y vistas automáticas

✅ **Logging y Monitoreo**
- Logger centralizado con 4 niveles
- Health checks con estado de BD
- Request logging automático

✅ **Estructura Modular**
- Separación de responsabilidades
- Fácil de escalar
- Testing listo para integrar

## Stack Técnico

- **Runtime**: Node.js (ES modules)
- **Framework**: Express
- **Database**: PostgreSQL v12+
- **Secrets**: AWS Secrets Manager
- **ORM**: pg (driver nativo)

## Estructura del Proyecto

```
backend-informes/
├── sql/
│   └── schema.sql              # Schema de BD
├── src/
│   ├── config/
│   │   └── secrets.js          # Gestión AWS Secrets Manager + .env
│   ├── db/
│   │   └── pool.js             # Pool PostgreSQL
│   ├── middleware/
│   │   ├── errorHandler.js     # Manejo centralizado de errores
│   │   └── requestLogger.js    # Logging de requests
│   ├── routes/
│   │   ├── health.js           # GET /servicio/v2/health
│   │   └── informes.js         # CRUD de informes
│   ├── services/
│   │   └── informeService.js   # Lógica de negocios
│   ├── utils/
│   │   └── logger.js           # Logger centralizado
│   └── index.js                # Punto de entrada
├── .env.example                # Template de variables
├── CONFIGURACION_AWS_SECRETS.md # Guía detallada
└── package.json
```

## Quick Start

### 1. Instalación

```bash
cd backend-informes
npm install
```

### 2. Configuración

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita con tus valores
nano .env
```

**Variables mínimas requeridas:**
```env
DB_HOST=tu-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=fullcontrol_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña
NODE_ENV=development
USE_AWS_SECRETS=false
```

### 3. Inicializar BD

Conecta a tu RDS y ejecuta:
```bash
psql -h tu-rds-endpoint.rds.amazonaws.com -U postgres -d fullcontrol_db < sql/schema.sql
```

### 4. Iniciar

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm start
```

**Output esperado:**
```
🚀 Iniciando Backend FullControl v2...

[CONFIG] Iniciando en modo: development
[DB] Pool inicializado exitosamente
✓ Servidor escuchando en http://localhost:3002
```

## API Endpoints

### Health Check
```bash
GET /servicio/v2/health
```
✅ Verifica que el backend y la BD estén disponibles

**Response:**
```json
{
  "ok": true,
  "service": "fullcontrol-backend-informes-v2",
  "timestamp": "2026-02-24T10:30:45.123Z",
  "database": {
    "connected": true,
    "timestamp": "2026-02-24T10:30:45.123Z"
  }
}
```

### Listar Informes
```bash
GET /api/informes?estado=completado&usuario_id=1
```

### Obtener Informe
```bash
GET /api/informes/:id
```

### Crear Informe
```bash
POST /api/informes
Content-Type: application/json

{
  "titulo": "Informe de Ventas Febrero",
  "descripcion": "Vendedores por zona",
  "usuario_id": 1
}
```

### Actualizar Informe
```bash
PUT /api/informes/:id
Content-Type: application/json

{
  "estado": "completado",
  "archivo_url": "https://s3.amazonaws.com/bucket/report.pdf"
}
```

## AWS Secrets Manager

### Para Desarrollo

Si quieres usar Secrets Manager desde tu máquina:

```bash
# Configura AWS
aws configure

# Crea el secreto
aws secretsmanager create-secret \
  --name fullcontrol/backend \
  --secret-string '{
    "db_host": "...",
    "db_port": "5432",
    ...
  }'

# En .env
USE_AWS_SECRETS=true
```

### Para Producción (EC2)

1. Asigna un IAM Role a la EC2 con acceso a Secrets Manager
2. En el EC2, el código auto-detecta las credenciales
3. Solo necesitas en `.env`:
   ```env
   NODE_ENV=production
   USE_AWS_SECRETS=true
   ```

**Ver:** [CONFIGURACION_AWS_SECRETS.md](./CONFIGURACION_AWS_SECRETS.md)

## Scripts

```bash
npm start         # Inicia en production
npm run dev       # Inicia con hot reload
npm run lint      # Ejecuta eslint
```

## Environment Variables

| Variable | Default | Descripción |
|----------|---------|-------------|
| `NODE_ENV` | development | Entorno (development, production) |
| `DB_HOST` | - | Endpoint de RDS |
| `DB_PORT` | 5432 | Puerto PostgreSQL |
| `DB_NAME` | - | Nombre de la base de datos |
| `DB_USER` | - | Usuario de BD |
| `DB_PASSWORD` | - | Contraseña de BD |
| `API_PORT` | 3002 | Puerto del servidor |
| `USE_AWS_SECRETS` | false | Usar AWS Secrets Manager |
| `AWS_REGION` | us-east-1 | Región AWS |
| `SECRET_NAME` | fullcontrol/backend | Nombre del secreto AWS |
| `CORS_ORIGIN` | * | Orígenes CORS permitidos |
| `LOG_LEVEL` | info | Nivel de logging (debug, info, warn, error) |

## Desarrollo

### Estructura del Código

- **services/**: Lógica de negocio
- **routes/**: Endpoints HTTP
- **middleware/**: Interceptores
- **config/**: Configuración centralizada
- **db/**: Acceso a datos
- **utils/**: Funciones auxiliares

### Agregar una Nueva Ruta

1. Crea el servicio en `src/services/`
2. Crea las rutas en `src/routes/`
3. Registra en `index.js`

```javascript
import miServicio from './routes/miservicio.js';
app.use('/api/miservicio', miServicio);
```

### Logging

```javascript
import { logger } from './utils/logger.js';

logger.info('Mensaje informativo');
logger.warn('Advertencia');
logger.error('Error critico', { datos: 'aquí' });
logger.debug('Debug detallado');
```

## Monitoreo

El backend incluye monitoring integrado:

- **Health Check**: `/servicio/v2/health` (verifica BD)
- **Request Logging**: Todos los requests se registran
- **Error Handling**: Errores centralizados con contexto
- **Connection Pooling**: Monitorea estado de conexiones

## Deployment en EC2

```bash
# En la EC2
git clone ...
cd backend-informes
npm install

# Configura .env
nano .env

# Usa PM2 para gestor de procesos
sudo npm install -g pm2
pm2 start src/index.js --name "fullcontrol-backend"
pm2 save
pm2 startup
```

## Troubleshooting

**Error: ECONNREFUSED en base de datos**
- Verifica que estés conectado a VPN
- Comprueba endpoint RDS en `.env`
- Verifica security group permite tu IP

**Error: AWS Secrets not found**
- Confirma `SECRET_NAME` correcto
- Verifica credenciales AWS (`aws sts get-caller-identity`)

**Error: puerto 3002 ya en uso**
- Cambia `API_PORT` en `.env`
- O mata el proceso: `lsof -i :3002`

## Roadmap

- [ ] Autenticación JWT
- [ ] Rate limiting
- [ ] Redis caching
- [ ] Alertas WhatsApp
- [ ] Reportes avanzados
- [ ] File upload a S3
- [ ] Webhooks

## Documentación Adicional

- [Configuración AWS Secrets Manager](./CONFIGURACION_AWS_SECRETS.md)
- [Schema de Base de Datos](./sql/schema.sql)

## Soporte

Para problemas o preguntas específicas, revisa los logs:
```bash
# Ver logs en tiempo real
tail -f logs/app.log

# En desarrollo, los logs aparecen en la consola
```

---

**Versión**: 2.0.0  
**Última actualización**: 24 de febrero de 2026

