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

## The animated backdrop

`background.webp` is the partition timelapse (`assets/background.gif` on the
upload branch) reduced to black and orange pixel dots. It sits fixed behind
the whole page, masked so its density stays out in the right margin.

The source GIF is 6.9MB - far too heavy to ship. The dotted version is 64KB,
a 99% saving, because two flat colours on transparency compress extremely
well. Browsers without animated WebP still show a static first frame, which
reads fine.

To regenerate from a new clip, run this from `assets/img/` with the source
GIF alongside it:

```python
from PIL import Image, ImageDraw, ImageOps
INK, ACC, BG = (14,22,32), (232,86,42), (255,255,255)
GW, GH, CELL = 40, 71, 8          # dot grid, and pixels per dot
T_SKIP, T_INK = 0.56, 0.72        # skip below, ink above, orange between
STEP = 2                          # take every Nth source frame
src = Image.open('background.gif')

def dotify(frame):
    g = ImageOps.autocontrast(frame.convert('L').resize((GW, GH), Image.LANCZOS), cutoff=2)
    px = g.load()
    out = Image.new('RGBA', (GW*CELL, GH*CELL), (0,0,0,0))
    d = ImageDraw.Draw(out)
    for y in range(GH):
        for x in range(GW):
            dark = 1 - px[x, y]/255
            if dark <= T_SKIP: continue
            ink = dark > T_INK
            r = CELL-2 if ink else CELL-3
            ox, oy = x*CELL + (CELL-r)//2, y*CELL + (CELL-r)//2
            d.rectangle([ox, oy, ox+r-1, oy+r-1], fill=(INK if ink else ACC)+(255,))
    return out

frames = []
for i in range(0, src.n_frames, STEP):
    src.seek(i)
    frames.append(dotify(src.convert('RGB')))
frames[0].save('background.webp', save_all=True, append_images=frames[1:],
               loop=0, duration=200, lossless=True, method=6)
```

Lower `T_SKIP` for a denser image, raise it to thin it out. `CELL` controls
how chunky the pixels look. Size, position and opacity are the `.site-bg`
rules in `assets/css/style.css`.
