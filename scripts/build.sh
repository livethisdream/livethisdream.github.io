#!/usr/bin/env bash
# One-shot production build of the Jekyll site via Docker.
# Output: ./_site/
set -euo pipefail
cd "$(dirname "$0")/.."
exec docker compose run --rm build
