# Runbook de Deploy a Produccion (Frontend + Backend)

## 1. Objetivo

Estandarizar el despliegue manual a produccion por terminal, minimizando riesgo operativo y preparando la base para automatizacion.

Este runbook refleja el estado real observado en produccion durante la ventana de deploy del 2026-03-08.

## 2. Estado real de produccion (validado)

- Host de produccion: `dedicado.fullcontrolgps.com.ar` (`10.100.10.246`)
- Acceso: SSH por red privada (requiere VPN)
- Web server: `httpd` (Apache), no `nginx`
- Frontend servido desde: `/var/www/html`
- Backend v2 (nuevo): `http://localhost:3003/servicio/v2/health`
- Backend legacy: `http://localhost:3001/servicio/v2/health`

Nota: existe contenido legacy en `/var/www/html` (por ejemplo `servicio`, `api`, `fulladm`, `informes`).
No usar `--delete` contra `/var/www/html` completo.

## 3. Lecciones clave (obligatorias)

1. Nunca ejecutar `rsync` con variables sin validar.
2. Antes de `rsync` siempre verificar que `RELEASE_DIR` este definido y exista.
3. En webroot compartido no usar `rsync --delete` sobre raiz.
4. Si se detecta copia accidental, pausar, cortar proceso y mover a cuarentena (no borrar directo).
5. Validar salud de ambos backends antes y despues del deploy.

## 4. Frontend: procedimiento manual seguro

## 4.1 Pre-check local

```bash
cd /Users/juanpablosarobe/Documents/rastreofullcontrolreact/frontend-rastreo
npm run uv
npm run build
cat public/version.json
```

Validar:
- version esperada
- buildDate actualizado
- changelog correcto

## 4.2 Verificar endpoints embebidos en build

Usar este comando (salida limpia):

```bash
grep -RhoE "https://api-v2\.fullcontrolgps\.com\.ar|https://plataforma\.fullcontrolgps\.com\.ar" dist/assets | sort -u
```

Debe mostrar las dos URLs.

## 4.3 Empaquetar release

```bash
TS=$(date +%Y%m%d_%H%M%S)
TAR="frontend-rastreo_dist_${TS}.tar.gz"
tar -czf "$TAR" -C dist .
ls -lh "$TAR"
shasum -a 256 "$TAR"
```

## 4.4 Subir tarball a produccion

```bash
scp "$TAR" root@10.100.10.246:/tmp/
```

En servidor:

```bash
ls -lh /tmp/$TAR
```

## 4.5 Pre-check de servidor (antes de publicar)

```bash
hostname
hostname -I
systemctl is-active httpd
curl -sS http://localhost:3003/servicio/v2/health | head -c 250; echo
curl -sS http://localhost:3001/servicio/v2/health | head -c 250; echo
```

## 4.6 Backup de webroot y backup de assets

```bash
TS_DEPLOY=$(date +%Y%m%d_%H%M%S)
mkdir -p /root/backups/frontend

tar -czf "/root/backups/frontend/html_backup_${TS_DEPLOY}.tar.gz" -C /var/www/html .
tar -czf "/root/backups/frontend/assets_backup_${TS_DEPLOY}.tar.gz" -C /var/www/html assets
```

## 4.7 Extraer release y validar contenido

```bash
TAR="/tmp/frontend-rastreo_dist_YYYYMMDD_HHMMSS.tar.gz"
RELEASE_DIR="/tmp/frontend_release_${TS_DEPLOY}"

rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
tar -xzf "$TAR" -C "$RELEASE_DIR"

ls -la "$RELEASE_DIR" | head -20
cat "$RELEASE_DIR/version.json" | head -20
```

## 4.8 Simulacion de deploy (dry-run)

```bash
echo "RELEASE_DIR=$RELEASE_DIR"
test -n "$RELEASE_DIR"
test -d "$RELEASE_DIR"

rsync -av --dry-run "${RELEASE_DIR:?RELEASE_DIR_NO_DEFINIDO}/" /var/www/html/
```

