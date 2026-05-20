# Video Branding Scripts — Lotus Sharm Travel

Python scripts that wrap a raw clip in the Lotus Sharm Travel theme (teal + gold
frame, gold corner brackets, circular logo badge, info bar), add an animated
cinematic title, and attach fully royalty-free synthesised music.

## Files

| File | Purpose |
|------|---------|
| `make_branded_video.py` | Builds the static frame overlay (frame, brackets, logo badge, info bar) and renders a basic branded video. |
| `make_branded_video_v2.py` | Enhanced version: animated title (`Discover / SHARM EL SHEIKH`), gradient scrim for legibility, mutes original audio, renders **two** versions (tropical + cinematic). |
| `music.py` | Procedurally generates royalty-free background music (public domain by authorship). Two moods: `tropical` (upbeat) and `cinematic` (calm). Writes 16-bit stereo WAV — no external assets, no attribution required. |

## Requirements

```bash
pip install moviepy imageio-ffmpeg opencv-python pillow numpy
```

`imageio-ffmpeg` bundles a static ffmpeg binary, so no system ffmpeg install is
needed. Fonts used (Georgia, Freestyle Script, Arial) ship with Windows.

## Usage

```bash
python make_branded_video_v2.py
```

Paths to the source video, logo, and outputs are defined as constants at the top
of each script — edit them for your machine. Output is vertical **9:16 (660×1338)**,
ready for TikTok / Reels.

### Tweakable settings

- **Theme colours / layout** — top of `make_branded_video.py` (`TEAL`, `GOLD`,
  `SIDE`, `TOP_BAND`, `BOT_BAND`, `RADIUS`).
- **Info-bar text** — `WEBSITE`, `BRAND`, `PHONE`.
- **Title text** — `TITLE`, `KICKER`, `SUBTITLE` in `make_branded_video_v2.py`.
- **Music** — tempo, chord progression, and mix levels in `music.py`.
