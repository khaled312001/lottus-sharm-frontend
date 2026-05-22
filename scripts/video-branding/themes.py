# -*- coding: utf-8 -*-
"""
Theme registry — 50 curated creative presets.

Each theme bundles a colour grade, layout, music (genre/scale/progression/seed),
title typography style, ambience bed and a set of visual-fx toggles. Pick a theme
by name, by index, or let the orchestrator rotate/seed through them so a batch of
50 clips all look and sound different.

Override the title text per video from the CLI; the defaults here are
tourism-flavoured so a theme looks finished even untouched.
"""
from __future__ import annotations

import config as C

# accent palettes (accent, accent_light, title)
PALETTES = {
    "gold":    (C.GOLD, C.GOLD_LIGHT, C.WHITE),
    "silver":  ((188, 196, 206), (226, 231, 237), C.WHITE),
    "cyan":    ((96, 200, 220), (176, 234, 244), C.WHITE),
    "coral":   ((255, 146, 116), (255, 190, 168), C.WHITE),
    "emerald": ((150, 200, 130), (192, 226, 170), C.WHITE),
    "rose":    ((232, 150, 182), (245, 196, 216), C.WHITE),
    "sand":    (C.SAND, (240, 226, 200), C.WHITE),
}

# default fx profile; themes override selectively
_DEFAULT_FX = dict(
    bloom=True, halation=False, chroma=False, grain=0.04, sharpen=0.35,
    vignette=0.5, letterbox=False, light_leak=None, bokeh=False, dust=False,
    ken_burns=(1.0, 1.10, (0.0, 0.0)),
)


def _fx(**over):
    d = dict(_DEFAULT_FX)
    d.update(over)
    return d


