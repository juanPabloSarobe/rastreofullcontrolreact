# ✅ Checklist de Implementación - Migración Gradual v1

## 🎯 Objetivo
Crear un sistema de migración gradual de endpoints del backend, permitiendo probar e implementar un nuevo endpoint de ralentís.

---

## ✅ COMPLETADO

### Backend (backend-informes/)

- ✅ **Servicio de Ralentís**
  - Archivo: `src/services/ralentiService.js`
  - Funciones:
    - `getRalentisPorPatentes(patentes, fechaDesde, fechaHasta)` - Consulta DB con filtros
    - `getAllRalentis(limit)` - Obtiene todos sin filtros
    - `getRalentiById(id)` - Obtiene un registro
  - Query SQL: Realiza JOIN dinámico en tabla `public."informesRalentis"`

- ✅ **Rutas de Ralentís**
  - Archivo: `src/routes/ralentis.js`
  - Endpoints:
    - `GET /api/ralentis?patentes=["ABC123"]&fechaDesde=2024-01-01T00:00:00Z&fechaHasta=2024-01-31T23:59:59Z`
    - `GET /api/ralentis/id/:id`
    - `GET /api/ralentis/all?limit=100`

- ✅ **Integración en index.js**
  - Import de rutas: `import ralentisRoutes from './routes/ralentis.js';`
  - Registro: `app.use('/api/ralentis', ralentisRoutes);`

### Frontend (frontend-rastreo/)

- ✅ **Configuración Centralizada de APIs**
  - Archivo: `src/config/apiConfig.js`
  - Características:
    - Define URLs de backends (NEW y OLD)
    - Mapeo de endpoints a backends (`ENDPOINT_MAP`)
    - Función `getBackendUrl(endpoint)` para obtener URL dinámica
    - Función `apiFetch(endpoint, path, options)` para hacer requests

- ✅ **Variables de Entorno**
  - `.env.development` - Para desarrollo local
  - `.env.production` - Para producción
  - Variables:
    - `VITE_API_NEW_BACKEND` - URL del nuevo backend
    - `VITE_API_OLD_BACKEND` - URL del backend viejo

- ✅ **Servicio de Ralentís**
  - Archivo: `src/services/ralentiService.js`
  - Funciones:
    - `getRalentisPorPatentes(patentes, fechaDesde, fechaHasta)`
    - `getAllRalentis(limit)`
    - `getRalentiById(id)`
  - Usa `apiFetch()` internamente

- ✅ **Hook React: useRalentis**
  - Archivo: `src/hooks/useRalentis.js`
  - States: `loading`, `error`, `data`
  - Métodos: `fetchRalentisPorPatentes()`, `fetchAllRalentis()`, `fetchRalentiById()`

- ✅ **Componente de Testing**
  - Archivo: `src/components/RalentisTester.jsx`
  - Características:
    - Formulario para ingresar patentes y fechas
    - Tabla de resultados
    - Muestra configuración de APIs
    - Manejo de estados (loading, error, empty)

### Despliegue

- ✅ **Script de Despliegue del Backend**
  - Archivo: `scripts/deploy-backend.sh`
  - Acciones:
    - Compila e instala dependencias
    - Crea tarball
    - Sube a EC2 vía SCP
    - Ejecuta en EC2 (tar, npm install, pm2 restart)
    - Valida health check

- ✅ **Script de Despliegue del Frontend**
  - Archivo: `scripts/deploy-frontend.sh`
  - Acciones:
    - Build con Vite
    - Crea tarball de dist/
    - Sube a EC2
    - Copia a /var/www/html/
    - Recarga nginx

- ✅ **Script Maestro de Despliegue**
  - Archivo: `scripts/deploy.sh`
  - Orquesta ambos despliegues
  - Requiere: usuario, host, ruta

- ✅ **Script de Configuración**
  - Archivo: `scripts/setup-deploy.sh`
  - Genera `.deploy.conf` interactivamente
  - Datos: usuario SSH, host EC2, rutas, llave SSH

### Documentación

- ✅ **Guía Completa de Migración**
  - Archivo: `MIGRACION_GRADUAL_GUIDE.md`
  - Incluye:
    - Visión general del sistema
    - Estructura de carpetas
    - Cómo funciona el routing dinámico
    - Instrucciones de testing local
    - Instrucciones de despliegue
    - Workflow de migración paso a paso
    - Troubleshooting y FAQs

