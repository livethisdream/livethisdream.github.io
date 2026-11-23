#!/usr/bin/env bash
# Small Cloudflare API helpers for CI. Needs CLOUDFLARE_API_TOKEN.
#   cf.sh account            -> account id (first account the token can see)
#   cf.sh kv <account> <title> -> KV namespace id, created if missing
#   cf.sh url <account> <worker> -> https://<worker>.<subdomain>.workers.dev
#   cf.sh subdomain <account> [name] -> current workers.dev subdomain; registers
#                                       <name> first if the account has none
set -euo pipefail
API=https://api.cloudflare.com/client/v4

cf() {
  local out
  out=$(curl -sS -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is not set}" \
    -H 'Content-Type: application/json' "$@")
  if [ "$(jq -r '.success' <<<"$out")" != "true" ]; then
    echo "Cloudflare API error: $(jq -c '.errors' <<<"$out" 2>/dev/null || echo "$out")" >&2
    return 1
  fi
  printf '%s' "$out"
}

case "${1:-}" in
  account)
    if [ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then echo "$CLOUDFLARE_ACCOUNT_ID"; exit 0; fi
    id=$(cf "$API/accounts?per_page=50" | jq -r '.result[0].id // empty')
    [ -n "$id" ] || { echo "Token can't see any Cloudflare account" >&2; exit 1; }
    echo "$id"
    ;;
  kv)
    acct=$2 title=$3
    id=$(cf "$API/accounts/$acct/storage/kv/namespaces?per_page=100" \
      | jq -r --arg t "$title" '.result[] | select(.title == $t) | .id' | head -n1)
    if [ -z "$id" ]; then
      id=$(cf -X POST "$API/accounts/$acct/storage/kv/namespaces" \
        --data "$(jq -nc --arg t "$title" '{title: $t}')" | jq -r '.result.id')
      echo "Created KV namespace $title" >&2
    fi
    echo "$id"
    ;;
  url)
    acct=$2 worker=$3
    sub=$(cf "$API/accounts/$acct/workers/subdomain" | jq -r '.result.subdomain // empty') || sub=
    [ -n "$sub" ] || { echo "No workers.dev subdomain yet: open Workers & Pages in the Cloudflare dashboard once to pick one" >&2; exit 1; }
    echo "https://$worker.$sub.workers.dev"
    ;;
  subdomain)
    acct=$2 want=${3:-}
    sub=$(cf "$API/accounts/$acct/workers/subdomain" 2>/dev/null | jq -r '.result.subdomain // empty') || sub=
    if [ -z "$sub" ]; then
      [ -n "$want" ] || { echo "No workers.dev subdomain yet: run the workflow again and fill in the 'subdomain' box" >&2; exit 1; }
      sub=$(cf -X PUT "$API/accounts/$acct/workers/subdomain" \
        --data "$(jq -nc --arg s "$want" '{subdomain: $s}')" | jq -r '.result.subdomain')
      echo "Registered workers.dev subdomain $sub" >&2
    elif [ -n "$want" ] && [ "$want" != "$sub" ]; then
      echo "Account already uses subdomain '$sub'; ignoring '$want'" >&2
    fi
    echo "$sub"
    ;;
  *)
    echo "usage: cf.sh account | kv <account> <title> | url <account> <worker> | subdomain <account> [name]" >&2; exit 2 ;;
esac
