# Scripts de Deploy (Estado Vigente)

Este directorio contiene solo el set operativo actual para deploy seguro en produccion.

## Archivos vigentes

- `deploy-backend-safe.sh`: deploy backend v2 (3003) con backup, release, restart y health checks.
- `deploy-frontend-safe.sh`: deploy frontend con backup, dry-run, publicacion y validacion.
- `deploy-safe-all.sh`: ejecuta backend + frontend en secuencia.
- `lib-deploy-safe.sh`: funciones compartidas (SSH/SCP, validaciones, confirmaciones).
- `deploy-safe.conf`: configuracion activa del entorno productivo.
- `deploy-safe.conf.example`: plantilla para nuevos entornos.

## Estado de infraestructura asumido por scripts

- Host: `10.100.10.246` (acceso por VPN)
- Web server: `httpd` (Apache)
- Frontend: `/var/www/html`
- Backend v2: `/opt/deploy/rastreofullcontrolreact/backend-informes` (puerto 3003)
- Backend legacy: puerto 3001 (no se toca)
- Metodo de autenticacion: SSH key (`DEPLOY_AUTH_MODE="key"`)

## Comandos de uso

Desde la raiz del repo:

```bash
./scripts/deploy-backend-safe.sh
./scripts/deploy-frontend-safe.sh
./scripts/deploy-safe-all.sh
```

## Backups y retencion

Los scripts soportan backup en S3 y limpieza de artefactos viejos:

- `BACKUP_S3_BUCKET`
- `BACKUP_S3_PREFIX`
- `BACKUP_KEEP_LOCAL`
- `BACKUP_LOCAL_RETENTION_DAYS`
- `DEPLOY_CLEANUP_ENABLED`
- `FRONTEND_RELEASE_RETENTION_DAYS`
- `BACKEND_RELEASE_RETENTION_DAYS`

Configuracion actual recomendada para produccion:

- subir backups a S3
- no conservar backups locales en instancia (`BACKUP_KEEP_LOCAL="false"`)

## Referencia operativa completa

Ver `DEPLOY_PRODUCCION_RUNBOOK.md` y `docs/estados/DEPLOY_PRODUCCION_ESTADO_2026-03-10.md`.
