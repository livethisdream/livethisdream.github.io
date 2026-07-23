#!/usr/bin/env bash
# Generate a QR code PNG via a throwaway python:3.12-slim container.
# Usage:
#   ./scripts/qr.sh <url> <output-path>
# Example:
#   ./scripts/qr.sh 'https://livethisdream.github.io/ece444/syllabus/' assets/ece444/img/syllabus-qr.png
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <url> <output-path>" >&2
  exit 1
fi

URL="$1"
OUT="$2"
cd "$(dirname "$0")/.."

# Output path relative to repo root.
OUT_DIR="$(dirname "$OUT")"
mkdir -p "$OUT_DIR"

UID_HOST="$(id -u)"
GID_HOST="$(id -g)"

docker run --rm -v "$PWD":/site -w /site python:3.12-slim bash -c "
  pip install --quiet --disable-pip-version-check 'qrcode[pil]' && \
  python -c \"import qrcode; qrcode.make('${URL//\'/\\\'}', box_size=12, border=2).save('${OUT}')\" && \
  chown ${UID_HOST}:${GID_HOST} '${OUT}'
"

echo "wrote ${OUT}  →  ${URL}"