- ✅ **Este Checklist**
  - Archivo: `CHECKLIST_MIGRACION_V1.md`

---

## 📋 PENDIENTE PARA PRÓXIMAS FASES

### Fase 2: Testing en Producción
- [ ] Configurar URLs reales en EC2 (actualizar .env.production)
- [ ] Desplegar backend nuevo a EC2
- [ ] Desplegar frontend a EC2
- [ ] Validar endpoints en producción
- [ ] Configurar dominio/DNS

### Fase 3: Migración de Más Endpoints
- [ ] Endpoint de Informes
- [ ] Endpoint de Conductores
- [ ] Endpoint de Permisos
- [ ] [Otros según requiera]

### Fase 4: Autenticación y Seguridad
- [ ] JWT en nuevo backend (ver `AUTENTICACION_JWT_MIGRACION.md`)
- [ ] Validación de tokens en rutas nuevas
- [ ] Refresh tokens

### Fase 5: Optimizaciones
- [ ] Caching de resultados
- [ ] Paginación en endpoints
- [ ] Rate limiting
- [ ] Validación de inputs mejorada

### Fase 6: A/B Testing Avanzado
- [ ] Feature flags en DB
- [ ] Distribution de tráfico porcentaje
- [ ] Analytics de uso por backend

---

## 🧪 TESTING LOCAL - QUICK START

```bash
# 1. Setup
cd backend-informes && npm install && cd ..
cd frontend-rastreo && npm install && cd ..

# 2. Variables de entorno (ya están creadas)
# .env.development tiene valores de localhost

# 3. Correr servicios
# Terminal 1 - Backend nuevo (puerto 3001)
cd backend-informes && npm run dev

# Terminal 2 - Frontend (puerto 5173)
cd frontend-rastreo && npm run dev

# 4. Testing
# Abrir http://localhost:5173
# Importar RalentisTester
# Usar interfaz para buscar ralentís
```

---

## 🚀 DESPLIEGUE A PRODUCCIÓN - QUICK START

```bash
# 1. Configuración única (primera vez)
./scripts/setup-deploy.sh

# 2. Actualizar URLs en .env.production
# VITE_API_NEW_BACKEND=https://api-new.ec2-ip-o-dominio
# VITE_API_OLD_BACKEND=https://api.ec2-ip-o-dominio

# 3. Desplegar
./scripts/deploy.sh

# 4. Verificar en producción
# Frontend: https://ec2-ip-o-dominio
# Backend health: https://ec2-ip-o-dominio:3001/servicio/v2/health
```

---

## 🔀 CAMBIAR ENDPOINT - QUICK START

Para migrar un endpoint del backend viejo al nuevo:

```javascript
// frontend-rastreo/src/config/apiConfig.js

const ENDPOINT_MAP = {
  ralentis: 'new',      // ← Cambiar aquí
  informes: 'old',      // Aún usa viejo
};
```

Luego deploy:
```bash
./scripts/deploy-frontend.sh
```

**Tiempo total**: ~2 minutos
**Rollback**: Cambiar línea + deploy nuevamente

---

## 📊 Estado del Sistema

| Componente | Status | Notas |
|-----------|--------|-------|
| Backend - Ralentís | ✅ Listo | GET /api/ralentis |
| Frontend - Config APIs | ✅ Listo | Dinámico por endpoint |
| Frontend - Servicio | ✅ Listo | Usa configuración |
| Frontend - Hook | ✅ Listo | useRalentis |
| Frontend - Testing | ✅ Listo | RalentisTester.jsx |
| Despliegue | ✅ Listo | Scripts preparados |
| Documentación | ✅ Listo | Guía completa |

---

## 🎯 Próxima Acción

1. **Testing Local**: Verificar que todo funciona en desarrollo
2. **Despliegue Staging**: Si existe ambiente de staging
3. **Despliegue Producción**: Usar scripts de deploy
4. **Validación**: Verificar endpoints en producción
5. **Configuración**: Actualizar URLs reales en .env.production

---

**Creado**: 2 de marzo de 2026
**Versión**: 1.0.0
**Estado**: ✅ Todos los componentes completados y listos para testing
