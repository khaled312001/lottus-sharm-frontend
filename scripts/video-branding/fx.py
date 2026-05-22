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
    """Per-frame film grain (varies every frame via RNG)."""
    amp = intensity * 255.0

    def f(img):
        h, w = img.shape[:2]
        if mono:
            n = np.random.randn(h, w, 1).astype(np.float32) * amp
        else:
            n = np.random.randn(h, w, 3).astype(np.float32) * amp
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


def make_bokeh_clip(duration, w=C.W, h=C.H, n=26, color=C.GOLD_LIGHT,
                    seed=0, fps=C.FPS):
    """Floating defocused light particles as a transparent VideoClip (mask)."""
    from moviepy import VideoClip
    rng = np.random.default_rng(seed)
    px = rng.uniform(0, 1, n)
    speed = rng.uniform(0.01, 0.05, n)
    drift = rng.uniform(-0.02, 0.02, n)
    rad = rng.uniform(6, 26, n)
    base_phase = rng.uniform(0, 1, n)
    bright = rng.uniform(0.25, 0.7, n)
    col = np.array(color, np.float32)

    def make_frame(t):
        img = np.zeros((h, w, 3), np.float32)
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        for i in range(n):
            cy = (1.0 - ((base_phase[i] + speed[i] * t) % 1.0)) * h
            cx = (px[i] + drift[i] * t) % 1.0 * w
            r = rad[i]
            d = (xx - cx) ** 2 + (yy - cy) ** 2
            tw = 0.7 + 0.3 * np.sin(2 * np.pi * (t * 0.5 + base_phase[i]))
            img += np.exp(-d / (2 * r * r))[..., None] * col * bright[i] * tw
        return np.clip(img, 0, 255).astype(np.uint8)

    def make_mask(t):
        f = make_frame(t).astype(np.float32)
        return (f.max(axis=-1) / 255.0)

    clip = VideoClip(frame_function=make_frame, duration=duration)
    mask = VideoClip(frame_function=make_mask, duration=duration, is_mask=True)
    return clip.with_mask(mask).with_fps(fps)


def make_dust_clip(duration, w=C.W, h=C.H, n=120, seed=1, fps=C.FPS):
    """Fine drifting dust motes — subtle atmosphere."""
    from moviepy import VideoClip
    rng = np.random.default_rng(seed)
    px, py = rng.uniform(0, 1, n), rng.uniform(0, 1, n)
    vx, vy = rng.uniform(-0.01, 0.01, n), rng.uniform(0.005, 0.03, n)
    rad = rng.uniform(1.0, 2.6, n)
    bright = rng.uniform(0.1, 0.4, n)

    def make_frame(t):
        img = np.zeros((h, w), np.float32)
        ys = ((py + vy * t) % 1.0 * h).astype(int)
        xs = ((px + vx * t) % 1.0 * w).astype(int)
        for i in range(n):
            r = int(rad[i]) + 1
            y0, y1 = max(0, ys[i] - r), min(h, ys[i] + r)
            x0, x1 = max(0, xs[i] - r), min(w, xs[i] + r)
            img[y0:y1, x0:x1] = np.maximum(img[y0:y1, x0:x1], bright[i])
        rgb = np.stack([img] * 3, -1) * 255
        return rgb.astype(np.uint8)

    clip = VideoClip(frame_function=make_frame, duration=duration)
    mask = VideoClip(frame_function=lambda t: make_frame(t)[..., 0] / 255.0,
                     duration=duration, is_mask=True)
    return clip.with_mask(mask).with_fps(fps)


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
