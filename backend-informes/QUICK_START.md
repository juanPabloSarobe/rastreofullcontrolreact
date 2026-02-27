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

El archivo ya tiene precargados los datos de tu RDS. Si usas variables de entorno en lugar de AWS Secrets Manager:
```env
NODE_ENV=development
USE_AWS_SECRETS=false  ← Cambiar a false para variables de entorno
DB_HOST=prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com
DB_USER=isis
DB_PASSWORD=mipassword
DB_NAME=isis
API_PORT=3002
LOG_LEVEL=info
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

## Opción B: Desarrollo Profesional (USA AWS Secrets Manager - RECOMENDADO)

### Paso 1: El secreto ya está creado
Tu secreto `basededatosisis` ya existe en AWS Secrets Manager:
- **Nombre:** basededatosisis
- **ARN:** arn:aws:secretsmanager:us-east-1:442042516496:secret:basededatosisis-hwwBPh
- **Contiene:** host, port, database, username, password, dbClusterIdentifier

### Paso 2: Configurar backend
```bash
cp .env.example .env
nano .env
```

El .env ya está configurado correctamente:
```env
NODE_ENV=development
USE_AWS_SECRETS=true          ← Usar AWS Secrets Manager
AWS_REGION=us-east-1
SECRET_NAME=basededatosisis   ← Nombre del secreto existente
LOG_LEVEL=info
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
[CONFIG] USE_AWS_SECRETS: true
[SECRETS] Obteniendo secretos de AWS Secrets Manager...
[SECRETS] ✓ Secretos obtenidos exitosamente de AWS
[DB] ✓ Pool inicializado exitosamente
✓ Servidor escuchando en http://localhost:3002
```

### Paso 4: Probar
```bash
curl http://localhost:3002/servicio/v2/health | jq .
```

✅ **¡Backend con AWS Secrets Manager!**

**Nota:** El código automáticamente detecta tus credenciales AWS (desde el IAM Role o desde `aws configure`)

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
# Conectar a tu RDS mediante psql
psql -h prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com \
     -U isis \
     -d isis < sql/schema.sql

# O manualmente:
psql -h prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com -U isis
# Ingresa contraseña: mipassword
# Luego en la terminal psql:
# \c isis
# \i sql/schema.sql

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
import { query } from '../db/pool.js';
import { logger } from '../utils/logger.js';

export async function obtenerDatos() {
  try {
    const result = await query('SELECT * FROM informes');
    logger.info(`Obtenidos ${result.rows.length} datos`);
    return result.rows;
  } catch (error) {
    logger.error('Error en obtenerDatos:', error);
    throw error;
  }
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

| Variable | Tu Valor | Requerido |
|----------|----------|-----------|
| `NODE_ENV` | development | Sí |
| `DB_HOST` | prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com | Sí |
| `DB_PORT` | 5432 | Sí |
| `DB_NAME` | isis | Sí |
| `DB_USER` | isis | Sí |
| `DB_PASSWORD` | mipassword | Sí |
| `USE_AWS_SECRETS` | true/false | No (default false) |
| `SECRET_NAME` | basededatosisis | No (si USA_AWS_SECRETS=true) |
| `API_PORT` | 3002 | No (default 3002) |
| `LOG_LEVEL` | info | No (default info) |
| `AWS_REGION` | us-east-1 | No (default us-east-1) |

---

## Documentación Completa

Si necesitas más detalles:

1. **Primeros pasos con AWS:** [SETUP_AWS_PASO_A_PASO.md](./SETUP_AWS_PASO_A_PASO.md)
2. **Arquitectura detallada:** [ARQUITECTURA_SECRETOS.md](./ARQUITECTURA_SECRETOS.md)
3. **Configuración por entorno:** [CONFIGURACION_AWS_SECRETS.md](./CONFIGURACION_AWS_SECRETS.md)
4. **Índice de docs:** [DOCUMENTACION.md](./DOCUMENTACION.md)
5. **API completa:** [README.md](./README.md)

**Tu Secreto:**
- Nombre: `basededatosisis`
- ARN: `arn:aws:secretsmanager:us-east-1:442042516496:secret:basededatosisis-hwwBPh`
- Ubicación: AWS Secrets Manager (us-east-1)

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
| ¿Cómo inicio el backend? | `npm install` luego `npm run dev` |
| ¿Qué secreto debo usar? | `basededatosisis` (ya existe en AWS) |
| ¿Cuál es mi endpoint RDS? | prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com |
| ¿User y pass de BD? | isis / mipassword |
| ¿De dónde vienen mis secretos? | AWS Secrets Manager (basededatosisis) |
| ¿Cómo creo un endpoint? | Ver sección "Agregar Nuevo Endpoint" arriba |
| ¿Dónde veo los logs? | En la consola cuando ejecutas `npm run dev` |
| ¿Cómo loggueo data? | Usa `logger.info()`, `logger.error()`, etc |
| ¿Cómo conecto a BD? | Importa `{ query }` desde `db/pool.js` |
| ¿Es seguro para producción? | Sí, con AWS Secrets Manager + IAM Roles |

---

## Próximo: Conectar con Frontend

El backend está listo. Ahora desde tu React frontend:

**Hook para obtener informes:**
```javascript
import { useEffect, useState } from 'react';

export function useInformes() {
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3002/api/informes')
      .then(res => res.json())
      .then(data => {
        setInformes(data.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { informes, loading, error };
}
```

**Uso en componente:**
```jsx
function ListarInformes() {
  const { informes, loading } = useInformes();
  
  if (loading) return <p>Cargando...</p>;
  
  return (
    <ul>
      {informes.map(inf => (
        <li key={inf.id}>{inf.titulo}</li>
      ))}
    </ul>
  );
}
```

**Crear informe:**
```javascript
async function crearInforme(titulo, descripcion) {
  const res = await fetch('http://localhost:3002/api/informes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo,
      descripcion,
      usuario_id: 1 // Tu usuario_id aquí
    })
  });
  return res.json();
}
```

---

**Versión:** 2.0.0  
**Creado:** 24 de febrero de 2026  

**¡Éxito en tu desarrollo!** 🚀
