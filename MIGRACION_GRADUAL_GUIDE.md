# 🚀 Guía de Migración Gradual de Backend

> ⚠️ **Documento legado (v1)**
> Esta guía describe una etapa anterior basada en `/api/ralentis` y artefactos legacy.
> La versión vigente usa exclusivamente `v2` (`/api/ralentis-v2`) y está documentada en:
> - `backend-informes/CONFIGURACION_FINAL_RALENTI_V2.md`
> - `backend-informes/PLAN_RALENTI_V2_EVENTOS.md`

## Visión General

Este proyecto implementa un sistema de migración gradual de APIs. El frontend puede usar dinámicamente diferentes backends según la configuración, permitiendo:

- **Migrar endpoint por endpoint** sin downtime
- **Rollback instantáneo** si hay problemas
- **A/B testing** en producción
- **Despliegues independientes** de frontend y backend

## 📋 Estructura de Componentes

### Backend (`backend-informes/src`)

Nuevo backend v2 con arquitectura moderna:

```
src/
├── index.js              # Punto de entrada principal
├── config/              
│   └── secrets.js       # Gestión de secretos AWS
├── db/
│   └── pool.js          # Pool de conexiones PostgreSQL
├── middleware/          # Middlewares Express
├── routes/
│   ├── health.js        # Health checks
│   ├── informes.js      # Informes
│   └── ralentis.js      # ✨ Nuevo: Ralentís
├── services/
│   ├── informeService.js
│   └── ralentiService.js # ✨ Nuevo: Lógica de ralentís
└── utils/               # Utilities (logger, etc)
```

### Frontend (`frontend-rastreo/src`)

Sistema de configuración de APIs inteligente:

```
src/
├── config/
│   └── apiConfig.js          # ✨ Configuración centralizada
├── services/
│   └── ralentiService.js     # ✨ Servicio de ralentís
├── hooks/
│   └── useRalentis.js        # ✨ Hook para tomar datos de ralentís
└── ...
```

## 🔧 Cómo Funciona el Routing

### 1. Configuración de APIs (`apiConfig.js`)

```javascript
// Define qué backend usa cada endpoint
const ENDPOINT_MAP = {
  ralentis: 'new',      // Usa nuevo backend
  informes: 'old',      // Aún usa backend viejo
  conductores: 'old',   // Aún usa backend viejo
};

// URLs de backends
const API_URLS = {
  NEW_BACKEND: 'https://api-new.ejemplo.com',
  OLD_BACKEND: 'https://api-old.ejemplo.com',
};
```

### 2. Llamadas a API

```javascript
// El cliente no sabe cuál backend está usando
const ralentis = await getRalentisPorPatentes(patentes, desde, hasta);

// Internamente, la función apiFetch:
// 1. Busca el endpoint en ENDPOINT_MAP
// 2. Obtiene la URL base correspondiente
// 3. Hace el fetch
```

### 3. Cambiar de Backend

Para migrar un endpoint:

1. Editar `apiConfig.js`:
```javascript
const ENDPOINT_MAP = {
  ralentis: 'new',    // ✅ Migrado
  informes: 'new',    // ✅ Cambiar a 'new' cuando esté listo
};
```

2. Commit y deploy - ¡Sin cambiar código de componentes!

## 🧪 Testing Local

### Instalación

```bash
# Backend
cd backend-informes
npm install

# Frontend
cd frontend-rastreo
npm install
```

### Variables de Entorno

**Backend** (`backend-informes/.env`):
```bash
# Ver CONFIGURACION_AWS_SECRETS.md para detalles
```

**Frontend**:

- Desarrollo: `frontend-rastreo/.env.development`
- Producción: `frontend-rastreo/.env.production`

Valores de ejemplo:
```
VITE_API_NEW_BACKEND=http://localhost:3001
VITE_API_OLD_BACKEND=http://localhost:3000
```

### Ejecutar

```bash
# Terminal 1: Backend nuevo
cd backend-informes
npm run dev    # http://localhost:3001

# Terminal 2: Backend viejo (si necesitas)
# Ejecutar el backend viejo en puerto 3000

# Terminal 3: Frontend
cd frontend-rastreo
npm run dev    # http://localhost:5173
```

### Testing del Endpoint

Una vez que todo está corriendo:

1. Abrir `http://localhost:5173`
2. Testear los nuevos endpoints con las herramientas del navegador
3. Usar la consola para validar que todo funciona

