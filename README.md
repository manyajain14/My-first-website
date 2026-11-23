# The Midnight Library — an aspirational journal

A fan-made interactive tribute website inspired by Matt Haig's novel *The Midnight Library*.

Navy night sky, white serif type, and a little window with a multicoloured glass frame.
Click the window, tell the library your name, age, and whose life you wish to borrow —
and it pulls three volumes from its shelf for you:

1. **The life you asked for** — matched to whatever you typed (a K-pop idol, a doctor who
   cleared NEET, an IIT engineer, a model, a scientist…).
2. **A neighbouring life** — a related shelf pulled quietly beside it.
3. **The Life That Never Doubted** — the version where everything simply went right.

Each volume is written as a short journal (four chapters and a whispered lesson),
and every book ends the way the novel does: among all the lives you could have lived,
the most perfect role you can play is **you**.

## Run it

No build step, no dependencies:

```bash
# either just open the file in a browser...
open index.html            # macOS
xdg-open index.html        # Linux

# ...or serve it
python3 -m http.server 8000
```

## How it works

| File | Purpose |
| --- | --- |
| `index.html` | Landing window, details form, shelf, reader, epilogue |
| `css/style.css` | Navy/gold theme, Times New Roman, glass window animation, bookshelf |
| `js/stars.js` | Layered twinkling starfield canvas: far/near stars, nebula wash, shooting stars |
| `js/audio.js` | Synthesized sound effects (Web Audio API): window whoosh + bells, page turns, ambient pad, mute toggle |
| `js/lives.js` | The "life engine": keyword-matched story archetypes + a generator that writes each borrowed life around your name and age |
| `js/app.js` | Screen flow, page-turning reader, constellation epilogue, text-file downloads |

Your details are stored only in your own browser (`localStorage`) so the library
can keep your seat warm. Nothing ever leaves the page.
