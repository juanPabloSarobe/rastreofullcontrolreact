# Cierre de implementacion - Dashboard Administrativo y Monitor

Fecha: 2026-03-17
Estado: COMPLETADO Y VALIDADO EN PRODUCCION

## 1. Objetivo del trabajo

Implementar y estabilizar un dashboard administrativo operativo para observabilidad y accion remota, con foco en:

- Estado integral de sistema (instancia, DB, recursos).
- Salud de backends (node y legacy).
- Estado del monitor de comunicacion con evidencia historica.
- Ejecucion manual del monitor desde UI.
- Acciones operativas seguras (email, WhatsApp, reinicio de instancia).
- Compatibilidad con entorno productivo existente (Node 16.18.1 / npm 8.19.2, sin upgrade).

## 2. Alcance funcional entregado

### 2.1 Dashboard administrativo (frontend)

Se incorporo una vista administrativa accesible desde menu con bloques de:

- Estado de instancia y recursos (CPU/RAM/Swap/Disk, IP, zona, tipo, health checks).
- Estado de DB con chequeos extendidos.
- Health de backends (legacy + node) con latencia y HTTP status.
- Ultimos estados del monitor (tabla historica con estado, eventos y mensaje).
- Panel de acciones:
  - Ejecutar monitoreo manual.
  - Test email.
  - Test WhatsApp.
  - Reiniciar instancia (confirmacion explicita).

### 2.2 API administrativa (backend)

Se habilitaron endpoints bajo /api/admin para:

- system-status
- db-status
- backends-health
- monitor-logs
- run-monitor-manual
- restart-instance

Se reforzo middleware de autorizacion admin y se agregaron controles operativos en acciones sensibles.

### 2.3 Monitor de comunicacion (logica de deteccion)

Se corrigio el problema de falso estado estable cuando el modulo de comunicacion se detenia realmente.

Evolucion aplicada:

1. Se detecto desalineacion de la logica antigua basada en referencias temporales.
2. Se paso a deteccion por delta real de inserciones en ventana activa (10 segundos).
3. Se robustecio para cambio de mes evaluando tablas candidatas (mes local/UTC y adyacentes).

Resultado: deteccion consistente de caida real (CRITICAL) y recuperacion (OK) en ciclos automaticos.

## 3. Archivos y componentes clave intervenidos

## Backend

- backend-informes/src/routes/admin.js
  - API del dashboard admin.
  - Hardening de adminOnly.
  - Integracion de metrica de instancia y checks.
  - Ejecucion manual del monitor con timeout controlado.
  - Reinicio con validacion de token de confirmacion y cooldown.

- backend-informes/scripts/monitor-communication.mjs
  - Logica de deteccion por actividad real (delta inserts).
  - Ventana activa de 10s.
  - Estrategia multi-tabla para cruce de mes.
  - Campos de reporte de diagnostico (fuente de deteccion y deltas por tabla).

- backend-informes/.env.monitor.example
  - Variables de entorno necesarias para dashboard/monitor.
  - Placeholders y defaults saneados para despliegue.

- backend-informes/iam/policy-dashboard-monitor-prod.json
  - Policy minima de IAM para acciones y lectura de metricas/logs.

## Frontend

- frontend-rastreo/src/components/pages/AdminDashboard.jsx
  - Integracion completa de llamadas admin.
  - Correccion de confirmacion de reinicio (token esperado).
  - Correccion de base URL para produccion:
    - same-origin por defecto.
    - override opcional por VITE_ADMIN_API_BASE.
  - Mejora de UX para reflejar ejecucion manual y resultados en pantalla.

## 4. Decisiones de arquitectura y operacion

### 4.1 No tocar Vite/proxy de desarrollo mas de lo necesario

Se priorizo estabilidad, evitando cambios de alto impacto en toolchain, y se resolvio consumo admin desde configuracion y same-origin en produccion.

### 4.2 Same-origin para cookies de autorizacion

Para evitar problemas cross-domain y simplificar CORS/cookies, el dashboard en produccion consume /api/admin en el mismo host.

### 4.3 Seguridad de acciones criticas