## 📦 Despliegue a Producción

### Configuración Inicial

```bash
# Rellena datos de EC2 y SSH
./scripts/setup-deploy.sh

# Esto genera: scripts/.deploy.conf
```

### Desplegar

```bash
# Todo (frontend + backend)
./scripts/deploy.sh

# O individualmente
./scripts/deploy-backend.sh
./scripts/deploy-frontend.sh
```

### Qué hace el script de despliegue:

1. **Backend**: Copia código, instala dependencias, reinicia con PM2
2. **Frontend**: Build, copia archivos estáticos a Nginx
3. **Validación**: Verifica que el health check responde

### URLs en Producción

Actualizar `frontend-rastreo/.env.production`:
```
VITE_API_NEW_BACKEND=https://api-new.tudominio.com
VITE_API_OLD_BACKEND=https://api.tudominio.com
```

## 🔄 Workflow de Migración

### Ejemplo: Migrando el endpoint de Ralentís

**Paso 1: Desarrollo**
```
1. Crear endpoint en nuevo backend ✅
   - POST src/services/ralentiService.js
   - POST src/routes/ralentis.js
2. Crear servicio en frontend ✅
   - POST src/services/ralentiService.js
3. Testear con herramientas del navegador ✅
```

**Paso 2: Testing Local**
```
1. Correr backend viejo en puerto 3000
2. Correr backend nuevo en puerto 3001
3. Frontend contra 'old' = funciona como antes
4. Cambiar apiConfig: ralentis: 'new'
5. Frontend contra nuevo = verifica que funciona igual
```

**Paso 3: Testing en Staging/QA**
```
1. Desplegar código a staging
2. Apuntar VITE_API_NEW_BACKEND a backend nuevo
3. QA testa completamente
```

**Paso 4: Producción**
```
1. Desplegar código a producción
2. Cambiar ENDPOINT_MAP en apiConfig.js (si no estaba)
3. Frontend automáticamente usa nuevo backend
4. Si hay problema: revert de una línea en apiConfig.js
```

## 📊 Estado de Migraciones

| Endpoint | Status | Backend | Details |
|----------|--------|---------|---------|
| `ralentis` | ✅ Implementado | NEW | GET /api/ralentis |
| `informes` | 🔄 Planificado | OLD | Próximamente |
| `conductores` | 🔄 Planificado | OLD | Próximamente |

## 🆘 Troubleshooting

### El frontend no ve datos del nuevo backend

**Revisar**:
1. ¿El backend está corriendo? `curl http://localhost:3001/servicio/v2/health`
2. ¿CORS está habilitado? Ver `index.js` en backend
3. ¿Las variables de entorno son correctas?
4. ¿El endpoint está en ENDPOINT_MAP?

### Error de CORS

En `backend-informes/src/index.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://tudominio.com'],
  credentials: true,
}));
```

### Rollback rápido

Si algo sale mal en producción:

```bash
# Cambiar EN CUALQUIER MOMENTO:
# frontend-rastreo/src/config/apiConfig.js

const ENDPOINT_MAP = {
  ralentis: 'old',  // ← Cambia aquí
};

# Deploy rápido:
./scripts/deploy-frontend.sh
```

## 📚 Documentación Relacionada

- [SETUP_AWS_PASO_A_PASO.md](../backend-informes/SETUP_AWS_PASO_A_PASO.md) - AWS setup
- [AUTENTICACION_JWT_MIGRACION.md](../backend-informes/AUTENTICACION_JWT_MIGRACION.md) - JWT en nuevo backend
- [README.md](../backend-informes/README.md) - Backend

## ❓ Preguntas Frecuentes

**P: ¿Puedo migrar solo algunos endpoints?**
R: Sí, ese es el propósito. El ENDPOINT_MAP te deja elegir endpoint por endpoint.

**P: ¿Qué pasa si el nuevo backend cae?**
R: Cambias `apiConfig.js` y redeploas. Toma minutos.

**P: ¿Puedo testear ambos backends en paralelo?**
R: Sí, crea dos servicios diferentes o agrega parámetro `?backend=old/new`.

**P: ¿Cómo hago A/B testing?**
R: Agrega lógica en `apiFetch()` para elegir random, o según user ID, etc.

---

**Última actualización**: 2 de marzo de 2026
