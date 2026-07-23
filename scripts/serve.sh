#!/usr/bin/env bash
# Serve the Jekyll site locally with live-reload via Docker.
# Site: http://localhost:4000
set -euo pipefail
cd "$(dirname "$0")/.."
exec docker compose up jekyll
