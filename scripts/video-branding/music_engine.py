# -*- coding: utf-8 -*-
"""
Procedural, fully royalty-free music engine (public-domain by authorship).

Synthesises original tracks in several genres — tropical house, deep house,
lo-fi, cinematic, ambient, oriental (Hijaz), synthwave, bossa, folk, epic drums.
Each genre is parametrised by key, tempo and a random seed, so a few genres
yield dozens of distinct tracks. 16-bit stereo WAV, no external samples.
"""
from __future__ import annotations

import wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100


# ================================================================ primitives
def m2f(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def env_adsr(n, a, d, s, r):
    A, D, R = min(int(a * SR), n), 0, 0
    D = min(int(d * SR), n - A)
    R = min(int(r * SR), n - A - D)
    S = max(0, n - A - D - R)
    e = np.zeros(n)
    i = 0
    if A: e[i:i + A] = np.linspace(0, 1, A); i += A
    if D: e[i:i + D] = np.linspace(1, s, D); i += D
    if S: e[i:i + S] = s; i += S
    if R: e[i:i + R] = np.linspace(s, 0, R)
    return e


def osc(freq, n, partials, detune=0.0, kind="sin"):
    t = np.arange(n) / SR
    y = np.zeros(n)
    for k, amp in partials:
        ph = 2 * np.pi * freq * k * (1 + detune) * t
        if kind == "saw":
            y += amp * (2 * (ph / (2 * np.pi) % 1.0) - 1)
        elif kind == "square":
            y += amp * np.sign(np.sin(ph))
        elif kind == "tri":
            y += amp * (2 / np.pi) * np.arcsin(np.sin(ph))
        else:
            y += amp * np.sin(ph)
    return y


def lowpass(x, cut, order=4):
    sos = butter(order, min(cut, SR / 2 - 100) / (SR / 2), btype="low", output="sos")
    return sosfilt(sos, x)


def highpass(x, cut, order=4):
    sos = butter(order, max(20, cut) / (SR / 2), btype="high", output="sos")
    return sosfilt(sos, x)


def bandpass(x, lo, hi, order=4):
    sos = butter(order, [max(20, lo) / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)],
                 btype="band", output="sos")
    return sosfilt(sos, x)


# ================================================================ instruments
def i_pluck(midi, dur, kind="sin"):
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (2, 0.5), (3, 0.22), (4, 0.1)], kind=kind)
    return y * env_adsr(n, 0.004, 0.30, 0.0, 0.06)


def i_marimba(midi, dur):
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (4, 0.5), (9.2, 0.2)])
    return y * env_adsr(n, 0.002, 0.18, 0.0, 0.05)


def i_kalimba(midi, dur):
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (2.01, 0.4), (3.0, 0.18), (5.1, 0.08)])
    return y * env_adsr(n, 0.002, dur * 0.8, 0.0, 0.05)


def i_bell(midi, dur):
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (2.0, 0.5), (3.01, 0.32), (4.2, 0.2), (5.4, 0.12)])
    return y * env_adsr(n, 0.005, dur * 0.9, 0.0, 0.05)


def i_ep(midi, dur):
    """Electric-piano-ish (Rhodes)."""
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (2, 0.35), (3, 0.12), (14, 0.05)])
    return y * env_adsr(n, 0.004, dur * 0.7, 0.2, 0.12)


def i_pad(midi, dur, kind="sin"):
    n = int(dur * SR)
    parts = [(1, 1.0), (2, 0.5), (3, 0.33), (4, 0.22), (5, 0.14), (6, 0.09)]
    y = osc(m2f(midi), n, parts, detune=+0.006, kind=kind) + \
        osc(m2f(midi), n, parts, detune=-0.006, kind=kind)
    return y * env_adsr(n, 0.45, 0.2, 0.85, 0.6) * 0.5


def i_saw(midi, dur):
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0)], detune=0.004, kind="saw") + \
        osc(m2f(midi), n, [(1, 1.0)], detune=-0.004, kind="saw")
    y = lowpass(y, m2f(midi) * 6 + 600)
    return y * env_adsr(n, 0.01, dur * 0.5, 0.6, 0.1) * 0.5


