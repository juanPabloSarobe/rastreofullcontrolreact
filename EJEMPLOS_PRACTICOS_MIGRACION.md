# 📚 Ejemplos Prácticos - Sistema de Migración Gradual

## Ejemplo 1: Consultando Ralentís desde un Componente

### Opción A: Usando el Hook (Recomendado)

```jsx
import { useState } from 'react';
import useRalentis from '../hooks/useRalentis.js';

export default function MiComponente() {
  const [patentes, setPatentes] = useState(['ABC123', 'XYZ789']);
  const { data, loading, error, fetchRalentisPorPatentes } = useRalentis();

  const handleBuscar = async () => {
    try {
      const hoy = new Date();
      const hace7dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      await fetchRalentisPorPatentes(
        patentes,
        hace7dias.toISOString(),
        hoy.toISOString()
      );
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <button onClick={handleBuscar}>Buscar</button>
      {data && data.length > 0 && (
        <ul>
          {data.map((ralenti) => (
            <li key={ralenti.idRalenti}>
              {ralenti.IdMovil}: {ralenti.tiempoRalenti}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Opción B: Usando el Servicio Directamente

```jsx
import { getRalentisPorPatentes } from '../services/ralentiService.js';

export default function OtroComponente() {
  const [ralentis, setRalentis] = useState(null);

  const buscar = async () => {
    try {
      const resultados = await getRalentisPorPatentes(
        ['ABC123'],
        '2024-01-01T00:00:00Z',
        '2024-01-31T23:59:59Z'
      );
      setRalentis(resultados);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={buscar}>
      Buscar Ralentís
    </button>
  );
}
```

---

## Ejemplo 2: Migrando un Endpoint Completo

Supongamos que ahora queremos migrar el endpoint de "Informes".

### Paso 1: Crear Servicio en Backend Nuevo

Archivo: `backend-informes/src/services/informeService.js`

```javascript
import { query } from '../db/pool.js';
import { logger } from '../utils/logger.js';

export async function getInformesPorPersona(personaId, fechaDesde, fechaHasta) {
  try {
    const sql = `
      SELECT 
        id,
        titulo,
        descripcion,
        estado,
        fecha_creacion,
        usuario_id
      FROM informes
      WHERE usuario_id = $1
        AND fecha_creacion >= $2
        AND fecha_creacion <= $3
      ORDER BY fecha_creacion DESC
    `;

    const result = await query(sql, [personaId, fechaDesde, fechaHasta]);
    logger.info(`getInformesPorPersona: ${result.rows.length} registros`);
    return result.rows;
  } catch (error) {
    logger.error('Error en getInformesPorPersona:', error);
    throw error;
  }
}
```

### Paso 2: Crear Ruta en Backend Nuevo

Archivo: `backend-informes/src/routes/informes.js` (actualizar)

```javascript
import express from 'express';
import * as informeService from '../services/informeService.js';

const router = express.Router();

router.get('/por-persona/:personaId', async (req, res, next) => {
  try {
    const { personaId } = req.params;
    const { fechaDesde, fechaHasta } = req.query;

    const informes = await informeService.getInformesPorPersona(
      personaId,
      fechaDesde,
      fechaHasta
    );

    res.json({
      ok: true,
      data: informes,
      count: informes.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

### Paso 3: Crear Servicio en Frontend

Archivo: `frontend-rastreo/src/services/informeService.js`

```javascript
import { apiFetch } from '../config/apiConfig.js';

export async function getInformesPorPersona(personaId, fechaDesde, fechaHasta) {
  const params = new URLSearchParams({
    fechaDesde,
    fechaHasta,
  });

  const response = await apiFetch(
    'informes',
    `/api/informes/por-persona/${personaId}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.error}`);
  }

  return response.data || [];
}
```

### Paso 4: Actualizar Configuración

Archivo: `frontend-rastreo/src/config/apiConfig.js`

```javascript
const ENDPOINT_MAP = {
  ralentis: 'new',     // Ya migrado
  informes: 'new',     // ✨ Nuevo
};
```

### Paso 5: Usar en Componente

```jsx
import { getInformesPorPersona } from '../services/informeService.js';

export default function MisInformes() {
  const [informes, setInformes] = useState(null);

  const cargar = async () => {
    const datos = await getInformesPorPersona(
      123,  // personaId
      '2024-01-01T00:00:00Z',
      '2024-01-31T23:59:59Z'
    );
    setInformes(datos);
  };

  return (
    <>
      <button onClick={cargar}>Cargar Informes</button>
      {/* Mostrar informes... */}
    </>
  );
}
```

### Paso 6: Desplegar

```bash
# Deploy todo
./scripts/deploy.sh

# O solo frontend si solo cambió config
./scripts/deploy-frontend.sh
```

---

## Ejemplo 3: A/B Testing

### Testear ambos backends en paralelo

Modificar `apiConfig.js`:

```javascript
export async function apiFetch(endpoint, path, options = {}) {
  // A/B testing: 50% de usuarios en cada backend
  const backend = Math.random() > 0.5 ? 'new' : 'old';
  const backendType = endpoint === 'ralentis' ? backend : 'old';
  
  const baseUrl = API_URLS[backendType === 'new' ? 'NEW_BACKEND' : 'OLD_BACKEND'];
  
  // ... resto del código
}
```

O por user ID:

```javascript
export async function apiFetch(endpoint, path, options = {}) {
  const userId = getUserId(); // De contexto
  const backend = userId % 2 === 0 ? 'new' : 'old';
  
  // ... resto
}
```

---

## Ejemplo 4: Rollback Rápido

Si algo falla en producción:

### Método 1: Cambiar Configure Dinámicamente

```javascript
// frontend-rastreo/src/config/apiConfig.js

const ENDPOINT_MAP = {
  ralentis: 'old',  // ← Rollback: cambiar a 'old'
};
```

Deploy:
```bash
./scripts/deploy-frontend.sh
```

Tiempo total: **2 minutos**

### Método 2: Mantener URL Antigua

Si algo en el backend nuevo falla, solo necesitas apuntar a la anterior:

```bash
# Terminal en EC2:
pm2 restart backend-viejo
```

Y en apiConfig:
```javascript
const ENDPOINT_MAP = {
  ralentis: 'old',  // Usa backend viejo nuevamente
};
```

---

## Ejemplo 5: Monitoreo y Debugging

### Ver qué backend está usando

En el componente:

```jsx
import { getApiConfig } from '../config/apiConfig.js';

export default function Debug() {
  const config = getApiConfig();
  
  return (
    <pre>
      {JSON.stringify(config, null, 2)}
    </pre>
  );
}
```

Output:
```json
{
  "urls": {
    "NEW_BACKEND": "http://localhost:3001",
    "OLD_BACKEND": "http://localhost:3000"
  },
  "endpoints": {
    "ralentis": "new",
    "informes": "old"
  }
}
```

### Ver logs del backend

En EC2:

```bash
# Ver logs del backend nuevo
pm2 logs backend-informes

# Ver logs de nginx (frontend)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver estado
pm2 list
```

---

## Ejemplo 6: Feature Flags Más Avanzados

Guardar en BD:

```javascript
// Backend: endpoint para obtener flags
GET /api/config/flags

// Respuesta
{
  "ralentis_v2": true,
  "informes_v2": false,
  "conductores_v2": false
}
```

```javascript
// Frontend: actualizar dinámicamente
export async function getEndpointMap() {
  try {
    const response = await fetch('/api/config/flags');
    const flags = await response.json();
    
    return {
      ralentis: flags.ralentis_v2 ? 'new' : 'old',
      informes: flags.informes_v2 ? 'new' : 'old',
      conductores: flags.conductores_v2 ? 'new' : 'old',
    };
  } catch {
    // Fallback a configuración estática
    return ENDPOINT_MAP;
  }
}
```

---

## Ejemplo 7: Testing en Desarrollo

### Correr ambos backends

```bash
# Terminal 1 - Backend viejo
cd old-backend
npm start  # puerto 3000

# Terminal 2 - Backend nuevo
cd backend-informes
npm run dev  # puerto 3001

# Terminal 3 - Frontend
cd frontend-rastreo
npm run dev  # puerto 5173
```

### Cambiar entre backends fácilmente

```javascript
// .env.development
VITE_API_NEW_BACKEND=http://localhost:3001
VITE_API_OLD_BACKEND=http://localhost:3000
```

Editar `apiConfig.js` en tiempo real y ver cambios con Hot Reload.

---

## Ejemplo 8: Validación de Datos

Agregar validación en el servicio del frontend:

```javascript
export async function getRalentisPorPatentes(patentes, fechaDesde, fechaHasta) {
  // Validar inputs
  if (!patentes || patentes.length === 0) {
    throw new Error('Se requieren patentes');
  }

  if (!fechaDesde || !fechaHasta) {
    throw new Error('Se requieren fechas');
  }

  // Validar formato de fechas
  try {
    new Date(fechaDesde).toISOString();
    new Date(fechaHasta).toISOString();
  } catch {
    throw new Error('Formato de fecha inválido');
  }

  // ... resto del código
}
```

---

## ⚡ Quick Reference

| Tarea | Comando |
|-------|---------|
| Agregar nuevo endpoint | Ver Ejemplo 2 |
| Cambiar backend de un endpoint | Editar (`apiConfig.js`) + `deploy.sh` |
| Rollback | Editar `apiConfig.js` + `deploy-frontend.sh` |
| Ver logs | `pm2 logs backend-informes` |
| Desplegar todo | `./scripts/deploy.sh` |
| Testing local | `npm run dev` (en cada carpeta) |

---

**Última actualización**: 2 de marzo de 2026
