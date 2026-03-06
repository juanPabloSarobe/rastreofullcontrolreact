# Guía Operativa de Producción (Backend Informes)

## 1) Objetivo

Este documento centraliza el estado actual de producción y el procedimiento recomendado para desplegar una nueva versión del backend sin afectar el servicio existente.

Incluye:
- Infraestructura y componentes activos
- Configuración crítica (secretos, puertos, jobs)
- Endpoints y flujos sensibles
- Procedimiento de despliegue seguro
- Validación post-deploy
- Rollback
- Riesgos conocidos y mitigaciones

Complemento recomendado para coexistencia Legacy+Node+Frontend:
- `backend-informes/PLAN_DESPLIEGUE_PARALELO_LEGACY_NODE.md`

---

## 2) Arquitectura actual (resumen)

### Monorepo
- Backend principal de informes: `backend-informes`
- Frontend operativo de rastreo: `frontend-rastreo`
- Frontend adicional: `frontend-informes`

### Stack backend
- Runtime: Node.js (ES Modules)
- Framework: Express
- DB: PostgreSQL (RDS)
- Secretos: AWS Secrets Manager (con fallback a `.env`)
- Driver DB: `pg`

### Base de datos productiva (observada)
- Host RDS: `prod-cluster-1.c1q82mcagski.us-east-1.rds.amazonaws.com`
- Database: `isis`
- Usuario: `isis`
- Región: `us-east-1`
- Secreto AWS usado: `basededatosisis`

### Puerto/API backend
- Puerto esperado por defecto: `3002`
- Health endpoint: `/servicio/v2/health`

---

## 3) Componentes y rutas críticas

### Rutas base montadas en backend
- `/servicio/v2/health`
- `/api/informes`
- `/api/ralentis-v2`
- `/api/conductores`

### Endpoints críticos de ralentí v2
- `GET /api/ralentis-v2`
- `POST /api/ralentis-v2/resumen-diario`
- `POST /api/ralentis-v2/refrescar-demanda`
- `POST /api/ralentis-v2/reconstruir-activos`
- `POST /api/ralentis-v2/reconstruir-lote-escalable`

---

## 4) Configuración crítica de entorno

## 4.1 Secretos y conexión
Variables relevantes:
- `USE_AWS_SECRETS=true|false`
- `AWS_REGION=us-east-1`
- `SECRET_NAME=basededatosisis`
- `API_PORT=3002`

Fallback local:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

Comportamiento:
1. Si `USE_AWS_SECRETS=true`, intenta AWS Secrets Manager
2. Si falla, usa variables de entorno
3. Valida presencia de secretos mínimos

## 4.2 Parámetros de ralentí v2
- `RALENTI_V2_LOTE_CONCURRENCY=8`
- `RALENTI_V2_LOTE_CHUNK_SIZE=120`
- `RALENTI_V2_LOTE_LOCK_KEY=95012026`

- `RALENTI_V2_ONDEMAND_CONCURRENCY=12`
- `RALENTI_V2_ONDEMAND_FRESHNESS_MIN=5`

- `RALENTI_V2_ACTIVOS_REALTIME_MIN=5`
- `RALENTI_V2_ACTIVOS_MAX_MOVILES=2500`
- `RALENTI_V2_ACTIVOS_CONCURRENCY=12`
- `RALENTI_V2_ACTIVOS_CHUNK_SIZE=200`
- `RALENTI_V2_ACTIVOS_LOCK_KEY=95012027`

## 4.3 Jobs automáticos internos (index.js)
- `RALENTI_V2_AUTORUN_ENABLED`
- `RALENTI_V2_AUTORUN_ACTIVE_INTERVAL_MS` (default 240000)
- `RALENTI_V2_AUTORUN_RETRO_INTERVAL_MS` (default 3600000)
- `RALENTI_V2_AUTORUN_RETRO_HOURS` (default 72)
- `RALENTI_V2_AUTORUN_RETRO_LOCK_KEY` (default 95012028)

Cuando está habilitado:
- Job activo-only periódico (`/reconstruir-activos`)
- Job retroactivo periódico (`/reconstruir-activos` con ventana retro)

---

## 5) Estado funcional conocido

## 5.1 Backfills ejecutados recientemente
- 2026-01, 2026-02, 2026-03: completados
- 2025-07 a 2025-12: completados

## 5.2 Ajustes recientes importantes
- Cobertura (`idle_intervals_v2_coverage`) y comparación por overlapping
- Normalización de timestamps UTC en frontend/backend
- Mejora UX selector de fecha en detalle de ralentí (1 día)
- Ajuste en reconstrucción:
  - `IDLE_REPORT` huérfano se registra como anomalía y no abre intervalo
  - Intervalos inicio/fin en mismo segundo se descartan

---

## 6) Riesgos operativos principales

1. **Desfase timezone** entre input sin zona y `timestamptz`
   - Mitigación: usar timestamps UTC explícitos (`...Z`) y matching por overlapping.

2. **Reprocesamientos concurrentes**
   - Mitigación: locks advisory (`95012026`, `95012027`, `95012028`).

3. **Backfill masivo durante operación normal**
   - Mitigación: correr en worker EC2 aislado y en modo secuencial por mes.

4. **Anomalías de datos fuente (reportes huérfanos)**
   - Mitigación: reglas de descarte y reproceso puntual por unidad/rango.

