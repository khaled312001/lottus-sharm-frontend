# -*- coding: utf-8 -*-
"""
Lotus Sharm Travel — cinematic auto-editor.

Wraps raw footage in a themed cinematic montage: fixed branded intro, colour-
graded + effected body with kinetic title and persistent branding, fixed branded
outro, plus a synthesised genre soundtrack with sound-design and ambience.

Usage
-----
  python brand_video.py INPUT.mp4 --theme "Coral Dawn"
  python brand_video.py INPUT.mp4 --theme 4 --title "RAS MOHAMED" --kicker "Dive"
  python brand_video.py INPUT.mp4 --theme random --out out.mp4
  python brand_video.py INPUT.mp4 --all                 # render every theme
  python brand_video.py --list                          # list themes
  python brand_video.py --music-pack                    # preview all genres

Quality flags: --fast (skip heavy glow), --fps 30, --crf 19, --max 12 (trim body).
"""
from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import numpy as np

import config as C
import util as U
import colorgrade
import fx
import frame as F
import titles
import bookends
import themes as TH
import music_engine as ME
import sound_design as SD
from audio_mixer import Mixer

CF = 0.5          # crossfade between scenes


# ----------------------------------------------------------------- helpers
def _fit_cover(clip):
    sw, sh = clip.size
    scale = max(C.W / sw, C.H / sh)
    return clip.resized(scale)


def _stack_image_transforms(clip, funcs):
    for fn in funcs:
        clip = clip.image_transform(fn)
    return clip


# ----------------------------------------------------------------- body
def build_body(src, theme, fast=False, title_over=None, kicker_over=None,
               sub_over=None):
    from moviepy import CompositeVideoClip
    fxp = theme["fx"]
    pal = theme["palette"]
    grade = colorgrade.get(theme["grade"])

    base = _fit_cover(src)
    bw, bh = base.size
    dur = base.duration

    # ---- colour grade (baked LUT) + per-frame fx (cheap order matters) ----
    procs = [colorgrade.grader(grade)]
    if not fast and fxp.get("bloom"):
        procs.append(fx.bloom(intensity=0.45, radius=9))
    if not fast and fxp.get("halation"):
        procs.append(fx.halation(intensity=0.4))
    if fxp.get("chroma"):
        procs.append(fx.chromatic_aberration(2.0))
    if not fast and fxp.get("sharpen"):
        procs.append(fx.sharpen(fxp["sharpen"]))
    if fxp.get("grain"):
        procs.append(fx.grain(fxp["grain"]))
    graded = _stack_image_transforms(base, procs)

    # time-varying light leak
    leak = fxp.get("light_leak")
    if leak and not fast:
        graded = graded.transform(
            fx.light_leak_transform(color=leak, intensity=0.4,
                                    period=max(3.0, dur), seed=theme["index"]))

    # ---- ken burns (slow push), centred crop into canvas ----
    z0, z1, pan = fxp.get("ken_burns", (1.0, 1.10, (0, 0)))
    from moviepy import vfx

    def zscale(t):
        return z0 + (z1 - z0) * U.ease_in_out_cubic(t / dur if dur else 0)
    moving = graded.with_effects([vfx.Resize(zscale)])

    def pos(t):
        s = zscale(t)
        return ((C.W - bw * s) / 2 - pan[0] * C.W * (t / dur if dur else 0),
                (C.H - bh * s) / 2 - pan[1] * C.H * (t / dur if dur else 0))
    moving = moving.with_position(pos)

    layers = [moving]

    # ---- overlays ----
    if fxp.get("bokeh") and not fast:
        layers.append(fx.make_bokeh_clip(
            dur, n=18, color=pal["accent_light"], seed=theme["index"]
        ).with_opacity(0.4))
    if fxp.get("dust") and not fast:
        layers.append(fx.make_dust_clip(dur, seed=theme["index"]).with_opacity(0.3))

    layers.append(titles.clip_from_rgba(
        fx.edge_glow_overlay(color=pal["accent"], strength=0.14), dur))
    if fxp.get("letterbox"):
        layers.append(titles.clip_from_rgba(fx.letterbox_overlay(), dur))
    layers.append(titles.clip_from_rgba(
        fx.vignette_overlay(strength=fxp.get("vignette", 0.5)), dur))

    # persistent branding (logo / lower-third / sweep)
    layers.append(F.make_branding_clip(dur, palette=pal, layout=theme["layout"]))

    # kinetic title
    title = title_over or theme["title"]
    kicker = kicker_over if kicker_over is not None else theme["kicker"]
    sub = sub_over if sub_over is not None else theme["subtitle"]
    layers.append(titles.make_title(
        title, dur, kicker=kicker, subtitle=sub, palette=pal,
        style=theme["style"], start=0.6, y_frac=0.70))

    comp = CompositeVideoClip(layers, size=(C.W, C.H)).with_duration(dur)
    return comp


