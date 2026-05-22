# -*- coding: utf-8 -*-
"""
Audio mixer / mastering bus.

Lays the music bed, ambience and timed sound-design events onto one stereo
timeline, applies gentle sidechain ducking under impacts, then masters
(soft-clip + peak limit + fade) and hands back a moviepy AudioArrayClip.
"""
from __future__ import annotations

import numpy as np

from music_engine import SR


class Mixer:
    def __init__(self, duration):
        self.dur = duration
        self.n = int(duration * SR)
        self.buf = np.zeros((self.n, 2), np.float32)

    # ----------------------------------------------------------- add layers
    def add(self, stereo, at=0.0, gain=1.0):
        if stereo is None:
            return self
        if stereo.ndim == 1:
            stereo = np.stack([stereo, stereo], axis=1)
        i = int(at * SR)
        if i >= self.n:
            return self
        j = min(self.n, i + len(stereo))
        self.buf[i:j] += stereo[:j - i] * gain
        return self

    def add_bed(self, stereo, gain=1.0, fade=0.5):
        """A full-length bed (music/ambience) — trimmed/looped to fit, faded."""
        if stereo is None:
            return self
        if stereo.ndim == 1:
            stereo = np.stack([stereo, stereo], axis=1)
        if len(stereo) < self.n:
            reps = int(np.ceil(self.n / len(stereo)))
            stereo = np.tile(stereo, (reps, 1))
        bed = stereo[:self.n].copy()
        f = int(fade * SR)
        if f:
            bed[:f] *= np.linspace(0, 1, f)[:, None]
            bed[-f:] *= np.linspace(1, 0, f)[:, None]
        self.buf += bed * gain
        return self

    def duck(self, at, depth=0.6, attack=0.02, release=0.5):
        """Sidechain dip centred at `at` (for impacts/drops)."""
        i = int(at * SR)
        a = int(attack * SR); r = int(release * SR)
        env = np.ones(self.n)
        s = max(0, i - a)
        if a:
            env[s:i] = np.linspace(1, 1 - depth, i - s)
        e = min(self.n, i + r)
        env[i:e] = np.linspace(1 - depth, 1, e - i)
        env[i] = 1 - depth
        self.buf *= env[:, None]
        return self

    # ----------------------------------------------------------- master
    def master(self, headroom=0.92, fade_out=0.4):
        x = np.tanh(self.buf * 1.05)
        peak = np.max(np.abs(x)) or 1.0
        x = x / peak * headroom
        fo = int(fade_out * SR)
        if fo:
            x[-fo:] *= np.linspace(1, 0, fo)[:, None]
        return x

    def to_audioclip(self, fps=SR):
        from moviepy import AudioArrayClip
        arr = self.master()
        return AudioArrayClip(arr.astype(np.float32), fps=fps)
