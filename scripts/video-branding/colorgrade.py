# -*- coding: utf-8 -*-
"""
Cinematic colour grading — parametric, vectorised numpy per-frame operations.

A "look" is a dict of grading parameters. `apply(frame, look)` runs the full
chain (exposure, contrast, white balance, lift/gamma/gain, split-toning,
vibrance, saturation) on an HxWx3 uint8 array and returns uint8.

GRADES holds a library of named looks; themes reference them by name.
"""
from __future__ import annotations

import numpy as np

# --------------------------------------------------------------- primitives
def _to_f(arr):
    return arr.astype(np.float32) / 255.0


def _to_u8(f):
    return np.clip(f * 255.0, 0, 255).astype(np.uint8)


def _luma(f):
    return f[..., 0] * 0.2126 + f[..., 1] * 0.7152 + f[..., 2] * 0.0722


def _scurve(f, strength):
    # smooth contrast pivoting at 0.5; strength in ~[-0.5, 1.0]
    if abs(strength) < 1e-4:
        return f
    x = np.clip(f, 0, 1)
    s = 1.0 + strength * 3.0
    # logistic-ish contrast around mid-grey
    return np.clip((x - 0.5) * s + 0.5 - (s - 1) * 0.0, 0, 1)


def _saturate(f, amount):
    if abs(amount - 1.0) < 1e-4:
        return f
    l = _luma(f)[..., None]
    return l + (f - l) * amount


def _vibrance(f, amount):
    """Saturate low-sat pixels more than already-saturated ones."""
    if abs(amount) < 1e-4:
        return f
    l = _luma(f)[..., None]
    sat = np.abs(f - l).max(axis=-1, keepdims=True)
    factor = 1.0 + amount * (1.0 - sat)
    return l + (f - l) * factor


# --------------------------------------------------------------- main chain
def apply(frame_u8, look):
    if look is None:
        return frame_u8
    f = _to_f(frame_u8)

    # 1. exposure
    f = f * look.get("exposure", 1.0)

    # 2. white balance — temperature (warm +), tint (magenta +)
    temp = look.get("temperature", 0.0)
    tint = look.get("tint", 0.0)
    f[..., 0] += temp * 0.12
    f[..., 2] -= temp * 0.12
    f[..., 1] -= tint * 0.10
    f[..., 0] += tint * 0.05
    f[..., 2] += tint * 0.05

    f = np.clip(f, 0, 1)

    # 3. lift / gamma / gain (shadows / mids / highlights)
    lift = look.get("lift", 0.0)
    gain = look.get("gain", 1.0)
    gamma = look.get("gamma", 1.0)
    if lift or gain != 1.0:
        f = f * gain + lift * (1.0 - f)
    if abs(gamma - 1.0) > 1e-4:
        f = np.clip(f, 0, 1) ** (1.0 / gamma)

    # 4. contrast
    f = _scurve(f, look.get("contrast", 0.0))

    # 5. split toning — tint shadows and highlights toward two colours
    st = look.get("shadow_tint")
    ht = look.get("highlight_tint")
    if st or ht:
        l = _luma(np.clip(f, 0, 1))
        if st:
            col, amt = st
            w = (1.0 - l)[..., None] * amt
            f = f * (1 - w) + (np.array(col, np.float32) / 255.0) * w
        if ht:
            col, amt = ht
            w = (l)[..., None] * amt
            f = f * (1 - w) + (np.array(col, np.float32) / 255.0) * w

    # 6. vibrance then saturation
    f = _vibrance(f, look.get("vibrance", 0.0))
    f = _saturate(f, look.get("saturation", 1.0))

    # 7. optional fade (lifted blacks for vintage)
    fade = look.get("fade", 0.0)
    if fade:
        f = f * (1 - fade) + fade * 0.5 * (1 - _luma(f)[..., None])

    return _to_u8(f)