# ----------------------------------------------------------------- audio
def _load_track(path):
    """Read an audio file -> (n,2) float stereo array at ME.SR."""
    from moviepy import AudioFileClip
    clip = AudioFileClip(str(path))
    arr = clip.to_soundarray(fps=ME.SR)
    clip.close()
    if arr.ndim == 1:
        arr = np.stack([arr, arr], axis=1)
    elif arr.shape[1] == 1:
        arr = np.repeat(arr, 2, axis=1)
    return arr


def _resolve_music(theme, total, music):
    """Return (stereo_array, is_real_track).
    `music` may be: a file path, a genre name, 'synth', 'library', or None.
    None -> use the library if it has tracks, else the theme's synth genre."""
    tracks = C.music_tracks()
    # explicit file path
    if music and Path(music).expanduser().is_file():
        return _load_track(Path(music).expanduser()), True
    # explicit genre / synth
    if music and (music in ME.GENRES or music == "synth"):
        genre = theme["music"]["genre"] if music == "synth" else music
        wav = C.WORK_DIR / f"_music_{theme['index']}_{genre}.wav"
        ME.render(genre, total, wav, key=theme["music"]["key"],
                  seed=theme["music"]["seed"])
        return _load_track(wav), False
    # library (explicit or auto when populated)
    if (music == "library" or music is None) and tracks:
        track = tracks[theme["index"] % len(tracks)]   # deterministic per theme
        return _load_track(track), True
    # fallback: theme's synthesised genre
    m = theme["music"]
    wav = C.WORK_DIR / f"_music_{theme['index']}_{m['genre']}.wav"
    ME.render(m["genre"], total, wav, key=m["key"], seed=m["seed"],
              scale=m["scale"], prog=m["prog"])
    return _load_track(wav), False


def build_audio(theme, intro_d, body_d, outro_d, music_genre=None):
    total = intro_d + body_d + outro_d - 2 * CF
    music_arr, is_real = _resolve_music(theme, total, music_genre)

    mix = Mixer(total)
    mix.add_bed(music_arr, gain=0.9 if is_real else 0.85, fade=0.6)

    amb = SD.AMBIENCE.get(theme["ambience"])
    if amb:
        mix.add_bed(amb(total, seed=theme["index"]),
                    gain=0.5 if is_real else 0.8, fade=1.0)

    # sound design timeline — softer when a real track is carrying the mood
    g = 0.4 if is_real else 1.0
    seed = theme["index"]
    mix.add(SD.sparkle(1.2, seed=seed), at=0.5, gain=0.7 * g)        # intro logo
    if not is_real:
        mix.add(SD.riser(min(1.8, intro_d), seed=seed),
                at=max(0, intro_d - CF - 1.4), gain=0.6)
    t_body = intro_d - CF
    mix.add(SD.whoosh(0.6, "up", seed=seed), at=t_body - 0.3, gain=0.7 * g)
    mix.add(SD.impact(1.2, seed=seed), at=t_body, gain=0.5 * g)
    t_outro = intro_d - CF + body_d - CF
    mix.add(SD.whoosh(0.6, "down", seed=seed + 1), at=t_outro - 0.3, gain=0.6 * g)
    mix.add(SD.impact(1.4, tone=44, seed=seed + 1), at=t_outro, gain=0.6 * g)
    mix.duck(t_outro, depth=0.4, release=0.8)
    mix.add(SD.sparkle(1.4, seed=seed + 2), at=t_outro + 0.3, gain=0.6 * g)

    return mix.to_audioclip()