# (name, kicker, title, subtitle, grade, genre, scale, prog, style, layout,
#  ambience, accent, fx)
_RAW = [
 ("Coral Dawn", "Discover", "SHARM EL SHEIKH", "WHERE DESERT MEETS THE SEA",
  "golden_hour", "tropical_house", "major", "pop", "cinematic_serif",
  "full_bleed", "ocean", "gold", _fx(halation=True, light_leak=(255,180,110), bokeh=True)),

 ("Azure Drift", "Dive into", "THE RED SEA", "CRYSTAL CLEAR WATERS",
  "azure_sea", "deep_house", "minor", "deep", "kinetic_bold",
  "full_bleed", "ocean", "cyan", _fx(chroma=True, ken_burns=(1.0,1.12,(0.05,0)))),

 ("Desert Mirage", "Journey to", "THE SINAI", "ANCIENT SANDS, TIMELESS SKY",
  "vintage_film", "oriental", "hijaz", "modal", "elegant_script",
  "full_bleed", "wind", "sand", _fx(grain=0.06, light_leak=(255,200,120))),

 ("Golden Hour", "Experience", "SUNSET CRUISE", "SAIL INTO THE GLOW",
  "sunset_glow", "bossa", "major", "emotional", "cinematic_serif",
  "full_bleed", "ocean", "coral", _fx(halation=True, bokeh=True)),

 ("Neon Reef", "Explore", "UNDERWATER WORLD", "A UNIVERSE BELOW",
  "vibrant_tropical", "synthwave", "minor", "pop", "kinetic_bold",
  "full_bleed", "none", "cyan", _fx(bloom=True, chroma=True, dust=True)),

 ("Soft Tide", "Relax at", "NABQ BAY", "SLOW DOWN BY THE SHORE",
  "pastel_dream", "lofi", "dorian", "lofi", "pastel",
  "full_bleed", "ocean", "rose", _fx(bloom=True, grain=0.05, vignette=0.4)),

 ("Epic Sands", "Adventure in", "THE DESERT", "RIDE THE DUNES",
  "teal_orange", "epic_drums", "minor", "cinematic", "kinetic_bold",
  "framed", "wind", "gold", _fx(letterbox=True, chroma=True)),

 ("Emerald Lagoon", "Snorkel at", "RAS MOHAMED", "NATURE'S AQUARIUM",
  "emerald", "ambient", "lydian", "modal", "elegant_script",
  "full_bleed", "ocean", "emerald", _fx(bloom=True, bokeh=True)),

 ("Bedouin Night", "Taste", "DESERT NIGHTS", "STARS, FIRE & TEA",
  "noir", "oriental", "nahawand", "modal", "cinematic_serif",
  "framed", "wind", "gold", _fx(grain=0.07, vignette=0.65, light_leak=(255,150,80))),

 ("Crystal Blue", "Swim in", "THE BLUE HOLE", "DAHAB'S LEGEND",
  "azure_sea", "ambient", "minor", "modal", "split_reveal",
  "full_bleed", "ocean", "cyan", _fx(bloom=True, ken_burns=(1.0,1.14,(0,0.05)))),

 ("Tropical Pulse", "Feel the", "BEACH VIBES", "SUN, SEA & RHYTHM",
  "vibrant_tropical", "tropical_house", "major", "pop", "kinetic_bold",
  "full_bleed", "none", "coral", _fx(bokeh=True, light_leak=(255,170,120))),

 ("Vintage Voyage", "A classic", "RED SEA TALE", "TIMELESS MEMORIES",
  "vintage_film", "folk_acoustic", "major", "pop", "elegant_script",
  "framed", "wind", "sand", _fx(grain=0.08, vignette=0.6)),

 ("Midnight Marina", "Evenings at", "THE MARINA", "CITY LIGHTS ON WATER",
  "dusk_purple", "deep_house", "minor", "deep", "kinetic_bold",
  "full_bleed", "none", "silver", _fx(chroma=True, bloom=True, bokeh=True)),

 ("Sunlit Shore", "Mornings on", "THE BEACH", "FIRST LIGHT, FIRST DIVE",
  "golden_hour", "folk_acoustic", "major", "pop", "cinematic_serif",
  "full_bleed", "ocean", "gold", _fx(halation=True, bokeh=True)),

 ("Deep Current", "Descend into", "THE DEEP", "WHERE SILENCE SPEAKS",
  "noir", "cinematic", "minor", "cinematic", "split_reveal",
  "full_bleed", "shimmer", "silver", _fx(letterbox=True, vignette=0.7, bloom=True)),

 ("Oasis Calm", "Find your", "OASIS", "BREATHE. UNWIND. REPEAT.",
  "pastel_dream", "ambient", "lydian", "modal", "pastel",
  "full_bleed", "wind", "emerald", _fx(bloom=True, grain=0.04, vignette=0.4)),

 ("Festival Reef", "Party at", "SOHO SQUARE", "NIGHTS YOU WON'T FORGET",
  "vibrant_tropical", "synthwave", "minor", "pop", "kinetic_bold",
  "full_bleed", "none", "rose", _fx(chroma=True, bloom=True, bokeh=True)),

 ("Ancient Echoes", "Walk through", "OLD MARKET", "SPICE, GOLD & STORIES",
  "vintage_film", "oriental", "hijaz", "modal", "elegant_script",
  "framed", "wind", "sand", _fx(grain=0.07, light_leak=(255,190,120))),

 ("Silk Sunset", "Watch the", "SKY BURN", "GOLD INTO VIOLET",
  "sunset_glow", "cinematic", "minor", "emotional", "cinematic_serif",
  "full_bleed", "ocean", "coral", _fx(halation=True, letterbox=True, bokeh=True)),

 ("Reef Rush", "Chase the", "CORAL GARDENS", "COLOUR IN MOTION",
  "vibrant_tropical", "tropical_house", "major", "pop", "kinetic_bold",
  "full_bleed", "ocean", "cyan", _fx(bloom=True, dust=True)),

 ("Whispering Dunes", "Cross the", "GOLDEN DUNES", "INTO THE QUIET",
  "golden_hour", "ambient", "dorian", "modal", "elegant_script",
  "full_bleed", "wind", "sand", _fx(grain=0.05, light_leak=(255,200,130))),

 ("Lagoon Lullaby", "Drift at", "SHARM LAGOON", "STILL WATER, SOFT LIGHT",
  "pastel_dream", "lofi", "dorian", "lofi", "pastel",
  "full_bleed", "ocean", "rose", _fx(bloom=True, vignette=0.4, grain=0.05)),

 ("Storm & Stone", "Conquer", "MOUNT SINAI", "CLIMB BEFORE DAWN",
  "bleach", "epic_drums", "minor", "cinematic", "kinetic_bold",
  "framed", "wind", "silver", _fx(letterbox=True, chroma=True, grain=0.06)),

 ("Pearl Morning", "Begin at", "SUNRISE POINT", "THE SEA AWAKES",
  "crisp", "folk_acoustic", "major", "pop", "cinematic_serif",
  "full_bleed", "ocean", "gold", _fx(bloom=True, bokeh=True)),

 ("Velvet Deep", "Lose yourself", "AT NIGHT", "THE COAST GLOWS",
  "dusk_purple", "deep_house", "minor", "deep", "split_reveal",
  "full_bleed", "none", "rose", _fx(chroma=True, bloom=True, bokeh=True)),

 ("Saffron Trail", "Follow the", "SPICE ROUTE", "FLAVOURS OF THE EAST",
  "golden_hour", "oriental", "hijaz", "modal", "elegant_script",
  "framed", "wind", "sand", _fx(grain=0.06, light_leak=(255,190,110))),

 ("Glass Sea", "Glide over", "STILL WATERS", "A MIRROR TO THE SKY",
  "azure_sea", "ambient", "lydian", "modal", "cinematic_serif",
  "full_bleed", "ocean", "cyan", _fx(bloom=True, ken_burns=(1.0,1.10,(0.04,0)))),

 ("Sunset Sail", "Board the", "YACHT", "GOLDEN HOUR AFLOAT",
  "sunset_glow", "bossa", "major", "emotional", "cinematic_serif",
  "full_bleed", "ocean", "coral", _fx(halation=True, bokeh=True)),

 ("Electric Lagoon", "Night dive", "BIOLUMINESCENCE", "THE SEA GLOWS BACK",
  "noir", "synthwave", "minor", "pop", "kinetic_bold",
  "full_bleed", "none", "cyan", _fx(bloom=True, chroma=True, dust=True, vignette=0.7)),

 ("Henna Sky", "Evenings of", "DESERT HENNA", "ART UNDER STARS",
  "dusk_purple", "oriental", "nahawand", "modal", "elegant_script",
  "framed", "wind", "rose", _fx(grain=0.06, light_leak=(255,160,120))),

 ("Marine Blue", "Meet the", "DOLPHINS", "FRIENDS OF THE DEEP",
  "azure_sea", "tropical_house", "major", "pop", "kinetic_bold",
  "full_bleed", "ocean", "cyan", _fx(bloom=True, bokeh=True)),

 ("Amber Calm", "Slow mornings", "AT THE RESORT", "COFFEE & SEA BREEZE",
  "vintage_film", "lofi", "dorian", "lofi", "pastel",
  "full_bleed", "ocean", "sand", _fx(grain=0.06, bloom=True, vignette=0.45)),

 ("Titan Tide", "Feel the", "POWER OF THE SEA", "WAVES THAT MOVE YOU",
  "teal_orange", "epic_drums", "minor", "cinematic", "kinetic_bold",
  "full_bleed", "ocean", "gold", _fx(letterbox=True, chroma=True, bloom=True)),

 ("Lotus Bloom", "The story of", "LOTUS SHARM", "YOUR JOURNEY BEGINS",
  "golden_hour", "cinematic", "major", "emotional", "cinematic_serif",
  "framed", "ocean", "gold", _fx(halation=True, bokeh=True, letterbox=True)),

 ("Cobalt Night", "After dark", "ON THE REEF", "A DIFFERENT WORLD",
  "dusk_purple", "deep_house", "minor", "deep", "split_reveal",
  "full_bleed", "shimmer", "silver", _fx(bloom=True, chroma=True, bokeh=True)),

 ("Palm Shade", "Lazy days", "BY THE POOL", "PALMS & PARADISE",
  "vibrant_tropical", "bossa", "major", "pop", "cinematic_serif",
  "full_bleed", "none", "emerald", _fx(bloom=True, bokeh=True)),

 ("Mystic Wadi", "Hike the", "COLOURED CANYON", "WALLS OF TIME",
  "emerald", "ambient", "dorian", "modal", "elegant_script",
  "full_bleed", "wind", "sand", _fx(grain=0.05, light_leak=(255,200,130))),

 ("Rosé Horizon", "Toast to", "THE HORIZON", "ENDLESS SUMMER",
  "sunset_glow", "tropical_house", "major", "pop", "kinetic_bold",
  "full_bleed", "ocean", "rose", _fx(halation=True, bokeh=True, light_leak=(255,150,170))),

 ("Iron Coast", "Raw beauty of", "THE COAST", "STONE MEETS SWELL",
  "bleach", "cinematic", "minor", "cinematic", "split_reveal",
  "full_bleed", "ocean", "silver", _fx(letterbox=True, grain=0.06, vignette=0.6)),

 ("Sugar Sand", "Barefoot on", "WHITE SAND", "SOFT AS A DREAM",
  "pastel_dream", "folk_acoustic", "major", "pop", "pastel",
  "full_bleed", "ocean", "sand", _fx(bloom=True, bokeh=True, grain=0.04)),

 ("Phoenix Sky", "Rise with", "THE SUN", "A NEW DAY OVER SINAI",
  "golden_hour", "epic_drums", "minor", "cinematic", "kinetic_bold",
  "framed", "wind", "gold", _fx(halation=True, letterbox=True)),

 ("Teal Mirage", "Float in", "TURQUOISE", "THE COLOUR OF CALM",
  "azure_sea", "lofi", "dorian", "lofi", "pastel",
  "full_bleed", "ocean", "cyan", _fx(bloom=True, grain=0.05, vignette=0.4)),

 ("Caravan", "Trek with", "THE CAMELS", "ACROSS THE GOLD",
  "vintage_film", "oriental", "hijaz", "modal", "elegant_script",
  "framed", "wind", "sand", _fx(grain=0.07, light_leak=(255,190,110))),

 ("Lush Reef", "A garden", "BENEATH THE WAVES", "LIFE IN FULL COLOUR",
  "vibrant_tropical", "ambient", "lydian", "modal", "cinematic_serif",
  "full_bleed", "ocean", "emerald", _fx(bloom=True, bokeh=True, dust=True)),

 ("Indigo Wave", "Catch the", "NIGHT SWELL", "MOONLIGHT ON THE SEA",
  "dusk_purple", "synthwave", "minor", "pop", "kinetic_bold",
  "full_bleed", "none", "silver", _fx(chroma=True, bloom=True, bokeh=True)),

 ("Honey Light", "Warm welcome", "TO SHARM", "HOSPITALITY & HEART",
  "golden_hour", "bossa", "major", "emotional", "cinematic_serif",
  "full_bleed", "ocean", "gold", _fx(halation=True, bokeh=True)),

 ("Stormlight", "Drama over", "THE GULF", "SKIES IN MOTION",
  "teal_orange", "cinematic", "minor", "cinematic", "split_reveal",
  "full_bleed", "wind", "gold", _fx(letterbox=True, chroma=True, bloom=True, vignette=0.6)),

 ("Mint Lagoon", "Cool off at", "THE LAGOON", "FRESH, BRIGHT, ALIVE",
  "emerald", "tropical_house", "major", "pop", "kinetic_bold",
  "full_bleed", "ocean", "emerald", _fx(bloom=True, bokeh=True)),

 ("Dune Serenade", "Sunset over", "THE SANDS", "A DESERT SONG",
  "sunset_glow", "oriental", "hijaz", "modal", "elegant_script",
  "full_bleed", "wind", "coral", _fx(halation=True, grain=0.05, light_leak=(255,170,110))),

 ("Pure Horizon", "Nothing but", "SEA & SKY", "INFINITE BLUE",
  "crisp", "ambient", "lydian", "modal", "cinematic_serif",
  "full_bleed", "ocean", "cyan", _fx(bloom=True, ken_burns=(1.0,1.12,(0,0.04)))),

 ("Lantern Souk", "Lose time in", "THE SOUK", "LANTERNS & LAUGHTER",
  "vintage_film", "oriental", "nahawand", "modal", "elegant_script",
  "framed", "wind", "gold", _fx(grain=0.07, bokeh=True, light_leak=(255,180,100))),
]

