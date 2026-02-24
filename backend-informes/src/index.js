import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/servicio/v2/health', (req, res) => {
  res.json({
    ok: true,
    service: 'fullcontrol-informes-v2',
    timestamp: new Date().toISOString(),
  });
});

// Placeholder endpoints
app.get('/api/informes', (req, res) => {
  res.json({
    message: 'GET /api/informes - Endpoint para listar informes',
    status: 'pending',
  });
});

app.post('/api/informes/generar', (req, res) => {
  res.json({
    message: 'POST /api/informes/generar - Endpoint para generar nuevo informe',
    status: 'pending',
  });
});

app.get('/api/informes/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    id,
    message: `GET /api/informes/${id} - Endpoint para obtener informe específico`,
    status: 'pending',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Backend Informes v2 iniciado en puerto ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/servicio/v2/health`);
});
