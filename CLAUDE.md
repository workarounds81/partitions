# partitionwork.com — notes for Claude

One-page static marketing site for **Partition Works** (Flipwire Design Pte Ltd),
a Singapore partition / glass / false ceiling / painting contractor. The owner
mostly asks for small updates: new project photos, copy tweaks, contact details.
WhatsApp is the main conversion channel; the Formspree form is secondary.

## Stack and deploy
- Plain HTML/CSS/JS, no build step. `index.html`, `404.html`,
  `assets/css/style.css`, `assets/js/main.js`, `assets/js/config.js`.
- Push to `main` → `.github/workflows/deploy.yml` copies the repo to the
  `gh-pages` branch root → live at https://partitionwork.com within ~1–2 min.
  The `CNAME` file must stay on main and is never deleted by the deploy.
- Work directly on `main` and push there (that is the owner's workflow).
  No PRs unless asked.
- GitHub Pages lets browsers cache HTML for ~10 min. If the owner says
  "not deployed", check the latest `gh-pages` commit first, then tell them
  to hard-refresh (Ctrl+Shift+R / Cmd+Shift+R) or use a private tab.

## Where things live
- **`assets/js/config.js`** — all business data (company, website, WhatsApp
  `6583127675` / `+65 8312 7675`, email, UEN, address, Formspree ID — still the
  `XXXXXXX` placeholder). `applyConfig()` in main.js injects it via
  `data-site`, `data-site-text`, `data-wa-link`, `data-email-link`, `data-uen`,
  `data-address`, `data-company-link`.
- **JSON-LD** in `<head>` of index.html: business schema (offer catalog of 4
  services) and a FAQPage. The FAQ schema text must match the visible FAQ
  exactly; the schema sits *before* the visible FAQ, so text replacements must
  be global. Edit JSON-LD by parsing/dumping JSON, not string replace.
- Services (`#services`): 4 cards in `.cards-4` — Partition walls, Glass
  partitions & doors, Painting, False ceilings & L-box.
- Scope builder `name="services"` values must match contact-form
  `name="work_needed"` values (the builder ticks the matching form chips).

## Cache busting — do this on every edit
`?v=N` on style.css, config.js, main.js in index.html and style.css in
404.html. Bump N everywhere (`sed -i 's/?v=27/?v=28/g' index.html 404.html`).
Current: **v=27**.

## Adding a project to "Our Work" (the most common request)
The owner uploads a folder via GitHub web UI, usually to branch
`claude/zen-fermat-6n8jhv` (sometimes main), e.g.
`assets/<Place - Job>/` with a mid-build photo and a finished photo.
1. `git fetch origin '+refs/heads/*:refs/remotes/origin/*'` and find it with
   `git ls-tree -r origin/claude/zen-fermat-6n8jhv | grep -i <place>`.
   Extract with `git show "<branch>:<path>" > scratch/file`. Don't merge that
   branch and don't commit the raw uploads to main.
2. Look at both photos to tell which is mid-build vs finished.
3. Convert with Pillow to WebP in `assets/img/` (`<slug>-during.webp`,
   `<slug>-after.webp`): landscape → ~1200×900 (or keep native ~1600 wide for
   16:9), portrait → keep ~1086×1448 / 940×1676. quality 78–80, method 6.
4. Add a flip tile inside `#gallery`, grouped with the other flip tiles at the
   top (after the last `data-steps` tile). Copy an existing one, e.g.:
   ```html
   <figure class="shot reveal" data-cat="partition" data-steps='[{"src":"assets/img/x-during.webp","alt":"…","title":"Place — mid-build","sub":"…"},{"src":"assets/img/x-after.webp","alt":"…","title":"Place — finished","sub":"…"}]'><img class="shot-img" src="assets/img/x-during.webp" alt="…" loading="lazy" width="W" height="H"><span class="shot-badge" aria-hidden="true">Build → Finished</span><figcaption><strong>Short job title</strong><span>Place · Tap to see it finished</span></figcaption></figure>
   ```
   - `data-cat`: `partition`, `painting` or `ceiling` (matches the filters).
   - Portrait photos: add `style="object-position:50% 25%"` (tune so the
     tile shows the interesting part; tile is a 4:3 crop).
   - Clicking a `data-steps` tile opens the lightbox on just that project's
     sequence (`shotItems()` in main.js); plain tiles browse the gallery.
5. Gallery is 3 columns desktop / 2 tablet (≤1000px) / 1 phone (≤640px).
   Mention it to the owner if the tile count leaves an orphan on the last row.
   Current: 13 tiles (8 flip tiles + 5 single photos).

## Testing before every push
- `python3 -m http.server 8765` from the repo, then Playwright (installed
  globally; run node with `NODE_PATH=$(npm root -g)`), launching
  `chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'})`
  with `reducedMotion:'reduce'`.
- Check at 1440 / 900 / 390 widths: no horizontal scroll, no page errors,
  tile count and rows, and for flip tiles click → caption "1 / 2" → next →
  "2 / 2". Screenshot `#gallery` and look at it.
- Pillow may need `python3 -m pip install pillow` in a fresh container.
- Read untrusted uploads with `python3 -I` from outside the repo.

## Open items (owner hasn't done yet)
- Real Formspree ID in config.js.
- Google Business Profile, Search Console, confirm "Enforce HTTPS" in Pages.

## Owner preferences
- Short, punchy copy — they called earlier versions "wordy". Clean, modern.
- Wants all gallery tiles visible and tidy on desktop; likes build → finished.
- Replies should say plainly what changed and that it's live in ~1–2 min.
