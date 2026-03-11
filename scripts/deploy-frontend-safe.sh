#!/usr/bin/env bash

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./lib-deploy-safe.sh
source "$SCRIPT_DIR/lib-deploy-safe.sh"

print_header "Deploy Frontend SAFE"
validate_local_prereqs

require_var FRONTEND_LOCAL_DIR
require_var FRONTEND_REMOTE_WEBROOT
require_var FRONTEND_REMOTE_BACKUP_DIR
require_var FRONTEND_REMOTE_RELEASES_DIR
require_var FRONTEND_WEB_SERVICE

LOCAL_DIR="$REPO_ROOT/$FRONTEND_LOCAL_DIR"
if [[ ! -d "$LOCAL_DIR" ]]; then
  echo "ERROR: no existe directorio local de frontend: $LOCAL_DIR"
  exit 1
fi

print_header "Paso 1/7 - Build local"
(
  cd "$LOCAL_DIR"
  npm ci --no-audit --no-fund --loglevel=error
  npm run uv
  npm run build
)

print_header "Paso 2/7 - Empaquetar dist"
TS="$(date +%Y%m%d_%H%M%S)"
TARBALL="frontend-rastreo_dist_${TS}.tar.gz"
TAR_PATH="$REPO_ROOT/$TARBALL"
(
  cd "$LOCAL_DIR"
  tar -czf "$TAR_PATH" -C dist .
)
ls -lh "$TAR_PATH"
shasum -a 256 "$TAR_PATH"

print_header "Paso 3/7 - Subir tarball"
ssh_run "mkdir -p '${FRONTEND_REMOTE_RELEASES_DIR}'"
scp_run "$TAR_PATH" "${FRONTEND_REMOTE_RELEASES_DIR}/"

print_header "Paso 4/7 - Prechecks remotos"
ssh_run "test -f '${FRONTEND_REMOTE_RELEASES_DIR}/${TARBALL}'"
validate_remote_healths

print_header "Paso 5/7 - Backup remoto"
ssh_run "set -euo pipefail; \
  mkdir -p '${FRONTEND_REMOTE_BACKUP_DIR}'; \
  HTML_BKP='${FRONTEND_REMOTE_BACKUP_DIR}/html_backup_${TS}.tar.gz'; \
  ASSETS_BKP='${FRONTEND_REMOTE_BACKUP_DIR}/assets_backup_${TS}.tar.gz'; \
  tar -czf \"\$HTML_BKP\" -C '${FRONTEND_REMOTE_WEBROOT}' .; \
  if [[ -d '${FRONTEND_REMOTE_WEBROOT}/assets' ]]; then tar -czf \"\$ASSETS_BKP\" -C '${FRONTEND_REMOTE_WEBROOT}' assets; else ASSETS_BKP=''; fi; \
  ls -lh \"\$HTML_BKP\"; \
  if [[ -n '${BACKUP_S3_BUCKET:-}' ]]; then \
    command -v aws >/dev/null 2>&1; \
    S3_PREFIX='${BACKUP_S3_PREFIX:-rastreofullcontrolreact}'; \
    aws s3 cp \"\$HTML_BKP\" \"s3://${BACKUP_S3_BUCKET}/\$S3_PREFIX/frontend/\" --only-show-errors; \
    if [[ -n \"\$ASSETS_BKP\" ]]; then aws s3 cp \"\$ASSETS_BKP\" \"s3://${BACKUP_S3_BUCKET}/\$S3_PREFIX/frontend/\" --only-show-errors; fi; \
    if [[ '${BACKUP_KEEP_LOCAL:-true}' != 'true' ]]; then rm -f \"\$HTML_BKP\"; if [[ -n \"\$ASSETS_BKP\" ]]; then rm -f \"\$ASSETS_BKP\"; fi; fi; \
  fi"

print_header "Paso 6/7 - Extraer release y dry-run"
ssh_run "set -euo pipefail; \
  REL='${FRONTEND_REMOTE_RELEASES_DIR}/frontend_release_${TS}'; \
  rm -rf \"\$REL\"; mkdir -p \"\$REL\"; \
  tar -xzf '${FRONTEND_REMOTE_RELEASES_DIR}/${TARBALL}' -C \"\$REL\"; \
  test -f \"\$REL/index.html\"; test -d \"\$REL/assets\"; test -f \"\$REL/version.json\"; \
  rsync -av --dry-run \"\$REL/\" '${FRONTEND_REMOTE_WEBROOT}/' | sed -n '1,120p'"

confirm_or_exit "Aplicar deploy real de frontend?"

print_header "Paso 7/7 - Deploy real"
ssh_run "set -euo pipefail; \
  REL='${FRONTEND_REMOTE_RELEASES_DIR}/frontend_release_${TS}'; \
  if [[ '${FRONTEND_RSYNC_DELETE:-false}' == 'true' ]]; then \
    rsync -av --delete \"\$REL/\" '${FRONTEND_REMOTE_WEBROOT}/'; \
  else \
    rsync -av \"\$REL/\" '${FRONTEND_REMOTE_WEBROOT}/'; \
  fi; \
  systemctl reload '${FRONTEND_WEB_SERVICE}'; \
  systemctl is-active '${FRONTEND_WEB_SERVICE}'; \
  curl -fsS http://localhost/version.json | head -c 300; echo; \
  curl -fsS '${BACKEND_V2_HEALTH_URL}' >/dev/null; \
  curl -fsS '${BACKEND_LEGACY_HEALTH_URL}' >/dev/null; \
  if [[ '${DEPLOY_CLEANUP_ENABLED:-true}' == 'true' ]]; then \
    find '${FRONTEND_REMOTE_RELEASES_DIR}' -maxdepth 1 -type d -name 'frontend_release_*' -mtime +${FRONTEND_RELEASE_RETENTION_DAYS:-7} -exec rm -rf {} +; \
    find '${FRONTEND_REMOTE_RELEASES_DIR}' -maxdepth 1 -type f -name 'frontend-rastreo_dist_*.tar.gz' -mtime +${FRONTEND_RELEASE_RETENTION_DAYS:-7} -delete; \
    if [[ '${BACKUP_KEEP_LOCAL:-true}' == 'true' ]]; then \
      find '${FRONTEND_REMOTE_BACKUP_DIR}' -maxdepth 1 -type f -name '*_backup_*.tar.gz' -mtime +${BACKUP_LOCAL_RETENTION_DAYS:-14} -delete; \
    fi; \
  fi"

rm -f "$TAR_PATH"

echo "OK: frontend deploy finalizado."
echo "Rollback rapido: tar -xzf '${FRONTEND_REMOTE_BACKUP_DIR}/html_backup_${TS}.tar.gz' -C '${FRONTEND_REMOTE_WEBROOT}' && systemctl reload '${FRONTEND_WEB_SERVICE}'"
