# Lotus Sharm Travel — Cinematic Auto-Editor

Turns a raw clip into a **professionally-montaged vertical (9:16) tourism video**:
a branded intro, a colour-graded + effected body with a kinetic title and a
living lower-third, a branded outro, and a fully synthesised soundtrack with
sound-design and ambience — all royalty-free.

Built for batches: ship it ~50 clips and every output looks and sounds
different (different colour grade, music genre, title motion, fx and ambience),
while the **intro and outro stay identical** so the channel keeps one signature.

---

## Install

```bash
pip install moviepy imageio-ffmpeg scipy numpy pillow
```

`imageio-ffmpeg` bundles ffmpeg — no system install needed. Fonts (Georgia,
Arial, Freestyle Script) ship with Windows; drop extras in `./fonts/`.

## Quick start

```bash
# one video, a named look
python brand_video.py "clip.mp4" --theme "Coral Dawn"

# pick by index, override the on-screen title
python brand_video.py "clip.mp4" --theme 8 --title "RAS MOHAMED" --kicker "Dive"

# let it surprise you
python brand_video.py "clip.mp4" --theme random

# render the SAME clip in every one of the themes
python brand_video.py "clip.mp4" --all

# see the catalogue / preview every music genre
python brand_video.py --list
python brand_video.py --music-pack
```

Outputs land in `./_out/`. Intermediate art/music caches in `./_work/`.

### For a batch of 50 different clips

Give each clip its own theme index so the looks spread across the catalogue:

```bash
python brand_video.py "clip01.mp4" --theme 0  --title "RAS MOHAMED"
python brand_video.py "clip02.mp4" --theme 1  --title "BLUE HOLE"
python brand_video.py "clip03.mp4" --theme 2  --title "DESERT SAFARI"
...
```

(or script a loop). Themes are pre-tuned to be mutually distinct.

---

## Flags

| Flag | Meaning |
|------|---------|
| `--theme` | theme name (`"Azure Drift"`), index (`12`), or `random` |
| `--all` | render the input in every theme |
| `--title / --kicker / --subtitle` | override the on-screen text |
| `--no-intro / --no-outro` | drop a bookend |
| `--fast` | skip the heavy glow passes (bloom/halation/leak) for quick drafts |
| `--max N` | use only the first N seconds of the source |
| `--fps / --crf` | output frame-rate / x264 quality (lower crf = better) |
| `--out` | explicit output path (single render) |

---

## How it's built

| Module | Role |
|--------|------|
| `config.py` | brand identity, palette, canvas (1080×1920), fonts, paths |
| `colorgrade.py` | 12 cinematic looks (teal-orange, golden hour, noir, …) |
| `fx.py` | vignette, film grain, bloom, halation, chromatic aberration, light leaks, bokeh & dust particles, letterbox, Ken-Burns, flash |
| `titles.py` | kinetic typography (fade-rise, scale-punch, mask-wipe) |
| `frame.py` | persistent logo badge + animated lower-third (site \| brand \| phone) with a travelling gold light-sweep |
| `bookends.py` | fixed cinematic **intro** & **outro** (logo reveal, brand, website, phone, CTA) |
| `music_engine.py` | 10 music genres (tropical house, deep house, lo-fi, cinematic, ambient, **oriental/Hijaz**, synthwave, bossa, folk, epic drums) — scales, chords, instruments, drums |
| `sound_design.py` | whooshes, impacts/booms, risers, sub-drops, sparkle, ocean/wind/shimmer beds |
| `audio_mixer.py` | bed laying, sidechain ducking, mastering → moviepy audio |
| `themes.py` | **curated presets** combining all of the above |
| `brand_video.py` | the orchestrator + CLI |

### The themes
Each theme = colour grade + layout (full-bleed / framed) + music
(genre · scale · progression · key · seed) + title style + ambience + fx toggles
+ accent palette. `python brand_video.py --list` prints them all.

---

## Editing the brand
Everything brand-level lives at the top of `config.py` — `BRAND`, `WEBSITE`,
`PHONE`, `TAGLINE`, the colours and the logo lookup (`public/logo.*`).
Change once; every theme, intro, outro and lower-third follows.

## Notes
- All music is **synthesised from scratch** — public-domain by authorship, no
  licensing, no attribution, safe for monetised channels.
- Heavy glow effects are per-frame Python; a full themed render is ~1–3 min.
  Use `--fast` for drafts, drop `--fast` for finals.
- Output is H.264 + AAC, `yuv420p`, ready for TikTok / Reels / Shorts.

## Legacy
The original first-generation scripts (`make_branded_video.py`,
`make_branded_video_v2.py`, `music.py`) are kept for reference; the pipeline
above supersedes them.