---

## 7) Procedimiento recomendado para desplegar nuevo backend en producción

## 7.1 Pre-deploy checklist
- Confirmar branch/tag y hash a desplegar
- Confirmar `.env`/secretos correctos (`USE_AWS_SECRETS`, `SECRET_NAME`, `API_PORT`)
- Confirmar acceso a RDS y Secrets Manager
- Confirmar lock keys no colisionan con procesos ad-hoc en ejecución
- Confirmar ventana de cambio
- Tener rollback listo

## 7.2 Smoke tests previos (en entorno destino)
- `curl -i http://localhost:3002/servicio/v2/health`
- Validar conexión DB `connected=true`
- Validar una lectura de ralentí de un día conocido

## 7.3 Despliegue
1. Detener instancia actual del backend (si aplica)
2. Actualizar código (pull/tag)
3. Instalar dependencias (`npm install` o `npm ci`)
4. Levantar backend (`npm start`)
5. Verificar logs de arranque
6. Ejecutar smoke tests

## 7.4 Validación post-deploy (mínima)
- Health OK
- `GET /api/ralentis-v2` responde para un rango histórico
- `POST /api/ralentis-v2/refrescar-demanda` funciona para 1 unidad y 1 día
- Si `AUTORUN` habilitado: observar al menos un ciclo de job sin errores

---

## 8) Rollback (procedimiento corto)

Si falla el deploy:
1. Detener proceso nuevo
2. Volver al release/tag anterior
3. Instalar dependencias del release anterior
4. Levantar backend anterior
5. Ejecutar health + prueba rápida de lectura de ralentí

Nota: como el backend es stateless, el rollback es principalmente de código y configuración; cuidar cambios de lógica que hayan alterado datos persistidos durante la ventana.

---

## 9) Operación de datos (reproceso seguro)

## 9.1 Reproceso puntual por unidad/rango (recomendado)
- Borrar intervalos de la unidad en ese rango
- Borrar coverage de ese rango
- Ejecutar `refrescar-demanda` con `refreshPolicy=force`

## 9.2 Reproceso mensual
- Usar `npm run backfill:ralenti:month -- --month YYYY-MM ...`
- Ejecutar secuencialmente
- Monitorear logs y revisar `tmp/backfill-summary-YYYY-MM.json`

## 9.3 Auditoría de calidad sugerida
- Detectar `missing_end`
- Detectar intervalos `same-second`
- Revisar outliers de duración extrema

---

## 10) Capacidad y rendimiento observados (referencia)

Resultados observados de backfill:
- Enero 2026: ~1309 unidades en ~169s
- Febrero 2026: ~1305 unidades en ~133s
- Marzo 2026 (datos parciales): ~1220 unidades en ~12s

Implicancia: la reconstrucción masiva mensual en esta arquitectura tarda minutos (no horas), con concurrencia moderada y chunking.

---

## 11) Recomendaciones para “nuevo backend sin romper”

1. Mantener compatibilidad de contratos en:
   - `/api/ralentis-v2`
   - `/api/ralentis-v2/refrescar-demanda`
   - `/api/ralentis-v2/reconstruir-activos`

2. No cambiar lock keys sin plan
3. No cambiar mapeo de secretos (`host/port/database/username/password`) sin validar
4. Forzar UTC explícito en inputs de fecha
5. Desplegar primero con `RALENTI_V2_AUTORUN_ENABLED=false` si el cambio es riesgoso; habilitar luego de validar
6. Tener scripts de auditoría listos para comparación pre/post

---

## 12) Runbook rápido (copiar/pegar)

Health:
```bash
curl -i http://localhost:3002/servicio/v2/health
```

Prueba lectura ralentí:
```bash
curl -G 'http://localhost:3002/api/ralentis-v2' \
  --data-urlencode 'movilIds=[5020]' \
  --data-urlencode 'fechaDesde=2026-03-03T00:00:00Z' \
  --data-urlencode 'fechaHasta=2026-03-03T23:59:59Z'
```

Reproceso puntual:
```bash
curl -X POST http://localhost:3002/api/ralentis-v2/refrescar-demanda \
  -H 'Content-Type: application/json' \
  -d '{
    "movilIds":[5020],
    "fechaDesde":"2026-03-03T00:00:00Z",
    "fechaHasta":"2026-03-03T23:59:59Z",
    "persist":true,
    "refreshPolicy":"force",
    "concurrency":1
  }'
```

---

## 13) Fuentes internas usadas para esta guía

- `backend-informes/src/index.js`
- `backend-informes/src/config/secrets.js`
- `backend-informes/src/routes/ralentisV2.js`
- `backend-informes/src/services/ralentiV2Service.js`
- `backend-informes/.env.example`
- `backend-informes/README.md`
- `backend-informes/ARQUITECTURA_SECRETOS.md`
- `backend-informes/CONFIGURACION_AWS_SECRETS.md`
- `backend-informes/QUICK_START_BACKFILL_RALENTI_MENSUAL.md`

---

## 14) Decisiones pendientes (recomendado cerrar)

- Definir puerto/URL pública final de producción (Nginx/ALB/Route53)
- Definir owner de rotación de secretos y frecuencia
- Definir política oficial de reproceso (quién, cuándo, cómo auditar)
- Definir dashboard de monitoreo para jobs `activo-only` y `retroactivo`
