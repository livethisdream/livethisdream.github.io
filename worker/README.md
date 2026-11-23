# wishlist-marks

Cloudflare Worker that stores "someone bought this" marks for `/wishlist`.
The wishlist content itself stays one-way (Obsidian → Gitea → this repo);
nothing here writes back to the notes.

## Deploy (one time)

```sh
cd worker
npx wrangler login
npx wrangler kv namespace create MARKS   # paste the id into wrangler.toml
npx wrangler deploy                      # prints https://wishlist-marks.<you>.workers.dev
```

Then add a repo variable so the site knows where the Worker lives:
GitHub → Settings → Secrets and variables → Actions → Variables →
`VITE_WISHLIST_API` = the workers.dev URL. Re-run the Pages deploy.

Until that variable is set, the wishlist renders without "I bought this" buttons.

## Notes

- Item IDs are a hash of each product URL, so editing titles or reordering
  the note keeps marks attached. Changing an item's URL makes it a new item.
- Only IDs present in the published `wishlist.json` are accepted.
- Undo works for 10 minutes from the browser that made the mark.
- Rate limit: 10 marks per IP per hour.
- To clear a mark yourself: `npx wrangler kv key delete --binding MARKS mark:<id>`
  (no peeking required — get the id from `wishlist.json`).
