# 🌐 Arquitectura de URLs - Migración Gradual

**Fecha**: 2 de marzo de 2026  
**Versión**: 1.0.0  
**Status**: Configurada para Opción 1 (Subdominio Separado)

---

## 📍 Situación Actual

```
Backend VIEJO (en producción):
  https://plataforma.fullcontrolgps.com.ar/servicio/v2/health
  
Arquitectura:
  Browser → Nginx (reverse proxy) → Backend viejo (PHP/legacy)
```

---

## 🎯 Estrategia de Migración: 3 Fases

### **FASE 1: Desarrollo + Testing (AHORA)**

**URLs Locales**:
```
Nuevo Backend:  http://localhost:3002    ← Local development
Viejo Backend:  https://plataforma...    ← O localhost:3000 si tienes

Frontend:       http://localhost:5173    ← Vite dev server
```

**Configuración**: `frontend-rastreo/.env.development`
```env
VITE_API_NEW_BACKEND=http://localhost:3002
VITE_API_OLD_BACKEND=https://plataforma.fullcontrolgps.com.ar
```

**Cómo testear**:
```bash
# Terminal 1 - Backend nuevo
cd backend-informes
npm run dev  # Escucha en :3002

# Terminal 2 - Frontend
cd frontend-rastreo
npm run dev  # Escucha en :5173

# Visitá http://localhost:5173 y testea RalentisTester
```

---

### **FASE 2: Staging/QA en EC2 (PRÓXIMA SEMANA)**

**URLs en EC2 - Opción 1 (RECOMENDADA): Subdominio Separado**

```
Backend VIEJO:  https://plataforma.fullcontrolgps.com.ar
Backend NUEVO:  https://api-v2.fullcontrolgps.com.ar      ← TEMPORAL
Frontend:       https://plataforma.fullcontrolgps.com.ar  ← Mismo origen
```

**Configuración**: `frontend-rastreo/.env.production`
```env
VITE_API_NEW_BACKEND=https://api-v2.fullcontrolgps.com.ar
VITE_API_OLD_BACKEND=https://plataforma.fullcontrolgps.com.ar
```

**Ventajas**:
- ✅ Backend nuevo totalmente aislado
- ✅ Rollback es cambiar DNS (segundos)
- ✅ Testing limpio en paralelo
- ✅ Sin impacto en producción actual

**Nginx Config** (en EC2):
```nginx
# api-v2.fullcontrolgps.com.ar
server {
    listen 443 ssl;
    server_name api-v2.fullcontrolgps.com.ar;
    
    location / {
        proxy_pass http://localhost:3002;  # Backend nuevo
    }
}

# plataforma.fullcontrolgps.com.ar (sin cambios)
server {
    listen 443 ssl;
    server_name plataforma.fullcontrolgps.com.ar;
    
    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend viejo (si existe en mismo servidor)
    location /servicio/ {
        proxy_pass http://localhost:3000;
    }
}
```

---

### **FASE 3: Producción - Una Vez Validado (MES 2)**

**Opción A: Mantener Subdominio Dedicado (Recomendado a largo plazo)**
```
Backend NUEVO:  https://api-v2.fullcontrolgps.com.ar  ← Permanente
Backend VIEJO:  https://plataforma.fullcontrolgps.com.ar  ← Deprecar
```

**Opción B: Migración Completa (Después de deprecar viejo)**
```
Backend NUEVO:  https://plataforma.fullcontrolgps.com.ar
Backend VIEJO:  Desconectado
```

---

## 🔀 Cambiar Entre Backends (SIN REDEPLOY)

### Desarrollo Local
Edita `frontend-rastreo/src/config/apiConfig.js`:

```javascript
const ENDPOINT_MAP = {
  ralentis: 'new',    // ← Cambiar a 'old' para usar viejo
  informes: 'old',
  conductores: 'old',
};
```

Hot reload automático, no necesita restart de Vite.

### Producción
Edita `frontend-rastreo/src/config/apiConfig.js`:

```javascript
const ENDPOINT_MAP = {
  ralentis: 'old',    // ← Cambiar a 'new' cuando esté listo
};
```

Deploy: `./scripts/deploy-frontend.sh` (2 minutos)

---

## 📊 Tabla de Configuración

| Ambiente | Frontend | Backend NEW | Backend OLD | Config File |
|----------|----------|-------------|-------------|-------------|
| **Local Dev** | localhost:5173 | localhost:3002 | https://plat... | .env.development |
| **Staging** | https://plat... | https://api-v2... | https://plat... | .env.production |
| **Production** | https://plat... | https://api-v2... | https://plat... | .env.production |

---

## 🔧 Configuración del Backend Nuevo

**Archivo**: `backend-informes/.env`

