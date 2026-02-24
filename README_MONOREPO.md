# FullControl GPS - Monorepo (v2 Moderna)

Este es el **monorepo** de FullControl GPS con arquitectura moderna desacoplada.

## 🎯 Estructura del Proyecto

```
rastreofullcontrolreact/
│
├── frontend-rastreo/              # 🚀 Rastreo en tiempo real (React)
│   ├── src/                       # Código React con componentes
│   ├── public/                    # Assets estáticos
│   ├── package.json               # Dependencias
│   └── vite.config.js             # Configuración Vite
│
├── backend-informes/              # 🔧 Backend informes (Node+Express)
│   ├── src/
│   │   └── index.js               # Servidor principal
│   ├── package.json               # Dependencias
│   └── .env.example               # Template variables entorno
│
├── frontend-informes/             # 📊 Reportes e informes (React)
│   ├── src/                       # Código React reports
│   ├── public/                    # Assets
│   ├── package.json               # Dependencias
│   └── vite.config.js             # Configuración Vite
│
├── docs/                          # 📚 Documentación general
├── MONOREPO_ESTRUCTURA.md         # Guía de estructura
└── README.md                      # Este archivo
```

---

## 🚀 Inicio Rápido

### 1. Frontend Rastreo (Rastreo en tiempo real)

```bash
cd frontend-rastreo
npm install
npm run dev        # http://localhost:5173 (o siguiente puerto disponible)
```

**Funcionalidades:**
- Mapa en tiempo real con positions de unidades
- Alertas y eventos en vivo
- Control de flotilla

---

### 2. Backend Informes (API para reportes)

```bash
cd backend-informes
npm install
cp .env.example .env    # Configurar variables
npm run dev             # http://localhost:3002
```

**Endpoints:**
- `GET /servicio/v2/health` - Health check
- `GET /api/informes` - Listar informes
- `POST /api/informes/generar` - Generar nuevo informe
- `GET /api/informes/:id` - Obtener informe específico

---

### 3. Frontend Informes (UI de reportes)

```bash
cd frontend-informes
npm install
npm run dev        # http://localhost:5174
```

**Funcionalidades:**
- Visualización de reportes
- Gráficos y análisis
- Descarga de informes PDF/Excel

---

## 🔄 Arquitectura de Comunicación

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente (Browser)                     │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────────────────┐ │
│  │ Frontend Rastreo │  │  Frontend Informes           │ │
│  │  (Port 5173)     │  │  (Port 5174)                 │ │
│  └──────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
            │                        │
            └────────────┬───────────┘
                         │
                    ┌────▼─────┐
                    │   ALB     │
                    │  (AWS)    │
                    └────┬──────┘
                         │
            ┌────────────┤
            │            │
    ┌───────▼──────┐   ┌─▼────────────┐
    │   Backend    │   │   API Legacy  │
    │ Informes v2  │   │   (PHP)       │
    │ (Port 3002)  │   │   (Port 80)   │
    └──────────────┘   └───────────────┘
            │
            └─────┬──────────┐
                  │          │
            ┌─────▼─┐  ┌─────▼──────┐
            │  Core │  │  RDS BD    │
            │ Java  │  │ PostgreSQL │
            │  8090 │  │            │
            └───────┘  └────────────┘
```

---

## 📦 Dependencias Compartidas

| Librería | Versión | Uso |
|----------|---------|-----|
| **React** | ^19.0.0 | Frontend framework |
| **Express** | ^4.18.2 | Backend framework |
| **MUI** | ^7.0.1 | UI Components (Rastreo) |
| **Vite** | ^6.2.0 | Build tool (Frontends) |
| **Axios** | ^1.7.7 | HTTP client |
| **PostgreSQL** | ^8.11.3 | DB Client (Backend) |

---

## 🔐 Configuración de Variables de Entorno

Cada servicio tiene un `.env.example`. Copiar y adaptar:

### Backend Informes (`.env`)
```bash
cp backend-informes/.env.example backend-informes/.env
```

Editar variables necesarias.

### Frontend Informes (`.env`)
```bash
cp frontend-informes/.env.example frontend-informes/.env
```

---

## ✅ Checklist de Desarrollo

- [ ] Clonar repo
- [ ] `npm install` en cada carpeta
- [ ] Configurar `.env` en backend y frontend informes
- [ ] Iniciar backend primero: `npm run dev` en `backend-informes/`
- [ ] Iniciar frontend rastreo: `npm run dev` en `frontend-rastreo/`
- [ ] Iniciar frontend informes: `npm run dev` en `frontend-informes/`
- [ ] Verificar puertos: 3002 (backend), 5173 (rastreo), 5174 (informes)

---

## 📝 Comandos Útiles

### Desarrollar cada servicio

```bash
# Terminal 1 - Backend
cd backend-informes && npm run dev

# Terminal 2 - Rastreo
cd frontend-rastreo && npm run dev

# Terminal 3 - Informes
cd frontend-informes && npm run dev
```

### Builds de producción

```bash
# Frontend Rastreo
cd frontend-rastreo && npm run build

# Frontend Informes
cd frontend-informes && npm run build

# Backend (node no necesita build)
# Se ejecuta directamente: npm start
```

---

## 🔍 Troubleshooting

### Puerto ocupado
```bash
# Encontrar qué está usando el puerto
lsof -i :5173
lsof -i :3002

# Matar el proceso
kill -9 <PID>
```

### Errores de dependencias
```bash
# Limpiar cache npm
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 🎓 Próximos Pasos

1. ✅ **Estructura lista** - Monorepo desacoplado
2. ⏳ Implementar endpoints de backend
3. ⏳ Conectar frontend-informes con backend-informes
4. ⏳ Migrar lógica de informes legacy
5. ⏳ Integración IA para alertas automáticas
6. ⏳ Plan de deployment a producción

---

## 📚 Documentación Adicional

- [MONOREPO_ESTRUCTURA.md](./MONOREPO_ESTRUCTURA.md) - Detalles de estructura
- [FullControl_Backend_v2_Summary.md](./docs/nuevas_funcionalidades/FullControl_Backend_v2_Summary.md) - Contexto v2
- [README rastreo](./frontend-rastreo/README.md) - Específico rastreo
- [README backend informes](./backend-informes/README.md) - Específico backend
- [README informes](./frontend-informes/README.md) - Específico frontend informes

---

## 🤝 Notas Importantes

- **No modificar** el backend v1 (PHP legacy) a menos que sea crítico
- **Backend-informes** comparte BD con Core Java
- **Cada servicio** es independiente pero visible a la IA
- **Cambios en back** → la IA puede actualizar front automáticamente

---

**Estado:** 🟢 Monorepo listo para desarrollo