_KEYS = [60, 62, 64, 65, 67, 69, 57, 59, 55, 53]   # rotate musical keys


def _build():
    themes = []
    for i, r in enumerate(_RAW):
        (name, kicker, title, subtitle, grade, genre, scale, prog, style,
         layout, ambience, accent, fx) = r
        acc, acc_l, title_col = PALETTES[accent]
        themes.append(dict(
            index=i, name=name,
            kicker=kicker, title=title, subtitle=subtitle,
            grade=grade, layout=layout, style=style, ambience=ambience,
            music=dict(genre=genre, scale=scale, prog=prog,
                       seed=i * 7 + 3, key=_KEYS[i % len(_KEYS)]),
            palette=dict(accent=acc, accent_light=acc_l, title=title_col),
            fx=fx,
        ))
    return themes


THEMES = _build()
BY_NAME = {t["name"].lower(): t for t in THEMES}


def get(ref):
    """Resolve a theme by index, name (case-insensitive) or 'random'."""
    import random
    if ref in (None, "random", "rand"):
        return random.choice(THEMES)
    if isinstance(ref, int) or (isinstance(ref, str) and ref.isdigit()):
        return THEMES[int(ref) % len(THEMES)]
    return BY_NAME.get(str(ref).lower(), THEMES[0])


def names():
    return [f'{t["index"]:2d}  {t["name"]:18s} {t["grade"]:14s} {t["music"]["genre"]}'
            for t in THEMES]


if __name__ == "__main__":
    print(f"{len(THEMES)} themes:\n")
    print("\n".join(names()))
