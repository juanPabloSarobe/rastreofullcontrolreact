# Backend Informes - FullControl GPS v2

Backend de Node.js + Express para procesamiento y generación de informes.

## Inicio rápido

```bash
npm install
npm run dev
```

El servidor estará disponible en `http://localhost:3002`

## Estructura

```
src/
├── index.js              # Entrada principal
├── routes/               # Rutas de API (a crear)
├── controllers/          # Lógica de negocio (a crear)
├── middleware/           # Middlewares custom (a crear)
├── db/                   # Conexión a BD (a crear)
└── utils/                # Funciones auxiliares (a crear)
```

## Endpoints disponibles

- `GET /servicio/v2/health` - Health check
- `GET /api/informes` - Listar informes
- `POST /api/informes/generar` - Generar nuevo informe
- `GET /api/informes/:id` - Obtener informe específico

## Variables de entorno

Crear `.env`:

```
API_PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fullcontrol
DB_USER=postgres
DB_PASS=***
```
