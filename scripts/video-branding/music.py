# -*- coding: utf-8 -*-
"""
Procedurally-synthesised, fully royalty-free background music (public domain by
authorship). Two moods: `tropical` (upbeat) and `cinematic` (calm/elegant).
Writes 16-bit stereo WAV. No external assets, no attribution required.
"""
import wave
import numpy as np

SR = 44100


def m2f(m):
    return 440.0 * 2.0 ** ((m - 69) / 12.0)


def env_adsr(n, a, d, s, r):
    A = min(int(a * SR), n)
    D = min(int(d * SR), n - A)
    R = min(int(r * SR), n - A - D)
    S = max(0, n - A - D - R)
    e = np.zeros(n)
    i = 0
    if A: e[i:i + A] = np.linspace(0, 1, A); i += A
    if D: e[i:i + D] = np.linspace(1, s, D); i += D
    if S: e[i:i + S] = s;                    i += S
    if R: e[i:i + R] = np.linspace(s, 0, R)
    return e


def osc(freq, n, partials, detune=0.0):
    t = np.arange(n) / SR
    y = np.zeros(n)
    for k, amp in partials:
        y += amp * np.sin(2 * np.pi * freq * k * (1 + detune) * t)
    return y


# ----- instruments ---------------------------------------------------------
def pluck(midi, dur):
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (2, 0.5), (3, 0.22), (4, 0.1)])
    return y * env_adsr(n, 0.004, 0.30, 0.0, 0.06)


def bell(midi, dur):
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (2.0, 0.5), (3.01, 0.32),
                           (4.2, 0.2), (5.4, 0.12)])
    return y * env_adsr(n, 0.005, dur * 0.9, 0.0, 0.05)


def pad(midi, dur):
    n = int(dur * SR)
    parts = [(1, 1.0), (2, 0.5), (3, 0.33), (4, 0.22), (5, 0.14), (6, 0.09)]
    y = osc(m2f(midi), n, parts, detune=+0.006) + \
        osc(m2f(midi), n, parts, detune=-0.006)
    return y * env_adsr(n, 0.45, 0.2, 0.85, 0.6) * 0.5


def sub(midi, dur):
    n = int(dur * SR)
    y = osc(m2f(midi), n, [(1, 1.0), (2, 0.2)])
    return y * env_adsr(n, 0.01, 0.25, 0.7, 0.12)


def kick(dur=0.22):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 48 + 80 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9.0)


def shaker(dur=0.08):
    n = int(dur * SR)
    noise = np.random.randn(n)
    noise = np.diff(noise, prepend=0.0)          # crude high-pass
    return noise * env_adsr(n, 0.004, 0.05, 0.0, 0.01) * 0.5


# ----- mixing helpers ------------------------------------------------------
def place(buf, start, sig, gain=1.0):
    i = int(start * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[:j - i] * gain


def reverb(x, amount, taps):
    out = x.copy()
    for delay, g in taps:
        d = int(delay * SR)
        if d < len(x):
            t = np.zeros_like(x)
            t[d:] = x[:-d] * g
            out += t * amount
    return out


def stereoize(mono, width=0.008):
    d = int(width * SR)
    L = mono.copy()
    R = mono.copy()
    if d:
        R[d:] = mono[:-d]
    return np.stack([L, R], axis=1)


def finalize(mono, dur, fade_out=1.1):
    n = int(dur * SR)
    mono = mono[:n] if len(mono) >= n else np.pad(mono, (0, n - len(mono)))
    fi = int(0.04 * SR)
    mono[:fi] *= np.linspace(0, 1, fi)
    fo = int(fade_out * SR)
    if fo:
        mono[-fo:] *= np.linspace(1, 0, fo) ** 1.4
    return mono


def save_wav(path, stereo):
    peak = np.max(np.abs(stereo)) or 1.0
    x = (stereo / peak * 0.94 * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(x.tobytes())


# ----- compositions --------------------------------------------------------
def tropical(dur, path):
    bpm = 120
    beat = 60.0 / bpm
    bar = beat * 4
    total = bar * 4 + 1.0
    n = int(total * SR)
    melody = np.zeros(n)
    rhythm = np.zeros(n)

    # I - V - vi - IV  (C  G  Am  F)
    chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
    roots = [36, 31, 33, 29]

    for b, (ch, root) in enumerate(zip(chords, roots)):
        t0 = b * bar
        place(melody, t0, pad(ch[0] + 12, bar), 0.18)
        place(melody, t0, pad(ch[1] + 12, bar), 0.14)
        # marimba arpeggio – eighth notes
        arp = (ch + [ch[2] + 5]) * 2
        for i, note in enumerate(arp):
            place(melody, t0 + i * (beat / 2), pluck(note + 12, beat * 0.6), 0.42)
        # bass + four-on-the-floor + shaker
        for k in range(4):
            place(rhythm, t0 + k * beat, sub(root, beat * 0.9), 0.55)
            place(rhythm, t0 + k * beat, kick(), 0.95)
            place(rhythm, t0 + k * beat + beat / 2, shaker(), 0.3)

    melody = reverb(melody, 0.18,
                    [(0.031, 0.6), (0.047, 0.45), (0.071, 0.32), (0.11, 0.2)])
    mono = melody + rhythm
    mono = finalize(mono, dur, fade_out=0.9)
    save_wav(path, stereoize(mono))


def cinematic(dur, path):
    bar = 2.2
    total = bar * 4 + 1.5
    n = int(total * SR)
    melody = np.zeros(n)

    # vi - IV - I - V  (Am  F  C  G) – warm and emotional
    chords = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]]
    roots = [33, 29, 36, 31]

    for b, (ch, root) in enumerate(zip(chords, roots)):
        t0 = b * bar
        for v in ch:
            place(melody, t0, pad(v, bar * 1.05), 0.22)
        place(melody, t0, sub(root, bar * 1.0), 0.4)
        # sparse shimmering bells
        for i, note in enumerate([ch[2] + 12, ch[1] + 12, ch[0] + 19]):
            place(melody, t0 + 0.4 + i * 0.55, bell(note, 1.6), 0.3)

    melody = reverb(melody, 0.3,
                    [(0.037, 0.7), (0.053, 0.6), (0.083, 0.5),
                     (0.13, 0.38), (0.19, 0.27), (0.27, 0.18)])
    mono = finalize(melody, dur, fade_out=1.4)
    save_wav(path, stereoize(mono, width=0.012))


if __name__ == "__main__":
    tropical(6.68, r"E:\work\_music_tropical.wav")
    cinematic(6.68, r"E:\work\_music_cinematic.wav")
    print("music written")
