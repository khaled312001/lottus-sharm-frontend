# -*- coding: utf-8 -*-
"""
Visual effects — the "expensive editor" layer.

Two kinds of helpers:
  * overlay builders -> return RGBA numpy arrays (H,W,4) to composite as ImageClip
  * frame processors  -> return callables for clip.image_transform / clip.transform

Effects: vignette, film grain, bloom/glow, halation, chromatic aberration,
letterbox, light leaks, bokeh particles, light sweep, plus Ken-Burns geometry
and scene-transition flashes.
"""
from __future__ import annotations

import numpy as np
from PIL import Image, ImageFilter

import config as C
import util as U


# ============================================================== overlays
def vignette_overlay(w=C.W, h=C.H, strength=0.55, power=2.2, color=(0, 0, 0)):
    """Dark, soft-edged overlay (alpha) to focus the eye toward the centre."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx = xx / w - 0.5
    dy = (yy / h - 0.5) * (h / w)
    d = np.sqrt(dx * dx + dy * dy) / 0.72
    a = np.clip(d, 0, 1) ** power * (strength * 255)
    out = np.zeros((h, w, 4), np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = color
    out[..., 3] = a.astype(np.uint8)
    return out


def letterbox_overlay(w=C.W, h=C.H, bar_frac=0.11, feather=6):
    """Cinemascope bars top & bottom."""
    out = np.zeros((h, w, 4), np.uint8)
    bar = int(h * bar_frac)
    out[:bar, :, 3] = 255
    out[h - bar:, :, 3] = 255
    if feather:
        a = Image.fromarray(out[..., 3]).filter(ImageFilter.GaussianBlur(feather))
        out[..., 3] = np.asarray(a)
    return out


def edge_glow_overlay(w=C.W, h=C.H, color=C.GOLD, strength=0.18, width=0.06):
    """Soft coloured glow hugging the frame edges (premium rim light)."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    ex = np.minimum(xx, w - 1 - xx) / (w * width)
    ey = np.minimum(yy, h - 1 - yy) / (h * width)
    e = np.clip(np.minimum(ex, ey), 0, 1)
    a = (1 - e) ** 2 * (strength * 255)
    out = np.zeros((h, w, 4), np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = color
    out[..., 3] = a.astype(np.uint8)
    return out


# ============================================================== frame procs
def grain(intensity=0.05, mono=True):
    """Per-frame film grain. Noise is generated at half resolution and upscaled
    (coarser, more film-like, and ~4x cheaper than full-res RNG)."""
    amp = intensity * 255.0

    def f(img):
        h, w = img.shape[:2]
        hh, ww = h // 2, w // 2
        ch = 1 if mono else 3
        small = (np.random.standard_normal((hh, ww, ch)).astype(np.float32) * amp)
        n = np.asarray(Image.fromarray(
            np.clip(small[..., 0] + 128, 0, 255).astype(np.uint8)
            if mono else np.clip(small + 128, 0, 255).astype(np.uint8))
            .resize((w, h), Image.BILINEAR), np.float32)
        n = (n - 128.0)
        if mono:
            n = n[..., None]
        return np.clip(img.astype(np.float32) + n, 0, 255).astype(np.uint8)
    return f


def bloom(threshold=0.72, intensity=0.55, radius=10):
    """Soft glow blooming out of the brightest areas."""
    thr = threshold * 255.0

    def f(img):
        a = img.astype(np.float32)
        lum = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        mask = np.clip((lum - thr) / max(1.0, 255 - thr), 0, 1)[..., None]
        bright = a * mask
        blurred = np.asarray(
            Image.fromarray(bright.astype(np.uint8)).filter(
                ImageFilter.GaussianBlur(radius)), np.float32)
        return np.clip(a + blurred * intensity, 0, 255).astype(np.uint8)
    return f


def halation(intensity=0.45, radius=14):
    """Warm red/orange glow bleeding from highlights (film halation)."""
    warm = np.array([1.0, 0.55, 0.25], np.float32)

    def f(img):
        a = img.astype(np.float32)
        lum = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        mask = np.clip((lum - 200) / 55.0, 0, 1)[..., None]
        glow = np.asarray(
            Image.fromarray((a * mask).astype(np.uint8)).filter(
                ImageFilter.GaussianBlur(radius)), np.float32)
        return np.clip(a + glow * warm * intensity, 0, 255).astype(np.uint8)
    return f


def chromatic_aberration(px=2.0):
    """Subtle RGB channel split toward the edges (lens character)."""
    shift = int(round(px))
    if shift <= 0:
        return lambda img: img

    def f(img):
        out = img.copy()
        out[:, shift:, 0] = img[:, :-shift, 0]      # R right
        out[:, :-shift, 2] = img[:, shift:, 2]      # B left
        return out
    return f


def sharpen(amount=0.4):
    def f(img):
        p = Image.fromarray(img)
        blur = p.filter(ImageFilter.GaussianBlur(1.4))
        a = img.astype(np.float32)
        b = np.asarray(blur, np.float32)
        return np.clip(a + (a - b) * amount, 0, 255).astype(np.uint8)
    return f


# ============================================================== time-varying
def light_leak_transform(color=(255, 170, 90), intensity=0.5, period=4.0,
                         seed=0):
    """Returns transform(get_frame, t): drifting coloured light wash (screen)."""
    rng = np.random.default_rng(seed)
    phase = rng.uniform(0, 2 * np.pi, 3)
    col = np.array(color, np.float32) / 255.0

    def f(get_frame, t):
        frame = get_frame(t).astype(np.float32) / 255.0
        h, w = frame.shape[:2]
        # moving radial hotspot
        cx = 0.5 + 0.45 * np.sin(2 * np.pi * t / period + phase[0])
        cy = 0.5 + 0.45 * np.cos(2 * np.pi * t / (period * 1.3) + phase[1])
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        d = ((xx / w - cx) ** 2 + (yy / h - cy) ** 2)
        glow = np.exp(-d * 9.0)[..., None]
        amt = intensity * (0.6 + 0.4 * np.sin(2 * np.pi * t / period + phase[2]))
        leak = glow * col * amt
        # screen blend
        out = 1 - (1 - frame) * (1 - leak)
        return np.clip(out * 255, 0, 255).astype(np.uint8)
    return f


def _gauss_sprite(r, sigma_frac=0.5):
    """A small radial-falloff sprite (float 0..1), side = 2r+1."""
    r = max(1, int(r))
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1].astype(np.float32)
    sig = max(0.6, r * sigma_frac)
    return np.exp(-(xx * xx + yy * yy) / (2 * sig * sig)).astype(np.float32)


