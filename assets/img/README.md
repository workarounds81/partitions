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

## The floorplan background

A line drawing of a unit floorplan sits fixed behind the whole page and
draws itself in once on load, left to right. It does **not** load the
floorplan image - that would be a 1MB PNG for a background. The plan is
run-length encoded at build time into `assets/js/floorplan-data.js`
(~7KB gzipped) as solid runs, which render as continuous line work.

To regenerate it from a different plan, run this from `assets/img/`:

```python
from PIL import Image
import json
G, THRESH = 420, 150
im = Image.open('floorplan.png').convert('L').resize((G, G), Image.LANCZOS)
px = im.load()
runs = []
for y in range(G):
    x = 0
    while x < G:
        if px[x, y] < THRESH:
            start = x
            while x < G and px[x, y] < THRESH:
                x += 1
            runs.append((start, y, x - start))
        else:
            x += 1
runs.sort(key=lambda r: (r[0], r[1]))      # left-to-right sweep
flat = [v for r in runs for v in r]
open('../js/floorplan-data.js', 'w').write(
    'window.FLOORPLAN={g:%d,r:%s};\n' % (G, json.dumps(flat, separators=(',', ':'))))
```

Raise `THRESH` to catch fainter lines, `G` for more detail at a larger
payload. Rendering lives in `initFloorPlan()` in `assets/js/main.js` -
size, position and opacity (`ALPHA`) are the knobs worth touching.
