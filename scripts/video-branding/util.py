# -*- coding: utf-8 -*-
"""Shared helpers: easing curves, font loading, PIL/numpy bridges, drawing."""
from __future__ import annotations

import math
from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

import config as C


# ----------------------------------------------------------------- fonts
@lru_cache(maxsize=128)
def font(key_or_name: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(C.font_path(key_or_name), size)
    except Exception:
        return ImageFont.load_default()


# ----------------------------------------------------------------- easing
def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def ease_out_cubic(t):
    t = clamp(t)
    return 1 - (1 - t) ** 3


def ease_in_out_cubic(t):
    t = clamp(t)
    return 4 * t ** 3 if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2


def ease_out_expo(t):
    t = clamp(t)
    return 1.0 if t >= 1 else 1 - 2 ** (-10 * t)


def ease_out_back(t, s=1.70158):
    t = clamp(t)
    t -= 1
    return t * t * ((s + 1) * t + s) + 1


def ease_out_elastic(t):
    t = clamp(t)
    if t in (0.0, 1.0):
        return t
    p = 0.42
    return 2 ** (-10 * t) * math.sin((t - p / 4) * (2 * math.pi) / p) + 1


def smoothstep(a, b, x):
    t = clamp((x - a) / (b - a)) if b != a else (0.0 if x < a else 1.0)
    return t * t * (3 - 2 * t)


def lerp(a, b, t):
    return a + (b - a) * t


def lerp_color(c1, c2, t):
    return tuple(int(round(lerp(c1[i], c2[i], t))) for i in range(3))


# ----------------------------------------------------------------- pil/np
def pil_to_np(img: Image.Image) -> np.ndarray:
    return np.asarray(img)


def np_to_pil(arr: np.ndarray) -> Image.Image:
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def vertical_gradient(w, h, stops):
    """stops: list of (pos0-1, (r,g,b)). Returns RGB PIL image."""
    stops = sorted(stops, key=lambda s: s[0])
    ys = np.linspace(0, 1, h)
    cols = np.zeros((h, 3))
    for i in range(3):
        xp = [s[0] for s in stops]
        fp = [s[1][i] for s in stops]
        cols[:, i] = np.interp(ys, xp, fp)
    arr = np.repeat(cols[:, None, :], w, axis=1)
    return np_to_pil(arr)


def radial_gradient(w, h, inner, outer, cx=0.5, cy=0.5, radius=0.75, power=1.0):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx = (xx / w - cx)
    dy = (yy / h - cy) * (h / w)          # aspect-correct
    d = np.sqrt(dx * dx + dy * dy) / radius
    d = np.clip(d, 0, 1) ** power
    out = np.zeros((h, w, 3), np.float32)
    for i in range(3):
        out[:, :, i] = inner[i] * (1 - d) + outer[i] * d
    return np_to_pil(out)


def gaussian(img: Image.Image, radius: float) -> Image.Image:
    return img.filter(ImageFilter.GaussianBlur(radius))


def measure(draw, text, fnt):
    return draw.textlength(text, font=fnt)


def tracked_width(draw, text, fnt, tracking):
    return sum(draw.textlength(ch, font=fnt) for ch in text) + tracking * max(0, len(text) - 1)


def draw_tracked(draw, x, y, text, fnt, fill, tracking=0, anchor_center=None,
                 shadow=None):
    """Draw letter-spaced text. anchor_center: if set, x is the centre x."""
    w = tracked_width(draw, text, fnt, tracking)
    if anchor_center:
        x = anchor_center - w / 2
    for ch in text:
        if shadow:
            sx, sy, scol = shadow
            draw.text((x + sx, y + sy), ch, font=fnt, fill=scol, anchor="la")
        draw.text((x, y), ch, font=fnt, fill=fill, anchor="la")
        x += draw.textlength(ch, font=fnt) + tracking
    return w


def with_alpha(rgb, a):
    return (rgb[0], rgb[1], rgb[2], int(a))