def _paste_max(buf, sprite, cy, cx, gain):
    """Additively-max paste a sprite centred at (cy, cx) into buf (clipped)."""
    h, w = buf.shape
    r = sprite.shape[0] // 2
    y0, y1 = int(cy) - r, int(cy) + r + 1
    x0, x1 = int(cx) - r, int(cx) + r + 1
    sy0, sx0 = max(0, -y0), max(0, -x0)
    y0c, x0c = max(0, y0), max(0, x0)
    y1c, x1c = min(h, y1), min(w, x1)
    if y1c <= y0c or x1c <= x0c:
        return
    sub = sprite[sy0:sy0 + (y1c - y0c), sx0:sx0 + (x1c - x0c)] * gain
    region = buf[y0c:y1c, x0c:x1c]
    np.maximum(region, sub, out=region)


def _particle_clip(duration, w, h, n, color, seed, fps, rad_lo, rad_hi,
                   speed_lo, speed_hi, vy_lo, vy_hi, bright_lo, bright_hi,
                   twinkle, div):
    """Fast particle layer: sprite-paste on a downscaled buffer, upscaled per
    frame. Single compute is shared between the RGB clip and its mask."""
    from moviepy import VideoClip
    lw, lh = max(8, w // div), max(8, h // div)
    rng = np.random.default_rng(seed)
    px = rng.uniform(0, 1, n)
    py = rng.uniform(0, 1, n)
    vx = rng.uniform(speed_lo, speed_hi, n) * rng.choice([-1, 1], n)
    vy = rng.uniform(vy_lo, vy_hi, n)
    bright = rng.uniform(bright_lo, bright_hi, n)
    phase = rng.uniform(0, 1, n)
    sprites = [_gauss_sprite(rng.uniform(rad_lo, rad_hi)) for _ in range(n)]
    col = np.array(color, np.float32)
    cache = {}

    def compute(t):
        key = round(t, 4)
        cached = cache.get(key)
        if cached is not None:
            return cached
        buf = np.zeros((lh, lw), np.float32)
        for i in range(n):
            cy = (1.0 - ((py[i] + vy[i] * t) % 1.0)) * lh
            cx = ((px[i] + vx[i] * t) % 1.0) * lw
            g = bright[i]
            if twinkle:
                g *= 0.65 + 0.35 * np.sin(2 * np.pi * (t * 0.5 + phase[i]))
            _paste_max(buf, sprites[i], cy, cx, g)
        big = np.asarray(
            Image.fromarray((np.clip(buf, 0, 1) * 255).astype(np.uint8))
            .resize((w, h), Image.BILINEAR), np.float32) / 255.0
        rgb = np.clip(big[..., None] * col, 0, 255).astype(np.uint8)
        if len(cache) > 600:
            cache.clear()
        cache[key] = (rgb, big)
        return rgb, big

    clip = VideoClip(lambda t: compute(t)[0], duration=duration)
    mask = VideoClip(lambda t: compute(t)[1], duration=duration, is_mask=True)
    return clip.with_mask(mask).with_fps(fps)


def make_bokeh_clip(duration, w=C.W, h=C.H, n=18, color=C.GOLD_LIGHT,
                    seed=0, fps=C.FPS):
    """Floating defocused light particles (fast sprite-paste implementation)."""
    return _particle_clip(duration, w, h, n, color, seed, fps,
                          rad_lo=2.0, rad_hi=7.0, speed_lo=0.01, speed_hi=0.04,
                          vy_lo=0.01, vy_hi=0.05, bright_lo=0.3, bright_hi=0.75,
                          twinkle=True, div=5)


def make_dust_clip(duration, w=C.W, h=C.H, n=90, color=(255, 255, 255),
                   seed=1, fps=C.FPS):
    """Fine drifting dust motes — subtle atmosphere."""
    return _particle_clip(duration, w, h, n, color, seed, fps,
                          rad_lo=0.8, rad_hi=1.8, speed_lo=0.005, speed_hi=0.02,
                          vy_lo=0.005, vy_hi=0.03, bright_lo=0.1, bright_hi=0.35,
                          twinkle=False, div=3)


# ============================================================== ken burns
def ken_burns(clip, zoom_from=1.0, zoom_to=1.12, pan=(0.0, 0.0)):
    """
    Slow push/pan to give still-ish footage life. Scales the clip and animates
    a sub-window. `pan` is fractional drift of the centre over the whole clip.
    Returns a clip the same size as the input.
    """
    from moviepy import vfx
    dur = clip.duration
    w, h = clip.size

    def scale(t):
        k = t / dur if dur else 0
        return zoom_from + (zoom_to - zoom_from) * U.ease_in_out_cubic(k)

    zoomed = clip.with_effects([vfx.Resize(scale)])

    def pos(t):
        k = t / dur if dur else 0
        s = scale(t)
        sw, sh = w * s, h * s
        # base centre + animated pan
        ox = (w - sw) / 2 - pan[0] * w * U.ease_in_out_cubic(k)
        oy = (h - sh) / 2 - pan[1] * h * U.ease_in_out_cubic(k)
        return (ox, oy)

    return zoomed.with_position(pos)


# ============================================================== transitions
def flash_clip(duration=0.18, color=(255, 255, 255), w=C.W, h=C.H, fps=C.FPS):
    """A quick luminous flash for hard cuts / beat hits."""
    from moviepy import VideoClip
    col = np.array(color, np.float32)

    def make_mask(t):
        a = U.clamp(1 - abs(2 * t / duration - 1)) ** 1.5
        return np.full((h, w), a, np.float32)

    base = VideoClip(lambda t: np.broadcast_to(col, (h, w, 3)).astype(np.uint8),
                     duration=duration)
    mask = VideoClip(make_mask, duration=duration, is_mask=True)
    return base.with_mask(mask).with_fps(fps)
