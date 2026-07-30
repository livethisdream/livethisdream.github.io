#!/usr/bin/env bash
# Generate matplotlib PNGs for course decks via a throwaway
# python:3.12-slim container. Reruns any script in scripts/plots/ that
# matches the pattern *.py, writing outputs under assets/<course>/img/.
#
# Usage:
#   ./scripts/plots.sh                # regenerate every plot
#   ./scripts/plots.sh <script.py>    # regenerate one script's outputs
set -euo pipefail

cd "$(dirname "$0")/.."

UID_HOST="$(id -u)"
GID_HOST="$(id -g)"

if [ $# -eq 0 ]; then
  TARGETS=(scripts/plots/*.py)
else
  TARGETS=("$@")
fi

for script in "${TARGETS[@]}"; do
  [ -f "$script" ] || { echo "not found: $script" >&2; exit 1; }
  echo "→ $script"
  docker run --rm -v "$PWD":/site -w /site python:3.12-slim bash -c "
    pip install --quiet --disable-pip-version-check matplotlib numpy && \
    python '$script' && \
    find assets -type f -newer '$script' -exec chown ${UID_HOST}:${GID_HOST} {} +
  "
done
