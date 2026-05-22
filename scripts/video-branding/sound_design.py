# -*- coding: utf-8 -*-
"""
Sound design — the editorial "ear candy" that sells professional montage:
whooshes, impacts/booms, risers, sub-drops, sparkle/shimmer and ambience beds
(ocean, wind). All synthesised, royalty-free. Returns float stereo arrays at
music_engine.SR so they mix straight into the master.
"""
from __future__ import annotations

import numpy as np

from music_engine import SR, highpass, lowpass, bandpass, reverb

RNG = np.random.default_rng()


def _stereo(mono, pan=0.5):
    return np.stack([mono * np.sqrt(1 - pan), mono * np.sqrt(pan)], axis=1)


# ----------------------------------------------------------------- transitions
def whoosh(dur=0.6, direction="up", seed=None):
    rng = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    env = np.exp(-((t / dur - 0.5) ** 2) / 0.05)
    sweep = np.clip(t / dur, 0, 1)
    if direction == "down":
        sweep = 1 - sweep
    out = np.zeros(n)
    # sweeping band-passed noise
    for f0, f1 in [(400, 6000)]:
        cf = f0 + (f1 - f0) * sweep
        # approximate moving filter with a few static bands blended
        for lo, hi, w in [(300, 1200, 0.4), (1200, 4000, 0.4), (4000, 9000, 0.3)]:
            band = bandpass(noise, lo, hi)
            bw = np.clip(1 - np.abs(cf - (lo + hi) / 2) / 3000, 0, 1)
            out += band * bw * w
    out *= env
    # subtle doppler pitch feel via amplitude tilt
    return _stereo(out * 0.7, pan=0.5)


def impact(dur=1.4, tone=48, seed=None):
    """Cinematic boom: sub thump + noisy hit + long tail."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    f = tone * (1 + 1.5 * np.exp(-t * 18))
    ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(ph) * np.exp(-t * 3.0)
    hit = lowpass(rng.standard_normal(n), 2500) * np.exp(-t * 9) * 0.6
    tail = reverb(sub * 0.5, 0.5)
    out = sub + hit + tail
    return _stereo(out * 0.8)


def riser(dur=2.0, seed=None):
    """Building noise + pitch riser to lead into a hit/drop."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    p = (t / dur)
    noise = highpass(rng.standard_normal(n), 800) * (p ** 2)
    f = 200 * 2 ** (p * 3)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) * (p ** 2) * 0.4
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * (4 + 30 * p) * t)
    out = (noise * 0.5 + tone) * trem
    return _stereo(out * 0.7)


def sub_drop(dur=1.6, start_f=120, seed=None):
    n = int(dur * SR); t = np.arange(n) / SR
    f = start_f * 2 ** (-t / dur * 3)
    ph = 2 * np.pi * np.cumsum(f) / SR
    out = np.sin(ph) * np.exp(-t * 1.6)
    return _stereo(out * 0.9)


def sparkle(dur=1.2, n_grains=40, seed=None):
    """Glittery high bells — good on title reveals."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR); out = np.zeros(n)
    for _ in range(n_grains):
        f = rng.uniform(2000, 7000)
        st = rng.uniform(0, dur * 0.7)
        gl = int(rng.uniform(0.05, 0.2) * SR)
        i = int(st * SR)
        if i + gl >= n:
            continue
        tt = np.arange(gl) / SR
        grain = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 30) * rng.uniform(0.1, 0.4)
        out[i:i + gl] += grain
    out = reverb(out, 0.4)
    return _stereo(out * 0.6)


# ----------------------------------------------------------------- ambience
def ocean(dur, seed=None, level=0.16):
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    noise = lowpass(rng.standard_normal(n), 1200)
    # slow swelling waves
    t = np.arange(n) / SR
    swell = 0.0
    for f, ph in [(0.12, 0), (0.07, 1.3), (0.19, 2.6)]:
        swell = swell + (0.5 + 0.5 * np.sin(2 * np.pi * f * t + ph))
    swell /= 3
    out = noise * swell
    return _stereo(out * level, pan=0.5) + _stereo(
        lowpass(rng.standard_normal(n), 800) * swell * level * 0.6, pan=0.5)[:, ::-1]


def wind(dur, seed=None, level=0.12):
    rng = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    noise = bandpass(rng.standard_normal(n), 300, 2000)
    mod = 0.5 + 0.5 * np.sin(2 * np.pi * 0.15 * t)
    return _stereo(noise * mod * level)


def shimmer_pad(dur, seed=None, level=0.1):
    """Airy high drone bed for cinematic/ambient themes."""
    rng = np.random.default_rng(seed)
    n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for f in (660, 880, 990, 1320):
        out += np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * 0.25
    out = bandpass(out, 500, 4000) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.1 * t))
    out = reverb(out, 0.5)
    return _stereo(out * level)


AMBIENCE = {"ocean": ocean, "wind": wind, "shimmer": shimmer_pad, "none": None}