# --------------------------------------------------------------- library
GRADES = {
    # blockbuster teal & orange
    "teal_orange": dict(contrast=0.22, saturation=1.12, vibrance=0.18,
                        temperature=0.10, shadow_tint=((0, 70, 90), 0.30),
                        highlight_tint=((255, 175, 90), 0.22), gamma=1.05),
    # warm low sun
    "golden_hour": dict(exposure=1.05, contrast=0.16, saturation=1.10,
                        temperature=0.30, gamma=1.08,
                        highlight_tint=((255, 196, 120), 0.30),
                        shadow_tint=((60, 40, 30), 0.18)),
    # cool clean sea
    "azure_sea": dict(contrast=0.20, saturation=1.14, vibrance=0.20,
                     temperature=-0.18, tint=-0.04,
                     highlight_tint=((180, 230, 255), 0.18),
                     shadow_tint=((0, 40, 70), 0.26)),
    # punchy saturated tropical
    "vibrant_tropical": dict(contrast=0.18, saturation=1.30, vibrance=0.30,
                            exposure=1.04, gamma=1.04,
                            highlight_tint=((255, 210, 140), 0.10)),
    # desaturated high-contrast mono-ish
    "noir": dict(contrast=0.40, saturation=0.45, gamma=0.95,
                shadow_tint=((10, 18, 26), 0.30)),
    # pink/orange dusk
    "sunset_glow": dict(contrast=0.14, saturation=1.16, temperature=0.20,
                       tint=0.06, highlight_tint=((255, 150, 120), 0.30),
                       shadow_tint=((40, 30, 70), 0.24), gamma=1.06),
    # green-gold emerald
    "emerald": dict(contrast=0.20, saturation=1.12, temperature=-0.05,
                   highlight_tint=((200, 230, 150), 0.16),
                   shadow_tint=((0, 50, 45), 0.30)),
    # faded warm vintage film
    "vintage_film": dict(contrast=0.10, saturation=0.85, temperature=0.16,
                        fade=0.12, gamma=1.10,
                        highlight_tint=((255, 220, 170), 0.20),
                        shadow_tint=((40, 36, 50), 0.20)),
    # neutral crisp punch
    "crisp": dict(contrast=0.22, saturation=1.08, vibrance=0.16, gamma=1.02),
    # magenta/indigo dusk
    "dusk_purple": dict(contrast=0.18, saturation=1.10, temperature=-0.08,
                       tint=0.10, shadow_tint=((40, 20, 70), 0.30),
                       highlight_tint=((255, 180, 200), 0.20)),
    # bleach-bypass — gritty, silvery
    "bleach": dict(contrast=0.34, saturation=0.60, gamma=0.98,
                  highlight_tint=((230, 235, 240), 0.16)),
    # dreamy soft pastel
    "pastel_dream": dict(exposure=1.06, contrast=0.06, saturation=0.95,
                        fade=0.10, temperature=0.06,
                        highlight_tint=((255, 235, 220), 0.24)),
}


def get(name):
    return GRADES.get(name, GRADES["crisp"])


# --------------------------------------------------------------- 3D LUT
# A colour grade is a pointwise RGB->RGB map, so we bake it once into a small
# 3D lattice and apply it per frame by index gather — ~15x faster than running
# the full chain on every frame. Nearest lookup; film grain dithers any banding.
def make_lut(look, N=65):
    vals = np.linspace(0, 255, N).astype(np.uint8)
    R, G, B = np.meshgrid(vals, vals, vals, indexing="ij")
    lattice = np.stack([R, G, B], -1).reshape(-1, 1, 3)
    graded = apply(lattice, look)
    return graded.reshape(N, N, N, 3), N


def grader(look):
    """Return a fast per-frame grading function backed by a baked LUT."""
    if look is None:
        return lambda img: img
    lut, N = make_lut(look)
    scale = (N - 1) / 255.0

    def f(img):
        idx = np.rint(img.astype(np.float32) * scale).astype(np.intp)
        return lut[idx[..., 0], idx[..., 1], idx[..., 2]]
    return f
