# Estado de Produccion y Deploy Seguro (2026-03-10)

## Resumen ejecutivo

Se normalizo el proceso de deploy de frontend y backend con foco en seguridad operativa, rollback rapido y repetibilidad.

Resultado final:

- Frontend desplegado y validado en produccion.
- Backend v2 desplegado y validado en produccion.
- Reinicio backend v2 por `systemd` (servicio `backend-informes`).
- Acceso SSH por llave PEM operativo (sin password repetido).
- Backups habilitados a S3 con lifecycle.
- Limpieza de historicos y cuarentena completada para recuperar disco.

## Validaciones de infraestructura (confirmadas)

- Web server real: `httpd` (Apache), no `nginx`.
- Frontend servido desde: `/var/www/html`.
- Backend v2: `http://localhost:3003/servicio/v2/health`.
- Backend legacy: `http://localhost:3001/servicio/v2/health`.
- Ambito de acceso: SSH por red privada (VPN).

## Cambios operativos implementados

### 1) Scripts de deploy seguro

Se consolidaron los scripts activos:

- `scripts/deploy-backend-safe.sh`
- `scripts/deploy-frontend-safe.sh`
- `scripts/deploy-safe-all.sh`
- `scripts/lib-deploy-safe.sh`
- `scripts/deploy-safe.conf`
- `scripts/deploy-safe.conf.example`

Mejoras aplicadas:

- validaciones de runtime y prechecks antes de publicar,
- backup previo en cada deploy,
- dry-run en frontend,
- health checks de backend v2 + legacy,
- limpieza de artefactos viejos de releases,
- soporte de backup a S3,
- soporte SSH por key.

### 2) SSH por PEM

- Se creo y registro una llave PEM de deploy.
- Se agrego clave publica a `authorized_keys` de la instancia.
- `deploy-safe.conf` quedo en `DEPLOY_AUTH_MODE="key"`.

### 3) Backups a S3

Bucket:

- `fullcontrol-prod-deploy-backups-442042516496`

Prefijo:

- `rastreofullcontrolreact/prod/`

Lifecycle configurado:

- expiracion de objetos actuales a 90 dias,
- expiracion de versiones no actuales a 30 dias,
- abort multipart incompletas a 7 dias.

Configuracion activa:

- `BACKUP_S3_BUCKET="fullcontrol-prod-deploy-backups-442042516496"`
- `BACKUP_S3_PREFIX="rastreofullcontrolreact/prod"`
- `BACKUP_KEEP_LOCAL="false"`

### 4) Estabilidad backend en Node 16

Se corrigio compatibilidad de runtime (entorno productivo Node 16) para evitar errores en jobs y warnings bloqueantes.

## Limpieza controlada realizada

Se ejecuto limpieza interactiva archivo por archivo de historicos temporales y backups locales antiguos.

Adicionalmente se elimino cuarentena residual de incidente previo:

- directorio eliminado: `/root/quarantine_html_20260308_184915` (13G aprox).

Resultado de capacidad tras limpieza:

- uso de `/` bajo de ~91-97% a ~67% (segun momento de validacion).
- inodos quedaron con amplio margen.

## Estado final esperado para operacion diaria

- Deploy de frontend y backend ejecutables con una sola llave, sin password repetido.
- Backups persistidos en S3.
- Host sin crecimiento rapido por backups locales.
- Servicio productivo estable en `httpd` + backend v2 en `systemd`.

## Comandos de operacion habitual

```bash
./scripts/deploy-backend-safe.sh
./scripts/deploy-frontend-safe.sh
./scripts/deploy-safe-all.sh
```

## Riesgos residuales y recomendacion

Riesgo residual principal:

- contenido legacy voluminoso en `/var/www` fuera del flujo de deploy actual.

Recomendacion:

- planificar una segunda limpieza controlada (con inventario y aprobacion por lotes pequenos) para `/var/www/backupfc` y otros historicos no productivos.