```env
# Entorno
NODE_ENV=development

# Database (RDS)
DB_HOST=prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=isis
DB_USER=isis
DB_PASSWORD=tupassword

# AWS Secrets (en producción)
USE_AWS_SECRETS=true
AWS_REGION=us-east-1
SECRET_NAME=basededatosisis

# Servidor
API_PORT=3002        ← Puerto que escucha

# CORS (importante para que frontend pueda acceder)
CORS_ORIGIN=http://localhost:5173,https://plataforma.fullcontrolgps.com.ar,https://api-v2.fullcontrolgps.com.ar

# Logging
LOG_LEVEL=info
```

**Importante**: El `CORS_ORIGIN` debe incluir todos los orígenes que van a acceder al backend.

---

## ✅ Checklist de Configuración

- [ ] **Desarrollo Local**
  - [ ] `backend-informes/.env` → `API_PORT=3002`
  - [ ] `frontend-rastreo/.env.development` → URLs locales
  - [ ] Ejecutar `npm run dev` en ambas carpetas
  - [ ] Probar http://localhost:5173 → RalentisTester

- [ ] **Staging EC2** (segundo paso)
  - [ ] DNS: `api-v2.fullcontrolgps.com.ar` apunta a EC2
  - [ ] Nginx: Server block para `api-v2.fullcontrolgps.com.ar`
  - [ ] `frontend-rastreo/.env.production` con URLs correctas
  - [ ] Deploy: `./scripts/deploy.sh`
  - [ ] Testar: https://api-v2.fullcontrolgps.com.ar/servicio/v2/health
  - [ ] Testar: https://plataforma... debe seguir funcionando

- [ ] **Producción**
  - [ ] Backend nuevo validado en staging
  - [ ] QA aprobó funcionalidades
  - [ ] Plan de rollback documentado
  - [ ] Deploy a producción

---

## 🧪 Testing: Verificar URLs

### Local
```bash
# Backend nuevo
curl http://localhost:3002/servicio/v2/health
# Esperado: { "ok": true, ... }

# Frontend
curl http://localhost:5173
# Esperado: HTML de React
```

### Producción
```bash
# Backend nuevo
curl https://api-v2.fullcontrolgps.com.ar/servicio/v2/health
# Esperado: { "ok": true, ... }

# Backend viejo (debe seguir funcionando)
curl https://plataforma.fullcontrolgps.com.ar/servicio/v2/health
# Esperado: { "ok": true, ... }

# Frontend
curl https://plataforma.fullcontrolgps.com.ar
# Esperado: HTML con React
```

---

## 🔄 Rollback en Cualquier Momento

### Si hay problema con nuevo backend:
```javascript
// frontend-rastreo/src/config/apiConfig.js
const ENDPOINT_MAP = {
  ralentis: 'old',  // ← Volver al viejo
};
```

Deploy: `./scripts/deploy-frontend.sh`

**Tiempo total**: 2-5 minutos

---

## 📚 Referencias Técnicas

### Qué escucha cada backend
- **Viejo**: `https://plataforma.fullcontrolgps.com.ar`
- **Nuevo**: 
  - Local: `http://localhost:3002`
  - Staging: `https://api-v2.fullcontrolgps.com.ar`
  - (Mismo backend, diferente URL según entorno)

### Rutas disponibles en nuevo backend
```
GET  /servicio/v2/health           (Health check)
GET  /api/ralentis                 (Ralentís)
GET  /api/ralentis/id/:id          (Ralentí específico)
GET  /api/ralentis/all?limit=100   (Todos)
GET  /api/informes                 (Informes - placeholder)
```

### CORS: Por qué es importante
El frontend (en `plataforma.fullcontrolgps.com.ar`) necesita acceder al backend (en `api-v2.fullcontrolgps.com.ar`). Para eso, el backend debe permitir esa origin en CORS:

```env
CORS_ORIGIN=https://api-v2.fullcontrolgps.com.ar,https://plataforma.fullcontrolgps.com.ar
```

---

## 🎯 Próximas Acciones

### **Hoy**: Testing Local
1. Ajustar `.env.development` (ya hecho)
2. Correr `npm run dev` en backend-informes y frontend-rastreo
3. Verificar que `http://localhost:5173` funciona

### **Esta Semana**: Deploy a Staging
1. Configurar DNS para `api-v2.fullcontrolgps.com.ar`
2. Desplegar backend nuevo a EC2
3. Desplegar frontend a EC2
4. QA testa contra staging

### **Próximas Semanas**: Producción
1. Validar que todo funciona en staging
2. Cambiar ENDPOINT_MAP a 'new' cuando esté ready
3. Deploy a producción
4. Monitorear

---

**Documento creado**: 2 de marzo de 2026  
**Versión**: 1.0.0  
**Status**: Listo para implementación
