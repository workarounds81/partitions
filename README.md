# partitionwork.com

A fast, static marketing site for a Singapore partition, painting and false-ceiling
business. No frameworks, no build step, no monthly bill — plain HTML, CSS and
JavaScript, hosted free on GitHub Pages with automatic preview deploys on every
pull request.

---

## 1. Make it yours (5 minutes)

Everything personal lives in **one file**: [`assets/js/config.js`](assets/js/config.js).

```js
window.SITE = {
  name: "partitionwork.com",
  whatsapp: "6580000000",           // country code + number, digits only
  whatsappDisplay: "+65 8000 0000",
  email: "hello@partitionwork.com",
  formspreeId: "XXXXXXX",           // from your Formspree endpoint
  uen: "",                          // leave empty to hide it
};
```

Change those five values, save, commit, push. The header, footer, contact
section, floating chat button and every WhatsApp link update themselves.

Until `formspreeId` is filled in, the form deliberately refuses to submit and
tells the visitor to use WhatsApp instead — so you can never accidentally ship a
form that silently swallows enquiries.

---

## 2. Set up Formspree (free, 2 minutes)

1. Go to **[formspree.io](https://formspree.io)** and sign up with your business email.
2. **+ New Form** → name it *Website Enquiries* → set the notification email.
3. Copy the endpoint it gives you: `https://formspree.io/f/abcdwxyz`
4. Paste **only the last part** (`abcdwxyz`) into `formspreeId` in `config.js`.
5. Submit a test enquiry on your live site. Formspree emails you a one-time
   confirmation link on the first submission — **click it**, or nothing sends.
6. In Formspree, turn on **reCAPTCHA** to cut spam.

**Free plan limits:** 50 submissions per month, and **file uploads are a paid
feature.** That's why the form is text-only and points people to WhatsApp for
drawings — which is what they'd rather do anyway. If you ever outgrow 50/month,
that's a good problem and the paid tier is cheap.

---

## 3. Put it on GitHub

### You already have a repo

This project lives at **`workarounds81/partitions`**. If you're happy with that
name, skip to step 4 — nothing more to do.

### If you want a fresh repo with a better name

1. Go to **[github.com/new](https://github.com/new)**.
2. **Repository name:** `partition-work` (lowercase, hyphens, no spaces).
3. **Description:** `Partition, painting and ceiling specialists — Singapore`
4. Choose **Public** — GitHub Pages is free on public repos.
5. Leave *Add a README*, *.gitignore* and *licence* **unticked** (this repo
   already has them).
6. Click **Create repository**, then point your local copy at it:

```bash
git remote set-url origin https://github.com/<your-username>/partition-work.git
git push -u origin main
```

> **Tip on naming:** if you deploy to `github.io` without a custom domain, your
> URL is `https://<username>.github.io/<repo-name>/` — so the repo name shows up
> in the address. Keep it clean.

---

## 4. Turn on GitHub Pages

1. Push this repo to GitHub (see step 3).
2. In the repo: **Settings → Pages**.
3. **Source:** `Deploy from a branch`
4. **Branch:** `gh-pages` · **Folder:** `/ (root)` → **Save**.

The `gh-pages` branch doesn't exist yet — the workflow creates it on your first
push to `main`. So: push first, wait for the green tick under the **Actions**
tab, *then* set the Pages branch.

Your site goes live at:

```
https://<your-username>.github.io/<repo-name>/
```

First deploy takes a couple of minutes. After that it's usually under a minute.

---

## 5. Preview deploys

Every pull request gets its own live URL, automatically:

```
https://<your-username>.github.io/<repo-name>/pr-12/
```

A bot comments the link on the PR and updates it on every push. When the PR is
merged or closed, the preview folder is deleted. Workflow:
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

To use it:

```bash
git checkout -b new-photos
# ...make changes...
git add -A && git commit -m "Add October job photos"
git push -u origin new-photos
```

Then open a pull request on GitHub. Check the preview link on your phone before
merging — that's where most of your visitors will be.

---

## 6. Custom domain (optional — about S$40/year)

`partitionwork.com` is bought and the `CNAME` file is already in the repo root.
GitHub Pages hosting stays free — you only pay for the name.

To finish hooking it up:

1. At your registrar's DNS settings, add:

   | Type | Name | Value |
   |---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `<your-username>.github.io` |

2. **Settings → Pages → Custom domain** → enter `partitionwork.com` → **Save**,
   then tick **Enforce HTTPS** once the certificate is issued (up to 24 hours).

`config.js`, `robots.txt`, `sitemap.xml`, the `CNAME` file and the canonical tag
in `index.html` are already pointed at the new domain.

---

## 7. Adding your own photos

The site currently uses grey placeholder blocks that say which file goes where.
Full instructions: [`assets/img/README.md`](assets/img/README.md).

Short version: drop your photos into `assets/img/`, then swap each placeholder
`<div class="ph">` in `index.html` for a real `<img>` tag. Compress them first
at [squoosh.app](https://squoosh.app) — aim for under 300 KB each.

---

## 8. Running it locally

No build tools needed. Either open `index.html` directly in your browser, or
serve it properly (needed if you want the paths to behave exactly like live):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## What's on the page

| Section | What it does |
|---|---|
| Hero | The direct-to-tradesman pitch, WhatsApp and quote buttons |
| Stats | Four animated counters — **edit these to real numbers** |
| Services | Partitions, painting, ceilings, with detail lists |
| Who we work with | Homeowners, commercial, trade |
| How it works | Four-step process, drawings *or* site visit |
| Why go direct | The honest case against paying markup on markup |
| Our work | Draggable before/after slider + filterable gallery |
| Testimonials | **Placeholders — replace with real reviews only** |
| Scope builder | Five-question wizard that writes the enquiry for the visitor |
| FAQ | Eight accordion answers, including permits |
| Contact | WhatsApp, email, hours, coverage + the Formspree form |

---

## Before you go live — checklist

- [ ] Real WhatsApp number and email in `config.js`
- [ ] Formspree ID added, test enquiry sent, confirmation link clicked
- [ ] Stats changed to numbers you can stand behind (projects, years)
- [ ] Testimonial placeholders replaced with real reviews you've received
- [ ] At least the hero and three gallery photos swapped for your own
- [ ] UEN filled in if you're registered with ACRA
- [ ] Opened it on your own phone and tapped every button

**A note on the copy:** the stats, years and testimonials are placeholders. Put
real numbers in before you publish — under Singapore's Consumer Protection
(Fair Trading) Act, made-up claims and invented reviews are a genuine legal
risk, not just a bad look. The permits answer in the FAQ is written to point
people to HDB and their MCST rather than state rules that change.

---

## File map

```
index.html               The entire page
404.html                 Not-found page
assets/css/style.css     All styling (design tokens at the top)
assets/js/config.js      >>> YOUR DETAILS GO HERE <<<
assets/js/main.js         Behaviour — you shouldn't need to touch this
assets/img/              Your photos
.github/workflows/       Deploy + PR previews
robots.txt, sitemap.xml  Search engines
.nojekyll                Tells GitHub Pages to serve files as-is
```

---

## Turning on the custom domain

The `CNAME` file is deliberately **not** in the repo yet. GitHub Pages
301-redirects the `github.io` URL to whatever is in `CNAME`, so committing it
before DNS resolves makes the site look dead.

Order of operations:

1. Enable Pages (`gh-pages` branch) and confirm the site loads at
   `https://workarounds81.github.io/partitions/`.
2. Add the DNS records at your registrar (see the custom domain section above).
3. Wait until `partitionwork.com` resolves — check at `dnschecker.org`.
4. **Settings → Pages → Custom domain** → type `partitionwork.com` → **Save**.
   GitHub creates the `CNAME` file for you on the `gh-pages` branch.
5. Tick **Enforce HTTPS** once the certificate is issued (can take a few hours).