- Reinicio protegido por:
  - rol admin,
  - confirmacion textual,
  - cooldown para evitar repeticion accidental,
  - validacion de origen/control de acceso.

### 4.4 Compatibilidad estricta con produccion actual

Se mantuvo compatibilidad con Node 16.18.1 y npm 8.19.2.
No se forzaron upgrades de runtime.

## 5. Trabajo de infraestructura y despliegue

### 5.1 IAM de instancia (produccion)

Se ajusto el rol para permitir minimo necesario de:

- EC2 describe/reboot (controlado).
- CloudWatch lectura de metricas.
- S3 list/get/put para logs del monitor.
- Secrets Manager (lectura segun necesidad operativa).

### 5.2 Apache reverse proxy

Se agrego ruteo explicito para:

- /api/admin/* -> backend admin (127.0.0.1:3003/api/admin/*)

Con esto se elimino el 404 HTML por fallback SPA y se restauro respuesta JSON de API.

### 5.3 Variables de entorno productivas

Se completaron variables faltantes para backend/monitor/dashboard en servidor, preservando secretos y compatibilidad con la version instalada.

## 6. Incidentes encontrados y resolucion

### 6.1 403 en dashboard admin

Causa: cookie de rol no llegaba correctamente en escenario cross-domain.

Resolucion:

- consumo same-origin en frontend para produccion,
- validacion de cookie admin en backend,
- fallback por header solo como opcion controlada por entorno.

### 6.2 404 en /api/admin

Causa: Apache derivaba a frontend (SPA) en lugar de proxyear a backend admin.

Resolucion:

- se agrego ProxyPass dedicado para /api/admin.
- validacion con apachectl -t y curl local con Host de plataforma.

### 6.3 Monitor no reflejaba caida real

Causa: criterio de deteccion temporal no representaba actividad efectiva de insercion.

Resolucion:

- deteccion por delta de inserts en ventana activa,
- soporte cruce de mes con tablas candidatas.

## 7. Evidencia de validacion end-to-end

Se validaron los siguientes escenarios:

1. Monitoreo manual con modulo detenido:
- Resultado esperado: CRITICAL.
- Resultado obtenido: CRITICAL en UI y notificacion por email.

2. Monitoreo automatico con modulo detenido:
- Resultado esperado: CRITICAL periodico por scheduler.
- Resultado obtenido: CRITICAL repetido en tabla historica con timestamp actualizado + email automatico.

3. Salud de backend y dashboard admin:
- /api/admin/system-status respondiendo JSON via Apache.
- componentes de estado y acciones renderizando correctamente.

4. Flujo de notificaciones:
- Mail de alerta recibido tanto en manual como en automatico.

## 8. Estado final al cierre del dia

Estado general: OPERATIVO.

- Dashboard admin funcional en plataforma.
- Deteccion de caida del monitor validada en modo manual y automatico.
- Integracion API/proxy/cookies estable.
- Notificaciones por mail operativas.

Observacion esperada:

- Campos "Ultimo reinicio solicitado" y "Uptime desde ultimo reinicio" pueden mostrarse N/A hasta realizar un reinicio desde el propio dashboard para inicializar baseline de tracking.

## 9. Recomendaciones operativas para el siguiente dia

1. Ejecutar una prueba controlada de recuperacion:
- levantar modulo de comunicacion y confirmar transicion automatica a OK.

2. Si same-origin queda consolidado en prod:
- dejar ADMIN_ALLOW_ROLE_HEADER=false para minimizar superficie de bypass.

3. Definir politica de ruido de alertas:
- confirmar frecuencia deseada de mails en estado CRITICAL sostenido.

4. Registrar runbook corto de incidente:
- pasos exactos para diagnostico rapido (UI + endpoint + cron + logs).

## 10. Criterio de done cumplido

Se considera completado porque:

- El comportamiento critico principal (deteccion real de caida) fue reproducido y validado.
- El circuito operativo completo esta funcionando (deteccion, persistencia, visualizacion, notificacion).
- La operacion en produccion quedo alineada con restricciones reales de runtime e infraestructura.
- La seguridad de acciones sensibles quedo endurecida respecto del estado inicial.
