# -*- coding: utf-8 -*-
"""
Lotus Sharm — multi-clip cinematic montage.

Stitches several clips together (in the given order) with smooth crossfades,
wraps the result in the fixed branded intro / outro, lays a chosen music track
underneath, shows a short title at the start, and burns the persistent
lower-third (website · phone) over the body. No grade / no glow — clean image.

Usage
-----
  python merge.py CLIP1.mp4 CLIP2.mp4 CLIP3.mp4 CLIP4.mp4 \
                  --music "music_library\\px_035_exventry-beautiful-day-480762.mp3" \
                  --out "_out\\beautiful_day.mp4"

Optional:
  --title "SHARM EL SHEIKH"  --kicker "Discover"  --subtitle "..."
  --theme "Coral Dawn"       --scene-crossfade 0.5  --title-hold 5.5
  --crf 22                   --no-intro / --no-outro
"""
from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import config as C                # noqa: E402
import frame as F                 # noqa: E402
import titles                     # noqa: E402
import bookends                   # noqa: E402
import themes as TH               # noqa: E402
import music_engine as ME         # noqa: E402
import sound_design as SD         # noqa: E402
from audio_mixer import Mixer     # noqa: E402

BOOKEND_CF = 0.5     # crossfade between intro/body/outro


def fit_to_canvas(clip):
    """Cover-fit & centre into the 1080x1920 canvas — returns a (W,H) clip."""
    from moviepy import CompositeVideoClip
    sw, sh = clip.size
    scale = max(C.W / sw, C.H / sh)
    scaled = clip.resized(scale)
    bw, bh = scaled.size
    return CompositeVideoClip(
        [scaled.with_position(((C.W - bw) // 2, (C.H - bh) // 2))],
        size=(C.W, C.H),
    ).with_duration(clip.duration)


def concat_with_crossfades(clips, cf):
    from moviepy import concatenate_videoclips, vfx
    if len(clips) == 1 or cf <= 0:
        return concatenate_videoclips(clips, method="compose")
    seq = [clips[0]]
    for c in clips[1:]:
        seq.append(c.with_effects([vfx.CrossFadeIn(cf)]))
    return concatenate_videoclips(seq, method="compose", padding=-cf)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("inputs", nargs="+", help="video files in playback order")
    ap.add_argument("--music", required=True,
                    help="audio file to use as the soundtrack")
    ap.add_argument("--theme", default="Coral Dawn",
                    help="theme (drives palette + title style); look only used "
                    "for the bookends — body image is left untouched")
    ap.add_argument("--title", default="LOTUS SHARM TRAVEL")
    ap.add_argument("--kicker", default="Discover")
    ap.add_argument("--subtitle", default="WHERE DESERT MEETS THE SEA")
    ap.add_argument("--out", default=None)
    ap.add_argument("--crf", type=int, default=22)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--scene-crossfade", type=float, default=0.5,
                    help="seconds of crossfade between consecutive clips")
    ap.add_argument("--title-hold", type=float, default=5.5,
                    help="seconds the title stays on screen")
    ap.add_argument("--no-intro", action="store_true")
    ap.add_argument("--no-outro", action="store_true")
    args = ap.parse_args()

    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    C.ensure_dirs()
    theme = TH.get(args.theme)
    pal = theme["palette"]

    from moviepy import (VideoFileClip, AudioFileClip, CompositeVideoClip,
                         concatenate_videoclips, vfx)

    # 1) load + canvas-fit each clip
    print(f"merging {len(args.inputs)} clip(s):")
    fitted = []
    for p in args.inputs:
        src = VideoFileClip(p).without_audio()
        f = fit_to_canvas(src)
        fitted.append(f)
        print(f"  - {Path(p).name}   {src.duration:5.2f}s   {src.size}")

    # 2) concatenate with crossfades — the body
    body = concat_with_crossfades(fitted, args.scene_crossfade)
    body_d = body.duration
    print(f"body length: {body_d:.2f}s")

    # 3) add persistent branding + a bounded title (no per-frame fx)
    layers = [body, F.make_branding_clip(body_d, palette=pal,
                                         layout=theme["layout"])]
    hold = max(1.5, min(args.title_hold, body_d - 0.5))
    if hold > 1:
        layers.append(titles.make_title(
            args.title, hold, kicker=args.kicker, subtitle=args.subtitle,
            palette=pal, style=theme["style"], start=0.6, y_frac=0.70))
    body_comp = CompositeVideoClip(layers, size=(C.W, C.H)).with_duration(body_d)

    # 4) bookends
    scenes = []
    intro_d = outro_d = 0.0
    if not args.no_intro:
        ic = bookends.intro_clip(2.6, palette=pal)
        intro_d = ic.duration
        scenes.append(ic)
        scenes.append(body_comp.with_effects([vfx.CrossFadeIn(BOOKEND_CF)]))
    else:
        scenes.append(body_comp)
    if not args.no_outro:
        oc = bookends.outro_clip(3.4, palette=pal).with_effects(
            [vfx.CrossFadeIn(BOOKEND_CF)])
        outro_d = oc.duration
        scenes.append(oc)
    video = concatenate_videoclips(scenes, method="compose",
                                   padding=-BOOKEND_CF).with_fps(args.fps)

    # 5) audio — chosen track underneath the whole thing + a few subtle sfx
    total = video.duration
    music_arr = AudioFileClip(args.music).to_soundarray(fps=ME.SR)
    if music_arr.ndim == 1:
        music_arr = np.stack([music_arr, music_arr], axis=1)
    elif music_arr.shape[1] == 1:
        music_arr = np.repeat(music_arr, 2, axis=1)

    mix = Mixer(total)
    mix.add_bed(music_arr, gain=0.92, fade=0.8)

    seed = theme["index"]
    mix.add(SD.sparkle(1.0, seed=seed), at=0.5, gain=0.35)         # intro logo
    t_body = intro_d - BOOKEND_CF if intro_d else 0
    if t_body > 0.3:
        mix.add(SD.whoosh(0.4, "up", seed=seed),
                at=t_body - 0.2, gain=0.32)
    # soft, near-inaudible whooshes on inter-scene crossfades
    if args.scene_crossfade > 0 and len(fitted) > 1:
        cf = args.scene_crossfade
        accum = (intro_d - BOOKEND_CF) if intro_d else 0
        for i in range(len(fitted) - 1):
            accum += fitted[i].duration - (cf if i > 0 else 0)
            mix.add(SD.whoosh(0.35, "up", seed=seed + i),
                    at=accum - 0.15, gain=0.22)
    if outro_d:
        t_outro = (intro_d - BOOKEND_CF if intro_d else 0) + body_d - BOOKEND_CF
        mix.add(SD.whoosh(0.4, "down", seed=seed + 99),
                at=t_outro - 0.2, gain=0.30)
        mix.add(SD.sparkle(1.2, seed=seed + 100),
                at=t_outro + 0.3, gain=0.32)

    audio = mix.to_audioclip().with_duration(video.duration)
    video = video.with_audio(audio)

    # 6) render
    out = Path(args.out) if args.out else (
        C.OUT_DIR / f"montage_{int(time.time())}.mp4")
    out.parent.mkdir(parents=True, exist_ok=True)
    print(f"writing {out}   duration={video.duration:.2f}s")
    video.write_videofile(
        str(out), fps=args.fps, codec="libx264", audio_codec="aac",
        preset="medium", threads=4, logger="bar",
        ffmpeg_params=["-crf", str(args.crf), "-pix_fmt", "yuv420p"])
    size_mb = out.stat().st_size / 1024 / 1024
    print(f"OK -> {out}   ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
