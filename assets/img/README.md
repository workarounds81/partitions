# Photos

Real project photos are wired in and live on the site:

| File | Used for |
|---|---|
| `Hero1.jpg` – `Hero4.jpg`, `hero5.jpg` | Hero carousel (5 slides, autoplay + swipe) |
| `before.jpg` / `after.jpg` | Before/after slider in "Our work" |
| `acousticfill.jpg`, `tampinespaint.jpg`, `Lcovelight.jpg`, `officemeetingroom.jpg`, `greenfeaturewall.jpg`, `aircontrunking.jpg` | Gallery grid, one per card |
| `og-image.png` | Link preview when the site is shared on WhatsApp/Facebook |

All were resized and re-compressed on the way in (originals were 1.6–2.2MB
PNGs; JPEGs here are 65–210KB) — 22MB down to 1.7MB total, which matters a
lot on mobile data.

## Swapping a photo later

Find its `<img>` tag in `index.html` (search the filename) and either:

- **Replace the file** at the same path, same filename — nothing else to touch, or
- **Point the `src` at a new file** and update the `alt` text to match.

If you're adding a new photo, compress it first — aim under 250KB. Free
online tool: [squoosh.app](https://squoosh.app). Command line, if you have
Python + Pillow:

```bash
python3 -c "
from PIL import Image
im = Image.open('yourphoto.png').convert('RGB')
if im.width > 1400:
    im = im.resize((1400, round(im.height * 1400 / im.width)))
im.save('yourphoto.jpg', 'JPEG', quality=78, optimize=True)
"
```

## Adding more to the gallery

Copy one `<figure class="shot reveal" data-cat="...">` block in `index.html`
(under `#gallery`), point its `<img src>` at your new file, and set
`data-cat` to `partition`, `painting`, or `ceiling` so it responds to the
filter buttons.