def i_sub(midi, dur):
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (2, 0.2)])
    return y * env_adsr(n, 0.01, 0.25, 0.7, 0.12)


def i_choir(midi, dur):
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (2, 0.3), (3, 0.15)], detune=0.01)
    y = bandpass(y, 200, 3000)
    return y * env_adsr(n, 0.6, 0.3, 0.8, 0.8) * 0.5


def i_guitar(midi, dur):
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (2, 0.6), (3, 0.3), (4, 0.18), (5, 0.1)], kind="tri")
    return y * env_adsr(n, 0.003, dur * 0.6, 0.1, 0.12)


def i_uke(midi, dur):
    """Bright nylon ukulele pluck (happy travel staple)."""
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (2, 0.55), (3, 0.3), (4, 0.16), (5, 0.08)],
            kind="tri")
    return y * env_adsr(n, 0.002, dur * 0.55, 0.0, 0.05)


def i_whistle(midi, dur):
    """Warm whistled lead with vibrato + a touch of breath — the 'vlog' melody."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1.0 + 0.006 * np.sin(2 * np.pi * 5.5 * t)
    ph = 2 * np.pi * m2f(midi) * np.cumsum(vib) / SR
    y = np.sin(ph) + 0.12 * np.sin(2 * ph)
    breath = highpass(np.random.randn(n), 4500) * 0.025 * np.exp(-t * 4)
    return (y + breath) * env_adsr(n, 0.04, dur * 0.5, 0.7, 0.12) * 0.8


def i_glock(midi, dur):
    """Glockenspiel sparkle accent."""
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (3.0, 0.5), (5.1, 0.25), (7.2, 0.1)])
    return y * env_adsr(n, 0.002, dur * 0.85, 0.0, 0.05)


# ----- drums --------------------------------------------------------------
def d_kick(dur=0.24, punch=80):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 48 + punch * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9.0)


def d_snare(dur=0.2):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = highpass(np.random.randn(n), 1200) * np.exp(-t * 18)
    tone = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 22) * 0.5
    return noise * 0.8 + tone


def d_clap(dur=0.18):
    n = int(dur * SR); t = np.arange(n) / SR
    e = np.zeros(n)
    for off in (0, 0.01, 0.02):
        i = int(off * SR)
        if i < n:
            e[i:] += np.exp(-(t[:n - i]) * 40)
    return bandpass(np.random.randn(n), 1000, 4000) * e * 0.5


def d_hat(dur=0.06, open_=False):
    n = int(dur * SR); t = np.arange(n) / SR
    return highpass(np.random.randn(n), 7000) * np.exp(-t * (12 if open_ else 60)) * 0.5


def d_shaker(dur=0.08):
    n = int(dur * SR)
    return highpass(np.random.randn(n), 5000) * env_adsr(n, 0.004, 0.05, 0.0, 0.01) * 0.5


def d_tom(midi=50, dur=0.3):
    n = int(dur * SR); t = np.arange(n) / SR
    f = m2f(midi) * (1 + 0.5 * np.exp(-t * 20))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7)


def d_doumbek(midi=55, dur=0.25):
    """Middle-Eastern hand drum (dum/tek)."""
    n = int(dur * SR); t = np.arange(n) / SR
    f = m2f(midi) * (1 + 0.8 * np.exp(-t * 30))
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 12)
    snap = highpass(np.random.randn(n), 3000) * np.exp(-t * 40) * 0.3
    return body + snap


# ================================================================ mixing
def place(buf, start, sig, gain=1.0, pan=0.5):
    i = int(start * SR)
    if i >= buf.shape[0]:
        return
    j = min(buf.shape[0], i + len(sig))
    seg = sig[:j - i] * gain
    if buf.ndim == 2:
        buf[i:j, 0] += seg * np.sqrt(1 - pan)
        buf[i:j, 1] += seg * np.sqrt(pan)
    else:
        buf[i:j] += seg


def delay_fx(x, time=0.33, fb=0.35, mix=0.3, n_echo=4):
    out = x.copy()
    d = int(time * SR)
    for k in range(1, n_echo + 1):
        if d * k < len(x):
            tmp = np.zeros_like(x)
            tmp[d * k:] = x[:-d * k] * (fb ** k)
            out += tmp * mix
    return out


def reverb(x, amount=0.25, taps=((0.031, 0.6), (0.047, 0.45), (0.071, 0.32),
                                  (0.11, 0.22), (0.17, 0.14))):
    out = x.copy()
    for delay, g in taps:
        d = int(delay * SR)
        if d < len(x):
            t = np.zeros_like(x)
            t[d:] = x[:-d] * g
            out += t * amount
    return out


def soft_clip(x, drive=1.0):
    return np.tanh(x * drive)


def finalize(stereo, dur, fade_in=0.04, fade_out=1.0):
    n = int(dur * SR)
    if stereo.shape[0] >= n:
        stereo = stereo[:n]
    else:
        pad = np.zeros((n - stereo.shape[0], stereo.shape[1]))
        stereo = np.vstack([stereo, pad])
    fi = int(fade_in * SR)
    if fi: stereo[:fi] *= np.linspace(0, 1, fi)[:, None]
    fo = int(fade_out * SR)
    if fo: stereo[-fo:] *= (np.linspace(1, 0, fo) ** 1.4)[:, None]
    return stereo


def save_wav(path, stereo):
    peak = np.max(np.abs(stereo)) or 1.0
    x = (stereo / peak * 0.93 * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(x.tobytes())


# ================================================================ theory
SCALES = {
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "dorian": [0, 2, 3, 5, 7, 9, 10],
    "lydian": [0, 2, 4, 6, 7, 9, 11],
    "penta_major": [0, 2, 4, 7, 9],
    "penta_minor": [0, 3, 5, 7, 10],
    "hijaz": [0, 1, 4, 5, 7, 8, 11],          # oriental / Phrygian dominant-ish
    "nahawand": [0, 2, 3, 5, 7, 8, 10],       # ~ minor
}

# progressions as scale degrees (0-indexed within a 7-note scale)
PROGS = {
    "pop": [[0, 2, 4], [4, 6, 1], [5, 0, 2], [3, 5, 0]],     # I V vi IV-ish
    "emotional": [[5, 0, 2], [3, 5, 0], [0, 2, 4], [4, 6, 1]],
    "deep": [[0, 2, 4], [1, 3, 5], [5, 0, 2], [4, 6, 1]],
    "lofi": [[0, 2, 4, 6], [5, 0, 2, 4], [3, 5, 0, 2], [4, 6, 1, 3]],
    "cinematic": [[5, 0, 2], [3, 5, 0], [0, 2, 4], [4, 6, 1]],
    "modal": [[0, 2, 4], [3, 5, 0], [0, 2, 4], [4, 6, 1]],
}


def chord(root, scale, degrees, octave=0):
    sc = SCALES[scale]
    notes = []
    for dg in degrees:
        oct_add = (dg // len(sc)) * 12
        notes.append(root + sc[dg % len(sc)] + oct_add + 12 * octave)
    return notes


def stepwise_melody(rng, key, scale_name, n_notes, start=None):
    """A singable, mostly-stepwise melody over a scale (gentle leaps)."""
    sc = SCALES[scale_name]
    span = len(sc) * 2
    idx = start if start is not None else rng.integers(2, len(sc))
    out = []
    for _ in range(n_notes):
        step = int(rng.choice([-2, -1, -1, 0, 1, 1, 2]))
        idx = max(0, min(span - 1, idx + step))
        out.append(key + sc[idx % len(sc)] + (idx // len(sc)) * 12)
    return out


# ================================================================ genres
def _grid(dur, bpm, beats_per_bar=4):
    beat = 60.0 / bpm
    bar = beat * beats_per_bar
    nbars = max(4, int(np.ceil((dur + 0.5) / bar)))
    return beat, bar, nbars


def tropical_house(dur, key, rng, prog="pop", scale="major"):
    bpm = rng.integers(116, 124)
    beat, bar, nbars = _grid(dur, bpm)
    n = int((nbars * bar + 1.0) * SR)
    L = np.zeros((n, 2)); progr = PROGS[prog]
    for b in range(nbars):
        deg = progr[b % len(progr)]
        ch = chord(key, scale, deg, octave=1)
        root = key + SCALES[scale][deg[0] % 7] - 12
        t0 = b * bar
        for v in ch[:2]:
            place(L, t0, i_pad(v, bar, kind="saw"), 0.10, pan=0.4)
        arp = [ch[0], ch[1], ch[2], ch[1]] * 2
        for i, note in enumerate(arp):
            place(L, t0 + i * beat / 2, i_marimba(note + 12, beat * 0.5), 0.34,
                  pan=0.35 + 0.3 * (i % 2))
        for k in range(4):
            place(L, t0 + k * beat, i_sub(root, beat * 0.9), 0.5)
            place(L, t0 + k * beat, d_kick(), 0.95)
            place(L, t0 + k * beat + beat / 2, d_hat(open_=(k == 3)), 0.4)
            place(L, t0 + k * beat + beat / 2, d_shaker(), 0.3, pan=0.6)
        place(L, t0 + 2 * beat, d_clap(), 0.6)
    L[:, 0] = reverb(L[:, 0], 0.16); L[:, 1] = reverb(L[:, 1], 0.16)
    return L


def deep_house(dur, key, rng, prog="deep", scale="minor"):
    bpm = rng.integers(120, 124)
    beat, bar, nbars = _grid(dur, bpm)
    n = int((nbars * bar + 1.0) * SR); L = np.zeros((n, 2)); progr = PROGS[prog]
    for b in range(nbars):
        deg = progr[b % len(progr)]; ch = chord(key, scale, deg, octave=1)
        root = key + SCALES[scale][deg[0] % 7] - 12; t0 = b * bar
        for v in ch:
            place(L, t0 + 0.5 * (b % 2), i_ep(v, bar * 0.6), 0.16, pan=0.5)
        for k in range(4):
            place(L, t0 + k * beat, d_kick(punch=70), 0.9)
            place(L, t0 + k * beat, i_sub(root, beat * 0.85), 0.55)
            place(L, t0 + k * beat + beat / 2, d_hat(open_=True), 0.3, pan=0.6)
        for k in range(8):
            place(L, t0 + k * beat / 2, d_shaker(), 0.18, pan=0.4)
    L[:, 0] = reverb(L[:, 0], 0.2); L[:, 1] = reverb(L[:, 1], 0.2)
    return L


def lofi(dur, key, rng, prog="lofi", scale="dorian"):
    bpm = rng.integers(72, 86)
    beat, bar, nbars = _grid(dur, bpm)
    n = int((nbars * bar + 1.0) * SR); L = np.zeros((n, 2)); progr = PROGS[prog]
    swing = 0.06
    for b in range(nbars):
        deg = progr[b % len(progr)]; ch = chord(key, scale, deg, octave=1)
        root = key + SCALES[scale][deg[0] % 7] - 12; t0 = b * bar
        for v in ch:
            place(L, t0, i_ep(v, bar * 0.9), 0.18, pan=0.5)
        place(L, t0, i_sub(root, beat * 1.5), 0.4)
        place(L, t0 + 2 * beat, i_sub(root + 7, beat), 0.3)
        for k in range(4):
            place(L, t0 + k * beat, d_kick(punch=60), 0.7)
            sw = swing if k % 2 else 0
            place(L, t0 + k * beat + beat / 2 + sw, d_snare() if k % 2 else d_hat(), 0.4, pan=0.55)
    # vinyl hiss
    L += (highpass(np.random.randn(n), 3000)[:, None] * 0.012)
    L[:, 0] = reverb(L[:, 0], 0.18); L[:, 1] = reverb(L[:, 1], 0.18)
    return L


def cinematic(dur, key, rng, prog="cinematic", scale="minor"):
    bar = rng.uniform(2.0, 2.6); nbars = max(4, int(np.ceil((dur + 1.0) / bar)))
    n = int((nbars * bar + 1.5) * SR); L = np.zeros((n, 2)); progr = PROGS[prog]
    for b in range(nbars):
        deg = progr[b % len(progr)]; ch = chord(key, scale, deg)
        root = key + SCALES[scale][deg[0] % 7] - 12; t0 = b * bar
        for v in ch:
            place(L, t0, i_pad(v, bar * 1.05), 0.2, pan=0.5)
            place(L, t0, i_choir(v + 12, bar), 0.1, pan=0.4 + 0.2 * (v % 2))
        place(L, t0, i_sub(root, bar), 0.4)
        for i, note in enumerate([ch[2] + 12, ch[1] + 12, ch[0] + 19]):
            place(L, t0 + 0.4 + i * 0.5, i_bell(note, 1.6), 0.26, pan=0.3 + 0.2 * i)
        if b % 2 == 0:
            place(L, t0, d_tom(40, 0.5), 0.5)
    L[:, 0] = reverb(L[:, 0], 0.32); L[:, 1] = reverb(L[:, 1], 0.32)
    return L


def ambient(dur, key, rng, prog="modal", scale="lydian"):
    bar = rng.uniform(3.0, 4.0); nbars = max(3, int(np.ceil((dur + 1.5) / bar)))
    n = int((nbars * bar + 2.0) * SR); L = np.zeros((n, 2)); progr = PROGS[prog]
    for b in range(nbars):
        deg = progr[b % len(progr)]; ch = chord(key, scale, deg)
        t0 = b * bar
        for v in ch:
            place(L, t0, i_pad(v, bar * 1.4, kind="sin"), 0.22, pan=0.5)
        for i, note in enumerate([ch[2] + 19, ch[0] + 24]):
            place(L, t0 + rng.uniform(0.5, 1.5), i_bell(note, 2.2), 0.2,
                  pan=rng.uniform(0.2, 0.8))
    L[:, 0] = reverb(L[:, 0], 0.4); L[:, 1] = reverb(L[:, 1], 0.4)
    return L


def oriental(dur, key, rng, prog="modal", scale="hijaz"):
    bpm = rng.integers(96, 112)
    beat, bar, nbars = _grid(dur, bpm)
    n = int((nbars * bar + 1.0) * SR); L = np.zeros((n, 2)); progr = PROGS[prog]
    sc = SCALES[scale]
    for b in range(nbars):
        deg = progr[b % len(progr)]; ch = chord(key, scale, deg, octave=0)
        root = key + sc[deg[0] % 7] - 12; t0 = b * bar
        for v in ch:
            place(L, t0, i_pad(v, bar), 0.12, pan=0.5)
        # qanun-like run on the scale
        run = [key + sc[i % 7] + 12 for i in range(8)]
        rng.shuffle(run)
        for i, note in enumerate(run):
            place(L, t0 + i * beat / 2, i_pluck(note, beat * 0.45, kind="tri"), 0.3,
                  pan=0.3 + 0.4 * (i % 2))
        # doumbek groove (dum-tek-tek)
        pat = [("dum", 0), ("tek", 1), ("tek", 1.5), ("dum", 2), ("tek", 3), ("tek", 3.5)]
        for kind, off in pat:
            place(L, t0 + off * beat, d_doumbek(48 if kind == "dum" else 60), 0.8)
        place(L, t0, i_sub(root, beat * 1.0), 0.4)
    L[:, 0] = reverb(L[:, 0], 0.24); L[:, 1] = reverb(L[:, 1], 0.24)
    return L


def synthwave(dur, key, rng, prog="pop", scale="minor"):
    bpm = rng.integers(100, 116)
    beat, bar, nbars = _grid(dur, bpm)
    n = int((nbars * bar + 1.0) * SR); L = np.zeros((n, 2)); progr = PROGS[prog]
    for b in range(nbars):
        deg = progr[b % len(progr)]; ch = chord(key, scale, deg, octave=1)
        root = key + SCALES[scale][deg[0] % 7] - 12; t0 = b * bar
        for v in ch:
            place(L, t0, i_saw(v, bar), 0.12, pan=0.5)
        # 16th arpeggio
        arp = (ch + [ch[1] + 12]) * 4
        for i, note in enumerate(arp[:16]):
            place(L, t0 + i * beat / 4, i_pluck(note + 12, beat * 0.22, kind="square"),
                  0.18, pan=0.3 + 0.4 * (i % 2))
        for k in range(4):
            place(L, t0 + k * beat, d_kick(), 0.85)
            place(L, t0 + k * beat, i_sub(root, beat * 0.9), 0.5)
            place(L, t0 + k * beat + beat / 2, d_snare(), 0.5)
            place(L, t0 + k * beat + beat / 4, d_hat(), 0.3)
    L[:, 0] = reverb(L[:, 0], 0.2); L[:, 1] = reverb(L[:, 1], 0.2)
    return L


def bossa(dur, key, rng, prog="emotional", scale="major"):
    bpm = rng.integers(120, 134)
    beat, bar, nbars = _grid(dur, bpm)
    n = int((nbars * bar + 1.0) * SR); L = np.zeros((n, 2)); progr = PROGS[prog]
    for b in range(nbars):
        deg = progr[b % len(progr)]; ch = chord(key, scale, deg, octave=0)
        root = key + SCALES[scale][deg[0] % 7] - 12; t0 = b * bar
        # nylon guitar comping (off-beats)
        for off in (0.5, 1.5, 2.0, 3.0, 3.5):
            for v in ch:
                place(L, t0 + off * beat, i_guitar(v + 12, beat * 0.6), 0.14,
                      pan=0.45)
        place(L, t0, i_sub(root, beat), 0.4)
        place(L, t0 + 2 * beat, i_sub(root + 7, beat), 0.35)
        for k in range(8):
            place(L, t0 + k * beat / 2, d_shaker(), 0.22, pan=0.6)
        place(L, t0 + beat, d_hat(), 0.2)
    L[:, 0] = reverb(L[:, 0], 0.18); L[:, 1] = reverb(L[:, 1], 0.18)
    return L


def folk_acoustic(dur, key, rng, prog="pop", scale="major"):
    bpm = rng.integers(92, 108)
    beat, bar, nbars = _grid(dur, bpm)
    n = int((nbars * bar + 1.0) * SR); L = np.zeros((n, 2)); progr = PROGS[prog]
    for b in range(nbars):
        deg = progr[b % len(progr)]; ch = chord(key, scale, deg, octave=0)
        root = key + SCALES[scale][deg[0] % 7] - 12; t0 = b * bar
        # fingerpicked pattern
        pat = [ch[0], ch[2] + 12, ch[1] + 12, ch[2] + 12] * 2
        for i, note in enumerate(pat):
            place(L, t0 + i * beat / 2, i_guitar(note, beat * 0.7), 0.26,
                  pan=0.35 + 0.3 * (i % 2))
        place(L, t0, i_sub(root, beat * 1.5), 0.35)
        for k in range(4):
            place(L, t0 + k * beat + beat / 2, d_shaker(), 0.18)
    L[:, 0] = reverb(L[:, 0], 0.22); L[:, 1] = reverb(L[:, 1], 0.22)
    return L


def epic_drums(dur, key, rng, prog="cinematic", scale="minor"):
    bpm = rng.integers(80, 96)
    beat, bar, nbars = _grid(dur, bpm)
    n = int((nbars * bar + 1.5) * SR); L = np.zeros((n, 2)); progr = PROGS[prog]
    for b in range(nbars):
        deg = progr[b % len(progr)]; ch = chord(key, scale, deg)
        root = key + SCALES[scale][deg[0] % 7] - 12; t0 = b * bar
        for v in ch:
            place(L, t0, i_pad(v, bar, kind="saw"), 0.12)
            place(L, t0, i_choir(v + 12, bar), 0.1)
        place(L, t0, i_sub(root, bar), 0.5)
        # taiko-ish toms
        for k in range(4):
            place(L, t0 + k * beat, d_tom(38, 0.45), 0.8)
            if k % 2:
                place(L, t0 + k * beat + beat / 2, d_tom(45, 0.35), 0.5)
        if b % 2 == 1:                              # fill
            for i in range(4):
                place(L, t0 + 3 * beat + i * beat / 4, d_tom(40 + i * 3, 0.3), 0.6)
        place(L, t0, d_kick(0.4, punch=120), 1.0)
    L[:, 0] = reverb(L[:, 0], 0.3); L[:, 1] = reverb(L[:, 1], 0.3)
    return L


def travel(dur, key, rng, prog="pop", scale="major"):
    """Happy tourism / travel-vlog: ukulele strums, whistled melody, claps,
    glockenspiel sparkles, light four-on-the-floor. Bright and inviting."""
    bpm = int(rng.integers(102, 116))
    beat, bar, nbars = _grid(dur, bpm)
    n = int((nbars * bar + 1.0) * SR)
    L = np.zeros((n, 2))
    progr = PROGS[prog]
    mel_idx = int(rng.integers(2, 5))
    for b in range(nbars):
        deg = progr[b % len(progr)]
        ch = chord(key, scale, deg, octave=1)
        root = key + SCALES[scale][deg[0] % 7] - 12
        t0 = b * bar
        # ukulele strum — every eighth, alternating soft/strong, panned
        for s in range(8):
            strong = 0.13 if s % 2 == 0 else 0.08
            for v in ch:
                place(L, t0 + s * beat / 2, i_uke(v + 12, beat * 0.46),
                      strong, pan=0.36 + 0.28 * (s % 2))
        # warm bass on 1 & 3
        for k in (0, 2):
            place(L, t0 + k * beat, i_sub(root, beat * 0.9), 0.42)
        # kick 1&3, hand-clap 2&4, shaker eighths
        for k in range(4):
            if k % 2 == 0:
                place(L, t0 + k * beat, d_kick(punch=58), 0.7)
            else:
                place(L, t0 + k * beat, d_clap(), 0.6, pan=0.5)
        for s in range(8):
            place(L, t0 + s * beat / 2, d_shaker(), 0.18, pan=0.62)
        # whistled melody — one note per beat, singable
        notes = stepwise_melody(rng, key + 12, "penta_major", 4, start=mel_idx)
        mel_idx = 3
        for i, note in enumerate(notes):
            place(L, t0 + i * beat, i_whistle(note, beat * 0.92), 0.5, pan=0.5)
        # glockenspiel sparkle at the top of every 2nd bar
        if b % 2 == 0:
            place(L, t0, i_glock(ch[2] + 24, 1.1), 0.26, pan=0.4)
            place(L, t0 + 2.5 * beat, i_glock(ch[1] + 24, 0.9), 0.18, pan=0.6)
    L[:, 0] = reverb(L[:, 0], 0.18)
    L[:, 1] = reverb(L[:, 1], 0.18)
    return L


GENRES = {
    "travel": travel,
    "tropical_house": tropical_house, "deep_house": deep_house, "lofi": lofi,
    "cinematic": cinematic, "ambient": ambient, "oriental": oriental,
    "synthwave": synthwave, "bossa": bossa, "folk_acoustic": folk_acoustic,
    "epic_drums": epic_drums,
}


# ================================================================ render
def render(genre, dur, path, key=None, seed=0, scale=None, prog=None):
    rng = np.random.default_rng(seed)
    fn = GENRES.get(genre, cinematic)
    if key is None:
        key = int(rng.choice([57, 60, 62, 64, 55, 53]))     # A,C,D,E,G,F
    kwargs = {}
    if scale: kwargs["scale"] = scale
    if prog: kwargs["prog"] = prog
    stereo = fn(dur, key, rng, **kwargs)
    stereo = soft_clip(stereo, 1.1)
    stereo = finalize(stereo, dur, fade_out=min(1.4, dur * 0.2))
    save_wav(path, stereo)
    return path


if __name__ == "__main__":
    import config as C
    C.ensure_dirs()
    for i, g in enumerate(GENRES):
        render(g, 7.0, C.WORK_DIR / f"demo_{g}.wav", seed=i)
        print("wrote", g)
