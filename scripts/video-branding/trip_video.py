# -*- coding: utf-8 -*-
"""
Per-trip cinematic slideshow video.

Builds a 9:16 (or square) promo from a trip's images + metadata:
  * Ken Burns slow zoom/pan on each image, cross-faded together
  * Clean brand frame (top strip with logo, bottom strip with site/phone +
    EasyCash installments badge) — no yellow corner brackets
  * Progressive Arabic + English text overlays revealing the title,
    highlights and final price callout in sync with the music
  * Background music (auto-picked from the music library by trip index, or
    forced via --music PATH / GENRE / silent)

Usage
-----
  python trip_video.py SLUG
  python trip_video.py SLUG --music silent
  python trip_video.py SLUG --music "music_library/px_007.mp3"
  python trip_video.py --all                 # render every trip in _trip_videos/
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))


# ----- canvas override (must run BEFORE module-level imports of fx/trip_frame)
def _override_canvas():
    pre = argparse.ArgumentParser(add_help=False)
    pre.add_argument("--square", action="store_true")
    pre.add_argument("--canvas", default=None)
    args, _ = pre.parse_known_args()
    import config as cfg
    if args.square:
        cfg.W = cfg.H = 1080
    elif args.canvas:
        try:
            w, h = map(int, args.canvas.lower().split("x"))
            cfg.W, cfg.H = w, h
        except Exception:
            pass


_override_canvas()

import config as C                       # noqa: E402
import util as U                         # noqa: E402
import fx                                # noqa: E402
import music_engine as ME                # noqa: E402
import sound_design as SD                # noqa: E402
from audio_mixer import Mixer            # noqa: E402
import trip_frame as TF                  # noqa: E402
from titles import clip_from_rgba        # noqa: E402

TRIP_ROOT = HERE / "_trip_videos"
LIBRARY = HERE / "music_library"


# ============================================================ slideshow
def _fit_to_area(clip, w, h):
    """Cover-fit a clip into a w×h area and return a clip of exactly (w,h)."""
    from moviepy import CompositeVideoClip
    sw, sh = clip.size
    scale = max(w / sw, h / sh)
    scaled = clip.resized(scale)
    bw, bh = scaled.size
    centred = scaled.with_position(((w - bw) // 2, (h - bh) // 2))
    return CompositeVideoClip([centred], size=(w, h)).with_duration(clip.duration)


def _ken_burns(clip, kind=0):
    """Slow push / pull with optional drift, returning a clip the same size."""
    from moviepy import vfx
    dur = clip.duration
    w, h = clip.size
    if kind % 3 == 0:
        z0, z1, panx, pany = 1.00, 1.08, 0.0, 0.0       # gentle push
    elif kind % 3 == 1:
        z0, z1, panx, pany = 1.08, 1.00, 0.0, 0.0       # gentle pull
    else:
        z0, z1, panx, pany = 1.05, 1.10, 0.03, 0.01     # push + drift

    def scale(t):
        k = (t / dur) if dur else 0
        return z0 + (z1 - z0) * U.ease_in_out_cubic(k)

    zoomed = clip.with_effects([vfx.Resize(scale)])

    def pos(t):
        s = scale(t)
        k = (t / dur) if dur else 0
        e = U.ease_in_out_cubic(k)
        return ((w - w * s) / 2 - panx * w * e,
                (h - h * s) / 2 - pany * h * e)
    return zoomed.with_position(pos)


def build_slideshow(images, body_d, area_w, area_h, cf=0.6):
    """Crossfaded Ken-Burns slideshow. Returns (clip, actual_duration).
    Auto-adapts per-image time so 3 images stretch and 15 images don't blur."""
    from moviepy import ImageClip, concatenate_videoclips, vfx
    n = len(images)
    if n == 0:
        raise ValueError("no images")
    per = max(2.5, min(6.0, (body_d + (n - 1) * cf) / n))
    actual = n * per - (n - 1) * cf
    clips = []
    for i, p in enumerate(images):
        clip = ImageClip(str(p)).with_duration(per).with_fps(30)
        fitted = _fit_to_area(clip, area_w, area_h)
        zoomed = _ken_burns(fitted, kind=i)
        if i > 0:
            zoomed = zoomed.with_effects([vfx.CrossFadeIn(cf)])
        clips.append(zoomed)
    body = concatenate_videoclips(clips, method="compose", padding=-cf)
    return body, actual


