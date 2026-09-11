# Photos go here

Drop your job photos in this folder, then update the filenames in `index.html`.

Recommended files (the placeholders on the site already point at these names):

| File | Used for | Suggested size |
|---|---|---|
| `hero.jpg` | Main hero photo — your single best finished job | 1200 × 960 |
| `before.jpg` | Before/after slider, left side | 1600 × 900 |
| `after.jpg` | Before/after slider, right side | 1600 × 900 |
| `work-1.jpg` … `work-6.jpg` | Gallery grid | 1000 × 750 |
| `og-image.png` | Link preview when shared on WhatsApp/Facebook | 1200 × 630 |

**To use a real photo**, find the placeholder in `index.html`, e.g.

```html
<div class="ph" role="img" aria-label="Partition wall project">
  <span class="ph-note">assets/img/work-1.jpg</span>
</div>
```

and replace the whole `<div>` with:

```html
<img class="shot-img" src="assets/img/work-1.jpg" alt="Partition wall in a Punggol HDB flat" loading="lazy" width="1000" height="750">
```

Then add this once to the bottom of `assets/css/style.css`:

```css
.shot-img{border-radius:var(--radius);aspect-ratio:4/3;object-fit:cover;width:100%}
```

Tips: shoot in landscape, in daylight, with the room tidied. Compress before
uploading (squoosh.app is free) — aim for under 300 KB per photo so the site
stays fast on mobile data.