## 4.9 Deploy real (sin delete)

```bash
rsync -av "${RELEASE_DIR:?RELEASE_DIR_NO_DEFINIDO}/" /var/www/html/
systemctl reload httpd
systemctl is-active httpd
```

## 4.10 Validacion post-deploy

```bash
curl -sS http://localhost/version.json | head -c 500; echo
curl -sS http://localhost:3003/servicio/v2/health | head -c 250; echo
curl -sS http://localhost:3001/servicio/v2/health | head -c 250; echo
```

Validacion de usuario:
- abrir `https://plataforma.fullcontrolgps.com.ar`
- hard refresh (`Cmd+Shift+R`)
- confirmar chip de version
- probar un flujo legacy y un flujo de `Ralenti por movil`

## 4.11 Rollback rapido frontend

```bash
LATEST=$(ls -t /root/backups/frontend/html_backup_*.tar.gz | head -1)
rm -rf /var/www/html/*
tar -xzf "$LATEST" -C /var/www/html
systemctl reload httpd
```

## 5. Limpieza de incidente rsync (si vuelve a ocurrir)

Sintoma: en `/var/www/html` aparecen carpetas de sistema (`home`, `root`, `etc`, `proc`, etc.).

## 5.1 Cortar rsync

```bash
pkill -f rsync || true
ps aux | grep '[r]sync'
```

## 5.2 Mover basura a cuarentena (reversible)

```bash
QDIR="/root/quarantine_html_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$QDIR"

for p in home root boot etc dev media mnt opt proc run srv sys tmp usr var; do
  [ -e "/var/www/html/$p" ] && mv "/var/www/html/$p" "$QDIR/"
done
```

## 5.3 Detectar y mover extras remanentes comparando contra backup

```bash
LATEST_BACKUP=$(ls -t /root/backups/frontend/html_backup_*.tar.gz | head -1)

tar -tzf "$LATEST_BACKUP" \
  | sed 's#^\./##' \
  | awk -F/ 'NF && $1 != "." {print $1}' \
  | sort -u > /tmp/html_expected.txt

ls -1A /var/www/html | sort -u > /tmp/html_current.txt
comm -23 /tmp/html_current.txt /tmp/html_expected.txt
```

Mover solo extras detectados a cuarentena adicional.

## 6. Backend: procedimiento manual seguro (actual)

Este proceso aplica al backend en `3003` (v2) manteniendo `3001` operativo.

## 6.1 Pre-check local

```bash
cd /Users/juanpablosarobe/Documents/rastreofullcontrolreact/backend-informes
npm run check:runtime
npm ci
```

Validar runtime minimo:
- Node >= 18.18.0
- npm >= 9.0.0

## 6.2 Empaquetar backend

```bash
cd /Users/juanpablosarobe/Documents/rastreofullcontrolreact
TS=$(date +%Y%m%d_%H%M%S)
BTAR="backend-informes_${TS}.tar.gz"

tar -czf "$BTAR" \
  --exclude='backend-informes/node_modules' \
  --exclude='backend-informes/logs' \
  --exclude='backend-informes/tmp' \
  backend-informes
```

## 6.3 Subir a servidor

```bash
scp "$BTAR" root@10.100.10.246:/tmp/
```

## 6.4 Deploy remoto (release dir)

```bash
set -e
TS=$(date +%Y%m%d_%H%M%S)
REL="/opt/deploy/releases/backend-informes_${TS}"
mkdir -p "$REL"

tar -xzf /tmp/backend-informes_*.tar.gz -C "$REL" --strip-components=1
cd "$REL"
npm ci --omit=dev
```

Copiar `.env` vigente del backend productivo si corresponde al esquema actual.

## 6.5 Reinicio controlado (modo actual sin systemd)

Si hoy operan con `nohup`:

```bash
pkill -f "node src/index.js" || true
cd /opt/deploy/rastreofullcontrolreact/backend-informes
nohup npm start > /tmp/backend-informes-3003.log 2>&1 &
```

