# FullControl GPS - Monorepo Structure

## 📁 Estructura del Proyecto

Este es un **monorepo** que contiene múltiples servicios de la plataforma FullControl GPS:

```
rastreofullcontrolreact/
│
├── frontend-rastreo/          # 🚀 Frontend rastreo en tiempo real
│   ├── src/                   # Código fuente React
│   ├── public/                # Assets estáticos
│   ├── package.json          # Dependencias específicas
│   ├── vite.config.js        # Configuración Vite
│   └── index.html            # HTML principal
│
├── backend-informes/          # 🔧 Backend para procesamiento informes
│   ├── src/                   # Código fuente Node + Express
│   ├── package.json          # Dependencias específicas
│   └── .env                  # Variables de entorno
│
├── frontend-informes/         # 📊 Frontend para reportes
│   ├── src/                   # Código fuente React
│   ├── public/                # Assets estáticos
│   ├── package.json          # Dependencias específicas
│   ├── vite.config.js        # Configuración Vite
│   └── index.html            # HTML principal
│
├── docs/                      # 📚 Documentación general
├── README.md                  # Este archivo
├── package.json              # Scripts root (opcional)
└── .gitignore
```

---

## 🚀 Cómo Trabajar

### 1. **Frontend Rastreo** (Rastreo en tiempo real)
```bash
cd frontend-rastreo
npm install
npm run dev          # http://localhost:5173
npm run build        # Producción
```

### 2. **Backend Informes** (Procesa datos de informes)
```bash
cd backend-informes
npm install
npm run dev          # http://localhost:3002 (sugerido)
```

### 3. **Frontend Informes** (UI de reportes)
```bash
cd frontend-informes
npm install
npm run dev          # http://localhost:5174 (sugerido)
npm run build
```

---

## 🔄 Comunicación Entre Servicios

```
Cliente (browser)
├── Puerto 5173 ← frontend-rastreo
├── Puerto 5174 ← frontend-informes
│
└─→ Backend (porta 3002)
    ├── GET /api/informes
    ├── POST /api/informes/generar
    └── GET /api/informes/:id
```

---

## 📦 Dependencias Compartidas

- **React 19**: Ambos frontends
- **Express 4.18**: Backend
- **Vite**: Build tool (frontends)
- **Axios**: HTTP client
- **MUI**: UI components (Material-UI)
- **PostgreSQL**: Conexión a DB core (compartida)

---

## 🔐 Variables de Entorno

Crear `.env` en cada carpeta según necesites:

**backend-informes/.env:**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fullcontrol
DB_USER=postgres
DB_PASS=***
API_PORT=3002
```

**frontend-informes/.env:**
```
VITE_API_URL=http://localhost:3002/api
```

---

## ✅ Ventajas de esta Estructura

✅ **Independencia:** Cambios en informes no tocan rastreo  
✅ **Contexto global:** La IA ve todo a la vez  
✅ **Deploy flexible:** Cada uno puede deployarse por separado  
✅ **Escalabilidad:** Fácil agregar más microservicios  

---

## 🔗 Próximos Pasos

1. Coordinar puertos en dev (5173, 5174, 3002)
2. Crear middlewares de autenticación compartida
3. Documentar APIs
4. Setup de CI/CD

---

## 📝 Notas

- El backend-v2 existente en PHP queda paralelo (en producción)
- Esto es la **v2 moderna** del sistema
- La BD Core es compartida (no duplicada)
