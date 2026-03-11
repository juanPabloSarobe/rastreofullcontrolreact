#!/usr/bin/env bash

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$SCRIPT_DIR/deploy-backend-safe.sh"
"$SCRIPT_DIR/deploy-frontend-safe.sh"

echo "OK: deploy completo backend + frontend finalizado."
