#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="${DEPLOY_CONFIG_FILE:-$SCRIPT_DIR/deploy-safe.conf}"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "ERROR: no existe archivo de configuracion: $CONFIG_FILE"
  echo "Copiar scripts/deploy-safe.conf.example -> scripts/deploy-safe.conf"
  exit 1
fi

# shellcheck disable=SC1090
source "$CONFIG_FILE"

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "ERROR: variable obligatoria vacia: $name"
    exit 1
  fi
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: comando no encontrado: $cmd"
    exit 1
  fi
}

validate_local_prereqs() {
  require_cmd ssh
  require_cmd scp
  require_cmd rsync
  require_cmd tar

  require_var DEPLOY_HOST
  require_var DEPLOY_USER
  DEPLOY_AUTH_MODE="${DEPLOY_AUTH_MODE:-key}"

  if [[ "$DEPLOY_AUTH_MODE" != "key" && "$DEPLOY_AUTH_MODE" != "password" ]]; then
    echo "ERROR: DEPLOY_AUTH_MODE debe ser 'key' o 'password'"
    exit 1
  fi

  if [[ "$DEPLOY_AUTH_MODE" == "key" ]]; then
    require_var DEPLOY_SSH_KEY
    if [[ ! -f "$DEPLOY_SSH_KEY" ]]; then
      echo "ERROR: llave SSH no encontrada: $DEPLOY_SSH_KEY"
      exit 1
    fi
  fi
}

ssh_run() {
  local remote_cmd="$1"
  if [[ "${DEPLOY_AUTH_MODE:-key}" == "key" ]]; then
    ssh -i "$DEPLOY_SSH_KEY" \
      -o BatchMode=yes \
      -o StrictHostKeyChecking=accept-new \
      "${DEPLOY_USER}@${DEPLOY_HOST}" \
      "$remote_cmd"
  else
    ssh -o StrictHostKeyChecking=accept-new \
      "${DEPLOY_USER}@${DEPLOY_HOST}" \
      "$remote_cmd"
  fi
}

scp_run() {
  local source_path="$1"
  local target_path="$2"
  if [[ "${DEPLOY_AUTH_MODE:-key}" == "key" ]]; then
    scp -i "$DEPLOY_SSH_KEY" \
      "$source_path" \
      "${DEPLOY_USER}@${DEPLOY_HOST}:$target_path"
  else
    scp "$source_path" "${DEPLOY_USER}@${DEPLOY_HOST}:$target_path"
  fi
}

print_header() {
  local title="$1"
  echo
  echo "============================================================"
  echo "$title"
  echo "============================================================"
}

confirm_or_exit() {
  local prompt="$1"
  read -r -p "$prompt [y/N]: " answer
  if [[ "$answer" != "y" && "$answer" != "Y" ]]; then
    echo "Cancelado por usuario."
    exit 1
  fi
}

validate_remote_healths() {
  require_var BACKEND_V2_HEALTH_URL
  require_var BACKEND_LEGACY_HEALTH_URL

  ssh_run "curl -fsS '$BACKEND_V2_HEALTH_URL' >/dev/null"
  ssh_run "curl -fsS '$BACKEND_LEGACY_HEALTH_URL' >/dev/null"
}

