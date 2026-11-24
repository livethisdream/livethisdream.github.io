# wishlist-marks

Cloudflare Worker behind every wishlist:

- **Bought marks** for Neil's list (`/wishlist`, built from Obsidian) and the
  web-managed lists.
- **Web-managed lists** (`/wishlist/<name>`, edited at `/wishlist/<name>/edit`)
  for people without Obsidian. To add a person, put their lowercase first
  name in `ALLOWED_LISTS` in `wrangler.toml`, merge (the Worker redeploys),
  then they open `/wishlist/<name>/edit`, tap **Create my list**, and
  bookmark the page: that private link is their edit key.
  Lost link? Delete `listkey:<name>` from the KV namespace in the Cloudflare
  dashboard and they can set it up again (the list itself is kept).

Cloudflare Worker that stores "someone bought this" marks for `/wishlist`.
The wishlist content itself stays one-way (Obsidian → Gitea → this repo);
nothing here writes back to the notes.

## Deploy (works from a phone)

1. Cloudflare dashboard → My Profile → API Tokens → Create Token →
   **Edit Cloudflare Workers** template → Continue → Create. Copy the token.
2. GitHub repo → Settings → Secrets and variables → Actions → **New repository
   secret**: name `CLOUDFLARE_API_TOKEN`, value = the token.
3. GitHub repo → Actions → **Deploy wishlist Worker** → Run workflow.

The workflow finds your account, creates the `wishlist-marks` KV namespace if
needed, deploys, checks `/marks` answers, then re-runs the Pages deploy. The
Pages build finds the Worker URL itself, so no other settings are needed.
Later pushes that touch `worker/` redeploy automatically.

The first run needs a workers.dev name: type one into the **subdomain** box
when you click Run workflow (e.g. `livethisdream`). The Worker's address
becomes `https://wishlist-marks.<name>.workers.dev`. Later runs ignore it.

Manual alternative: `npx wrangler login`, `npx wrangler kv namespace create
MARKS` (paste the id into `wrangler.toml`), `npx wrangler deploy`.

## Notes

- Item IDs are a hash of each product URL, so editing titles or reordering
  the note keeps marks attached. Changing an item's URL makes it a new item.
- Checking an item off in Obsidian removes it from the page ("received");
  its bought mark is cleaned up automatically on the next page load.
- Only IDs present in the published `wishlist.json` are accepted.
- Undo works for 10 minutes from the browser that made the mark.
- Rate limit: 10 marks per IP per hour.
- To clear a mark yourself: `npx wrangler kv key delete --binding MARKS mark:<id>`
  (no peeking required — get the id from `wishlist.json`).
