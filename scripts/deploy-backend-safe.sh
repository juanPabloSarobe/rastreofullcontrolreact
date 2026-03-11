#!/usr/bin/env bash

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib-deploy-safe.sh
source "$SCRIPT_DIR/lib-deploy-safe.sh"

print_header "Deploy Backend SAFE"
validate_local_prereqs

require_var BACKEND_LOCAL_DIR
require_var BACKEND_REMOTE_DIR
require_var BACKEND_REMOTE_BACKUP_DIR
require_var BACKEND_REMOTE_RELEASES_DIR
require_var BACKEND_RESTART_MODE
require_var BACKEND_NOHUP_LOG

LOCAL_DIR="$REPO_ROOT/$BACKEND_LOCAL_DIR"
if [[ ! -d "$LOCAL_DIR" ]]; then
  echo "ERROR: no existe directorio local de backend: $LOCAL_DIR"
  exit 1
fi

print_header "Paso 1/7 - Runtime y dependencias locales"
(
  cd "$LOCAL_DIR"
  npm run check:runtime
  npm ci
)

print_header "Paso 2/7 - Empaquetar backend"
TS="$(date +%Y%m%d_%H%M%S)"
TARBALL="backend-informes_${TS}.tar.gz"
TAR_PATH="$REPO_ROOT/$TARBALL"
(
  cd "$REPO_ROOT"
  tar -czf "$TAR_PATH" \
    --exclude='backend-informes/node_modules' \
    --exclude='backend-informes/logs' \
    --exclude='backend-informes/tmp' \
    backend-informes
)
ls -lh "$TAR_PATH"
shasum -a 256 "$TAR_PATH"

print_header "Paso 3/7 - Subir tarball"
ssh_run "mkdir -p '${BACKEND_REMOTE_RELEASES_DIR}'"
scp_run "$TAR_PATH" "${BACKEND_REMOTE_RELEASES_DIR}/"

print_header "Paso 4/7 - Backup remoto backend"
ssh_run "set -euo pipefail; \
  mkdir -p '${BACKEND_REMOTE_BACKUP_DIR}'; \
  BACKUP_FILE='${BACKEND_REMOTE_BACKUP_DIR}/backend_backup_${TS}.tar.gz'; \
  if [[ -d '${BACKEND_REMOTE_DIR}' ]]; then \
    tar -czf \"\$BACKUP_FILE\" -C '${BACKEND_REMOTE_DIR}' .; \
    ls -lh \"\$BACKUP_FILE\"; \
    if [[ -n '${BACKUP_S3_BUCKET:-}' ]]; then \
      command -v aws >/dev/null 2>&1; \
      S3_PREFIX='${BACKUP_S3_PREFIX:-rastreofullcontrolreact}'; \
      aws s3 cp \"\$BACKUP_FILE\" \"s3://${BACKUP_S3_BUCKET}/\$S3_PREFIX/backend/\" --only-show-errors; \
      if [[ '${BACKUP_KEEP_LOCAL:-true}' != 'true' ]]; then rm -f \"\$BACKUP_FILE\"; fi; \
    fi; \
  else \
    mkdir -p '${BACKEND_REMOTE_DIR}'; \
  fi"

print_header "Paso 5/7 - Preparar release remoto"
ssh_run "set -euo pipefail; \
  REL='${BACKEND_REMOTE_RELEASES_DIR}/backend-informes_${TS}'; \
  rm -rf \"\$REL\"; mkdir -p \"\$REL\"; \
  tar -xzf '${BACKEND_REMOTE_RELEASES_DIR}/${TARBALL}' -C \"\$REL\" --strip-components=1; \
  if [[ -f '${BACKEND_REMOTE_DIR}/.env' ]]; then cp '${BACKEND_REMOTE_DIR}/.env' \"\$REL/.env\"; fi; \
  cd \"\$REL\"; npm run check:runtime; npm ci --omit=dev --no-audit --no-fund --loglevel=error; test -f src/index.js"

confirm_or_exit "Aplicar deploy real de backend?"

print_header "Paso 6/7 - Sincronizar release al directorio operativo"
ssh_run "set -euo pipefail; \
  REL='${BACKEND_REMOTE_RELEASES_DIR}/backend-informes_${TS}'; \
  rsync -av --delete \
    --exclude='.env' \
    --exclude='logs' \
    --exclude='tmp' \
    \"\$REL/\" '${BACKEND_REMOTE_DIR}/'"

print_header "Paso 7/7 - Reiniciar y validar"
if [[ "$BACKEND_RESTART_MODE" == "systemd" ]]; then
  require_var BACKEND_SYSTEMD_SERVICE
  ssh_run "set -euo pipefail; \
    systemctl restart '${BACKEND_SYSTEMD_SERVICE}'; \
    systemctl is-active '${BACKEND_SYSTEMD_SERVICE}'"
else
  ssh_run "set -euo pipefail; \
    pkill -f 'node src/index.js' || true; \
    cd '${BACKEND_REMOTE_DIR}'; \
    nohup npm start > '${BACKEND_NOHUP_LOG}' 2>&1 & \
    disown; sleep 2"
fi

ssh_run "set -euo pipefail; \
  curl -fsS '${BACKEND_V2_HEALTH_URL}' | head -c 300; echo; \
  curl -fsS '${BACKEND_LEGACY_HEALTH_URL}' | head -c 300; echo; \
  if [[ '${DEPLOY_CLEANUP_ENABLED:-true}' == 'true' ]]; then \
    find '${BACKEND_REMOTE_RELEASES_DIR}' -maxdepth 1 -type d -name 'backend-informes_*' -mtime +${BACKEND_RELEASE_RETENTION_DAYS:-14} -exec rm -rf {} +; \
    find '${BACKEND_REMOTE_RELEASES_DIR}' -maxdepth 1 -type f -name 'backend-informes_*.tar.gz' -mtime +${BACKEND_RELEASE_RETENTION_DAYS:-14} -delete; \
    if [[ '${BACKUP_KEEP_LOCAL:-true}' == 'true' ]]; then \
      find '${BACKEND_REMOTE_BACKUP_DIR}' -maxdepth 1 -type f -name 'backend_backup_*.tar.gz' -mtime +${BACKUP_LOCAL_RETENTION_DAYS:-14} -delete; \
    fi; \
  fi"

rm -f "$TAR_PATH"

echo "OK: backend deploy finalizado."
echo "Rollback rapido: tar -xzf '${BACKEND_REMOTE_BACKUP_DIR}/backend_backup_${TS}.tar.gz' -C '${BACKEND_REMOTE_DIR}' && reiniciar proceso backend"