# ----------------------------------------------------------------- assemble
def render_one(input_path, theme, out_path, *, fast=False, fps=C.FPS, crf=19,
               max_body=None, title=None, kicker=None, subtitle=None,
               intro=True, outro=True, music=None):
    from moviepy import VideoFileClip, concatenate_videoclips, vfx

    t0 = time.time()
    src = VideoFileClip(str(input_path)).without_audio()
    if max_body:
        src = src.subclipped(0, min(max_body, src.duration))
    body_d = src.duration

    print(f"  - theme '{theme['name']}'  grade={theme['grade']}  "
          f"music={theme['music']['genre']}  body={body_d:.1f}s")

    body = build_body(src, theme, fast=fast, title_over=title,
                      kicker_over=kicker, sub_over=subtitle)

    clips = []
    intro_d = outro_d = 0.0
    if intro:
        ic = bookends.intro_clip(2.6, palette=theme["palette"])
        intro_d = ic.duration
        clips.append(ic)
    clips.append(body.with_effects([vfx.CrossFadeIn(CF)]) if intro else body)
    if outro:
        oc = bookends.outro_clip(3.4, palette=theme["palette"]).with_effects(
            [vfx.CrossFadeIn(CF)])
        outro_d = oc.duration
        clips.append(oc)

    video = concatenate_videoclips(clips, method="compose", padding=-CF)
    video = video.with_fps(fps)

    audio = build_audio(theme, intro_d if intro else CF, body_d,
                        outro_d if outro else CF, music_genre=music)
    video = video.with_audio(audio.with_duration(video.duration))

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    video.write_videofile(
        str(out_path), fps=fps, codec="libx264", audio_codec="aac",
        preset="medium", threads=4, logger="bar",
        ffmpeg_params=["-crf", str(crf), "-pix_fmt", "yuv420p"])
    src.close(); video.close()
    print(f"  OK -> {out_path}  ({time.time() - t0:.0f}s)\n")


# ----------------------------------------------------------------- cli
def main(argv=None):
    try:                                  # avoid cp1252 console crashes on Windows
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    ap = argparse.ArgumentParser(description="Lotus Sharm cinematic auto-editor")
    ap.add_argument("input", nargs="?", help="source video path")
    ap.add_argument("--theme", default="random", help="theme name / index / random")
    ap.add_argument("--all", action="store_true", help="render every theme")
    ap.add_argument("--out", help="output path (single render)")
    ap.add_argument("--title"); ap.add_argument("--kicker"); ap.add_argument("--subtitle")
    ap.add_argument("--music", help="music source: a file path, a genre "
                    "(travel/cinematic/...), 'synth', or 'library'. Default: use "
                    "the music_library folder if it has tracks, else synth.")
    ap.add_argument("--no-intro", action="store_true")
    ap.add_argument("--no-outro", action="store_true")
    ap.add_argument("--fast", action="store_true", help="skip heavy glow fx")
    ap.add_argument("--fps", type=int, default=C.FPS)
    ap.add_argument("--crf", type=int, default=19)
    ap.add_argument("--max", type=float, dest="max_body", help="trim body seconds")
    ap.add_argument("--list", action="store_true", help="list themes and exit")
    ap.add_argument("--music-pack", action="store_true",
                    help="render a preview WAV of every genre")
    args = ap.parse_args(argv)

    C.ensure_dirs()

    if args.list:
        print("\n".join(TH.names())); return
    if args.music_pack:
        for i, g in enumerate(ME.GENRES):
            ME.render(g, 8.0, C.OUT_DIR / f"music_{g}.wav", seed=i)
            print("wrote", g)
        return
    if not args.input:
        ap.error("input video required (or use --list / --music-pack)")
    inp = Path(args.input)
    if not inp.exists():
        ap.error(f"not found: {inp}")

    def out_for(theme):
        if args.out and not args.all:
            return Path(args.out)
        safe = theme["name"].lower().replace(" ", "_")
        return C.OUT_DIR / f"{inp.stem}__{theme['index']:02d}_{safe}.mp4"

    common = dict(fast=args.fast, fps=args.fps, crf=args.crf,
                  max_body=args.max_body, title=args.title, kicker=args.kicker,
                  subtitle=args.subtitle, intro=not args.no_intro,
                  outro=not args.no_outro, music=args.music)

    if args.all:
        print(f"Rendering {len(TH.THEMES)} themed videos from {inp.name}\n")
        for theme in TH.THEMES:
            render_one(inp, theme, out_for(theme), **common)
    else:
        theme = TH.get(args.theme)
        render_one(inp, theme, out_for(theme), **common)


if __name__ == "__main__":
    main()