# ============================================================ text overlays
def _wrap_lines(draw, text, font, max_w):
    """Word-wrap a string into lines that fit within max_w pixels."""
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines


def _render_card(title, lines, palette, max_w, accent_pill=None):
    """Render an RGBA card with a serif title and 0+ description lines.
    Returns (rgba, height)."""
    pal = palette or {}
    accent = pal.get("accent", C.GOLD)
    accent_l = pal.get("accent_light", C.GOLD_LIGHT)

    img = Image.new("RGBA", (C.W, 600), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = C.W // 2
    y = 20

    if accent_pill:
        f_pill = U.font("sans_bold", 20)
        text = U.shape_ar(accent_pill)
        tw = d.textlength(text, font=f_pill)
        pad_x = 18
        pill_w = int(tw) + 2 * pad_x
        pill_h = 36
        x0 = cx - pill_w // 2
        d.rounded_rectangle([x0, y, x0 + pill_w, y + pill_h], radius=pill_h // 2,
                            fill=U.with_alpha(accent, 230))
        d.text((cx, y + pill_h // 2), text, font=f_pill,
               fill=C.TEAL_DEEP, anchor="mm")
        y += pill_h + 18

    # title — auto-fit
    if title:
        ttl = U.shape_ar(title)
        size = 64
        # use sans_bold to cover Arabic glyphs cleanly
        while size > 28:
            f_main = U.font("sans_bold", size)
            if d.textlength(ttl, font=f_main) <= max_w:
                break
            size -= 4
        # may still overflow — wrap
        f_main = U.font("sans_bold", size)
        wrap = _wrap_lines(d, ttl, f_main, max_w)
        for line in wrap[:3]:
            d.text((cx, y), line, font=f_main, fill=C.WHITE, anchor="mt",
                   stroke_width=2, stroke_fill=(0, 0, 0, 200))
            y += size + 8
        y += 12

    # description lines
    if lines:
        f_sub = U.font("sans", 26)
        for raw in lines[:3]:
            line = U.shape_ar(raw)
            wrap = _wrap_lines(d, line, f_sub, max_w)
            for w in wrap[:2]:
                d.text((cx, y), w, font=f_sub, fill=U.with_alpha(accent_l, 245),
                       anchor="mt", stroke_width=2, stroke_fill=(0, 0, 0, 180))
                y += 32
            y += 6

    # tight crop
    bbox = img.getbbox()
    if bbox:
        top = max(0, bbox[1] - 8)
        bot = min(600, bbox[3] + 10)
        img = img.crop((0, top, C.W, bot))
    return np.asarray(img), img.height


def _render_price_card(price_egp, price_usd, palette):
    """Big price callout card."""
    pal = palette or {}
    accent = pal.get("accent", C.GOLD)
    accent_l = pal.get("accent_light", C.GOLD_LIGHT)
    img = Image.new("RGBA", (C.W, 360), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = C.W // 2
    y = 20

    # eyebrow
    f_eye = U.font("sans_bold", 22)
    d.text((cx, y), U.shape_ar("السعر"), font=f_eye, fill=accent_l, anchor="mt")
    y += 30

    # big price
    f_big = U.font("serif_bold", 88)
    egp = f"{price_egp:,} EGP"
    usd = f"${price_usd}"
    pill_text = f"{egp}   ·   {usd}"
    # measure
    tw = d.textlength(pill_text, font=f_big)
    size = 88
    while tw > C.W - 80 and size > 40:
        size -= 4
        f_big = U.font("serif_bold", size)
        tw = d.textlength(pill_text, font=f_big)

    pill_h = size + 28
    pill_w = int(tw) + 80
    x0 = cx - pill_w // 2
    d.rounded_rectangle([x0, y, x0 + pill_w, y + pill_h], radius=pill_h // 2,
                        fill=U.with_alpha(accent, 240),
                        outline=accent_l, width=3)
    d.text((cx, y + pill_h // 2), pill_text, font=f_big,
           fill=C.TEAL_DEEP, anchor="mm")
    y += pill_h + 16

    # subtitle
    f_sub = U.font("sans", 24)
    d.text((cx, y), U.shape_ar("للفرد · يشمل غداء"), font=f_sub,
           fill=U.with_alpha(C.WHITE, 240), anchor="mt",
           stroke_width=2, stroke_fill=(0, 0, 0, 180))
    y += 32
    d.text((cx, y), "Per person · Lunch included", font=f_sub,
           fill=U.with_alpha(C.WHITE, 220), anchor="mt",
           stroke_width=2, stroke_fill=(0, 0, 0, 180))
    y += 38

    # tight crop
    bbox = img.getbbox()
    if bbox:
        img = img.crop((0, max(0, bbox[1] - 8), C.W, min(360, bbox[3] + 10)))
    return np.asarray(img), img.height


def _animated_text(card, start, duration, y_top, fade_in=0.5, fade_out=0.5,
                   rise=22):
    """Wrap an RGBA card into a moviepy clip that fades up at `start`."""
    from moviepy import vfx
    clip = clip_from_rgba(card, duration).with_start(start)
    clip = clip.with_effects([vfx.CrossFadeIn(fade_in), vfx.CrossFadeOut(fade_out)])

    def pos(t):
        e = U.ease_out_cubic(min(1.0, t / fade_in)) if fade_in else 1.0
        return (0, y_top + int((1 - e) * rise))
    return clip.with_position(pos)


def build_text_schedule(meta, body_d, palette):
    """Decide what text appears when, and return a list of moviepy clips."""
    title = meta["title"]["ar"] or meta["title"]["en"]
    title_en = meta["title"]["en"]
    short = meta["shortDesc"]["ar"] or meta["shortDesc"]["en"]
    highlights = meta["highlights"]["ar"][:3] or meta["highlights"]["en"][:3]
    duration_min = meta.get("durationMinutes") or 0
    egp = meta["priceLocalEGP"]
    usd = meta["priceForeignUSD"]

    text_area_top = TF.TOP_H + 60                        # below the top brand strip
    text_area_bot = C.H - TF.BOT_H - 60                  # above the bottom strip
    free_h = text_area_bot - text_area_top
    upper_y = text_area_top + 40                         # for the title block
    lower_y = text_area_bot - 360                        # for the highlights / price

    # ---- Phase 1: title + arabic short (0 .. body_d * 0.35) ----
    t_phase1_end = max(4.0, body_d * 0.35)
    card1, h1 = _render_card(
        title=title,
        lines=([short] if short else []),
        palette=palette,
        max_w=C.W - 100,
        accent_pill="رحلة جديدة · Lotus Sharm",
    )
    clips = [_animated_text(card1, 0.4, t_phase1_end - 0.4, upper_y)]

    # ---- Phase 2: highlights one-by-one (35% .. 70%) ----
    t_phase2_start = t_phase1_end + 0.3
    t_phase2_end = body_d * 0.70
    hl_clips = []
    if highlights:
        per = max(1.8, (t_phase2_end - t_phase2_start) / max(1, len(highlights)))
        for i, h in enumerate(highlights):
            card, ch = _render_card(
                title=None,
                lines=[h],
                palette=palette,
                max_w=C.W - 140,
                accent_pill=f"•  Highlight {i + 1}",
            )
            st = t_phase2_start + i * per
            hl_clips.append(_animated_text(
                card, st, min(per + 0.4, t_phase2_end - st + 0.4),
                lower_y - ch // 2 + 220, fade_in=0.4, fade_out=0.4, rise=14))
    clips += hl_clips

    # ---- Phase 3: price callout (70% .. 92%) ----
    t_phase3_start = max(t_phase2_end + 0.3, body_d * 0.72)
    t_phase3_end = body_d * 0.92
    card3, h3 = _render_price_card(egp, usd, palette)
    clips.append(_animated_text(
        card3, t_phase3_start, t_phase3_end - t_phase3_start,
        lower_y + 80 - h3 // 2, fade_in=0.5, fade_out=0.5, rise=20))

    # ---- Phase 4: CTA (92% .. end) ----
    cta_start = t_phase3_end
    cta_card, cta_h = _render_card(
        title="احجز الآن  ·  Book now",
        lines=["WhatsApp +20 109 076 7278"],
        palette=palette,
        max_w=C.W - 100,
        accent_pill="lotussharm.com",
    )
    clips.append(_animated_text(
        cta_card, cta_start, body_d - cta_start + 0.2,
        lower_y - cta_h // 2 + 100, fade_in=0.5, fade_out=0.4, rise=22))

    # title duration check — clamp to body_d
    return clips


# ============================================================ audio
def _resolve_music(music_arg, total_dur, index):
    """Return a stereo numpy array sized to `total_dur` seconds, or None."""
    if music_arg == "silent":
        return None
    # explicit file?
    if music_arg and Path(music_arg).is_file():
        return _load_audio(music_arg)
    # library auto-pick
    library = sorted(p for p in LIBRARY.iterdir()
                     if p.suffix.lower() in (".mp3", ".wav", ".m4a", ".aac",
                                              ".ogg", ".flac"))
    if music_arg in (None, "library") and library:
        return _load_audio(library[index % len(library)])
    # genre synthesis fallback
    if music_arg in ME.GENRES:
        wav = C.WORK_DIR / f"_trip_{music_arg}_{index}.wav"
        ME.render(music_arg, total_dur, wav, seed=index * 7 + 3)
        return _load_audio(wav)
    if library:
        return _load_audio(library[index % len(library)])
    return None


def _load_audio(path):
    from moviepy import AudioFileClip
    clip = AudioFileClip(str(path))
    arr = clip.to_soundarray(fps=ME.SR)
    clip.close()
    if arr.ndim == 1:
        arr = np.stack([arr, arr], axis=1)
    elif arr.shape[1] == 1:
        arr = np.repeat(arr, 2, axis=1)
    return arr


def build_audio(music_arr, total_dur, index):
    mix = Mixer(total_dur)
    if music_arr is not None:
        mix.add_bed(music_arr, gain=0.92, fade=0.8)
    mix.add(SD.sparkle(1.0, seed=index), at=0.5, gain=0.45)
    mix.add(SD.whoosh(0.5, "up", seed=index + 11), at=0.05, gain=0.35)
    mix.add(SD.whoosh(0.5, "down", seed=index + 23), at=max(0, total_dur - 1.0), gain=0.35)
    return mix.to_audioclip().with_duration(total_dur)


# ============================================================ orchestrator
def render_trip(slug, music="library", out=None, body_d=30.0, crf=20,
                fps=30, square=False, palette=None):
    from moviepy import (VideoFileClip, ImageClip, CompositeVideoClip,
                         concatenate_videoclips, vfx)
    t0 = time.time()
    C.ensure_dirs()
    trip_dir = TRIP_ROOT / slug
    meta_path = trip_dir / "meta.json"
    if not meta_path.exists():
        raise SystemExit(f"meta not found for slug '{slug}'")
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    images = sorted((trip_dir / "images").glob("*"))
    if not images:
        raise SystemExit(f"no images for slug '{slug}'")
    pal = palette or {"accent": C.GOLD, "accent_light": C.GOLD_LIGHT,
                       "title": C.WHITE}

    print(f"\n=== {slug} ===", flush=True)
    print(f"  {len(images)} images   body={body_d}s   "
          f"price={meta['priceLocalEGP']} EGP / ${meta['priceForeignUSD']}",
          flush=True)

    # ---- slideshow in the image area (adapts duration to image count) ----
    area_w = C.W
    area_h = C.H - TF.TOP_H - TF.BOT_H
    slideshow, actual_d = build_slideshow(images, body_d, area_w, area_h)
    slideshow = slideshow.with_position((0, TF.TOP_H))
    body_d = actual_d
    print(f"  actual body: {body_d:.1f}s", flush=True)

    # ---- canvas-sized teal background (so areas behind the brand strips are dark) ----
    bg = np.zeros((C.H, C.W, 3), dtype=np.uint8)
    bg[..., 0], bg[..., 1], bg[..., 2] = C.TEAL_DEEP
    bg_clip = ImageClip(bg).with_duration(body_d)

    # ---- persistent brand overlay (top + bottom + EasyCash) ----
    brand_rgba = TF.build_overlay(palette=pal)
    brand_clip = clip_from_rgba(brand_rgba, body_d)

    # ---- text overlays schedule ----
    text_clips = build_text_schedule(meta, body_d, pal)

    # ---- compose ----
    body = CompositeVideoClip(
        [bg_clip, slideshow, brand_clip, *text_clips],
        size=(C.W, C.H),
    ).with_duration(body_d).with_fps(fps)

    # ---- audio ----
    music_arr = _resolve_music(music, body_d, _slug_index(slug))
    audio = build_audio(music_arr, body_d, _slug_index(slug))
    body = body.with_audio(audio)

    # ---- write ----
    out_path = Path(out) if out else C.OUT_DIR / f"trip_{slug}.mp4"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    body.write_videofile(
        str(out_path), fps=fps, codec="libx264", audio_codec="aac",
        preset="medium", threads=4, logger="bar",
        ffmpeg_params=["-crf", str(crf), "-pix_fmt", "yuv420p"])
    size_mb = out_path.stat().st_size / 1024 / 1024
    print(f"  OK  ->  {out_path}   {size_mb:.1f} MB   ({time.time()-t0:.0f}s)",
          flush=True)
    return out_path


_SLUG_INDEX_CACHE: dict[str, int] = {}


def _slug_index(slug):
    if slug in _SLUG_INDEX_CACHE:
        return _SLUG_INDEX_CACHE[slug]
    slugs = sorted(p.name for p in TRIP_ROOT.iterdir() if p.is_dir())
    for i, s in enumerate(slugs):
        _SLUG_INDEX_CACHE[s] = i
    return _SLUG_INDEX_CACHE.get(slug, 0)


# ============================================================ cli
def main(argv=None):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug", nargs="?", help="trip slug (folder name under _trip_videos/)")
    ap.add_argument("--all", action="store_true",
                    help="render every trip folder found under _trip_videos/")
    ap.add_argument("--music", default="library",
                    help="library / silent / GENRE / path-to-audio")
    ap.add_argument("--out", default=None)
    ap.add_argument("--body", type=float, default=30.0,
                    help="body duration in seconds (default 30)")
    ap.add_argument("--crf", type=int, default=20)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--square", action="store_true",
                    help="render at 1080x1080 (IG feed)")
    ap.add_argument("--canvas", default=None,
                    help="custom canvas e.g. 1080x1350")
    args = ap.parse_args(argv)

    if args.all:
        slugs = sorted(p.name for p in TRIP_ROOT.iterdir() if p.is_dir())
        for s in slugs:
            try:
                render_trip(s, music=args.music, body_d=args.body, crf=args.crf,
                            fps=args.fps)
            except Exception as e:
                print(f"  FAIL  {s}: {e}", flush=True)
        return

    if not args.slug:
        ap.error("provide a slug or --all")
    render_trip(args.slug, music=args.music, out=args.out, body_d=args.body,
                crf=args.crf, fps=args.fps)


if __name__ == "__main__":
    main()