Nota: migrar a `systemd` es recomendado para mayor confiabilidad.

## 6.6 Validacion backend post-deploy

```bash
curl -sS http://localhost:3003/servicio/v2/health | head -c 250; echo
curl -sS http://localhost:3001/servicio/v2/health | head -c 250; echo
```

Validaciones funcionales sugeridas:
- `GET /api/ralentis-v2`
- `POST /api/ralentis-v2/refrescar-demanda`
- revisar logs de autorun si `RALENTI_V2_AUTORUN_ENABLED=true`

## 7. Checklist operativo obligatorio

Antes de cada deploy:
- build local OK
- `version.json` correcto
- salud 3003 y 3001 OK
- backup generado
- dry-run de rsync revisado
- variable `RELEASE_DIR` validada
- ventana de cambio comunicada

Despues de cada deploy:
- version visible en produccion
- health de ambos backends OK
- prueba funcional minima OK
- registrar evidencia (fecha, hash, operador)

## 8. Plan de automatizacion (siguiente fase)

## 8.1 Frontend: script seguro

Crear `scripts/deploy-frontend-safe.sh` con:
- `set -euo pipefail`
- chequeo estricto de variables
- backup automatico de html + assets
- dry-run obligatorio con confirmacion humana
- deploy real sin `--delete` sobre webroot raiz
- post-check (`version.json`, `httpd`, health 3003/3001)

## 8.2 Backend: script seguro

Crear `scripts/deploy-backend-safe.sh` con:
- pre-check `npm run check:runtime`
- release por timestamp en `/opt/deploy/releases`
- restart controlado del proceso
- health checks internos y externos
- rollback rapido al release anterior

## 8.3 Endurecimiento recomendado

1. pasar de `root + password` a `ssh key` dedicada de deploy
2. usuario tecnico de deploy con permisos acotados
3. habilitar `systemd` para backend v2
4. aislar frontend nuevo en subdirectorio dedicado (evitar webroot compartido)
5. log de auditoria de deploy en archivo (fecha, operador, version, resultado)

## 9. Referencias

- `scripts/README.md`
- `scripts/deploy-frontend.sh`
- `scripts/deploy-backend.sh`
- `backend-informes/GUIA_PRODUCCION_BACKEND.md`
- `backend-informes/PLAN_DESPLIEGUE_PARALELO_LEGACY_NODE.md`
- `frontend-rastreo/update-version.js`

---

## 10. Automatizacion segura (scripts safe)

Se agregaron scripts nuevos en `scripts/` para deploy rapido, con backup y validaciones.

Archivos:
- `scripts/deploy-safe.conf.example`
- `scripts/deploy-backend-safe.sh`
- `scripts/deploy-frontend-safe.sh`
- `scripts/deploy-safe-all.sh`

### 10.1 Configuracion inicial

1. Copiar config base:

```bash
cp scripts/deploy-safe.conf.example scripts/deploy-safe.conf
```

2. Editar valores reales de produccion (host, user, key, rutas).

3. Validar llave SSH:

```bash
ls -l ~/.ssh/prod-fullcontrol.pem
chmod 600 ~/.ssh/prod-fullcontrol.pem
```

### 10.2 Uso

Deploy backend:

```bash
./scripts/deploy-backend-safe.sh
```

Deploy frontend:

```bash
./scripts/deploy-frontend-safe.sh
```

Deploy completo:

```bash
./scripts/deploy-safe-all.sh
```

### 10.3 Guardas incluidas

- Validacion de comandos locales (`ssh`, `scp`, `rsync`, `tar`)
- Validacion de variables obligatorias
- Confirmacion interactiva antes de aplicar deploy real
- Backup automatico previo
- Dry-run de `rsync` en frontend
- Health checks de backend v2 y legacy post-deploy

### 10.4 Nota sobre webroot compartido

Por defecto `FRONTEND_RSYNC_DELETE=false` para evitar borrar carpetas legacy en `/var/www/html`.
Solo activar `true` si el webroot fue aislado y dedicado al frontend nuevo.
