# -*- coding: utf-8 -*-
"""
Central configuration for the Lotus Sharm Travel cinematic branding pipeline.

Everything tweakable lives here: brand identity, palette, canvas size, fonts and
the on-disk paths. Paths default to values derived from this file's location so
the toolkit is portable across machines; override them with CLI flags or env
vars instead of editing code.
"""
from __future__ import annotations

import os
from pathlib import Path

# --------------------------------------------------------------------- paths
HERE = Path(__file__).resolve().parent
FRONTEND_ROOT = HERE.parent.parent                      # lottus-sharm-frontend/
PUBLIC_DIR = FRONTEND_ROOT / "public"

# Work / cache dir for generated overlays, music and intermediate art.
WORK_DIR = Path(os.environ.get("LOTUS_WORK_DIR", HERE / "_work"))
OUT_DIR = Path(os.environ.get("LOTUS_OUT_DIR", HERE / "_out"))

# Drop royalty-free tracks (e.g. Pixabay "tourism" music) here; the pipeline
# uses them automatically instead of the synthesiser when the folder is filled.
MUSIC_DIR = Path(os.environ.get("LOTUS_MUSIC_DIR", HERE / "music_library"))
MUSIC_EXTS = (".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac")

# Logo: prefer a transparent PNG if present, else the shipped jpg.
def _find_logo() -> Path:
    for name in ("logo.png", "logo-mark.png", "logo.jpg", "logo.jpeg"):
        p = PUBLIC_DIR / name
        if p.exists():
            return p
    return PUBLIC_DIR / "logo.jpg"


LOGO = Path(os.environ.get("LOTUS_LOGO", _find_logo()))

# --------------------------------------------------------------------- brand
BRAND = "LOTUS SHARM TRAVEL"
BRAND_AR = "لوتس شرم"
WEBSITE = "lotussharm.com"
PHONE = "+20 109 076 7278"
TAGLINE = "WHERE DESERT MEETS THE SEA"

# --------------------------------------------------------------------- canvas
# Full-HD vertical, the native canvas for TikTok / Reels / Shorts.
W, H = 1080, 1920
FPS = 30

# --------------------------------------------------------------------- palette
# Core identity colours (RGB 0-255).
TEAL = (0, 49, 54)
TEAL_DARK = (0, 28, 32)
TEAL_DEEP = (0, 18, 21)
TEAL_LIGHT = (10, 78, 82)
GOLD = (201, 168, 106)
GOLD_LIGHT = (231, 205, 148)
GOLD_BRIGHT = (245, 226, 174)
WHITE = (238, 238, 232)
SAND = (224, 206, 174)
WA_GREEN = (37, 211, 102)
INK = (8, 12, 14)

# --------------------------------------------------------------------- fonts
# Windows ships these; fall back gracefully if missing.
FONTS = {
    "serif": "georgia.ttf",
    "serif_bold": "georgiab.ttf",
    "serif_italic": "georgiai.ttf",
    "sans": "arial.ttf",
    "sans_bold": "arialbd.ttf",
    "script": "FREESCPT.TTF",
    "symbol": "seguisym.ttf",
    "display": "trajanpro.ttf",       # optional; falls back to serif_bold
    "condensed": "BEBAS___.ttf",      # optional; falls back to sans_bold
}


def font_path(key_or_name: str) -> str:
    """Resolve a font key (or raw filename) to a usable .ttf path."""
    name = FONTS.get(key_or_name, key_or_name)
    candidates = [
        name,
        os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts", name),
        str(HERE / "fonts" / name),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    # last resort: a guaranteed-present core font
    fallback = os.path.join(os.environ.get("WINDIR", r"C:\Windows"),
                            "Fonts", "arial.ttf")
    return fallback if os.path.exists(fallback) else name


def ensure_dirs() -> None:
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    MUSIC_DIR.mkdir(parents=True, exist_ok=True)


def music_tracks():
    """Sorted list of audio files in the music library (may be empty)."""
    if not MUSIC_DIR.exists():
        return []
    return sorted(p for p in MUSIC_DIR.iterdir()
                  if p.suffix.lower() in MUSIC_EXTS)
