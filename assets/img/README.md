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
upload branch), washed out to light grey on white and played full-bleed and
centred behind the whole page via `.site-bg` in `style.css`.

The source GIF is 6.9MB - far too heavy to ship. The washed version is 180KB.

Two things that matter if you regenerate it:

- **Bake the wash into the frames, don't do it with CSS opacity alone.**
  Squeezing the tones into a narrow light range is what makes it compress:
  the same clip at full greyscale contrast came out at 1.7MB, roughly ten
  times larger, because there is far more frame-to-frame variation to encode.
- **Use lossy here.** This is continuous-tone footage, so lossy WebP is ideal
  and quality 45 is visually identical to 80 once the tones are this flat.
  (The opposite was true of the old flat two-colour dot version, where lossy
  ballooned the file.)

To regenerate from a new clip, run this from `assets/img/` with the source
GIF alongside:

```python
from PIL import Image, ImageOps, ImageEnhance
LO, HI = 214, 255                 # darkest grey -> white; raise LO to fade
W, H, STEP = 720, 1278, 3         # output size, and take every Nth frame
src = Image.open('background.gif')

def wash(frame):
    g = frame.convert('L').resize((W, H), Image.LANCZOS)
    g = ImageOps.autocontrast(g, cutoff=1)
    g = ImageEnhance.Contrast(g).enhance(1.15)
    return g.point([round(LO + (HI-LO)*(v/255)) for v in range(256)]).convert('RGB')

frames = []
for i in range(0, src.n_frames, STEP):
    src.seek(i)
    frames.append(wash(src.convert('RGB')))
frames[0].save('background.webp', save_all=True, append_images=frames[1:],
               loop=0, duration=300, lossless=False, quality=45, method=4)
```

### Keep an eye on contrast

The backdrop sits behind body copy, so it has to stay light. At the current
settings the darkest pixel behind text is about rgb(225), which gives the
muted body colour 5.2:1 - clear of the 4.5:1 WCAG AA minimum. If you darken
it (lower `LO`, or raise `.site-bg` opacity), re-check that, or drop the
`--muted` token a shade to compensate.

## Cache busting

`index.html` loads the CSS and JS with a `?v=N` query string. GitHub Pages
lets browsers hold assets well past a deploy, so without it a fresh
`index.html` can render against a stale stylesheet - which looks like the
site has exploded. **Bump that number whenever you edit `style.css`,
`main.js` or `config.js`.**
