# -*- coding: utf-8 -*-
"""
Customer-reviews testimonial video.

Loads the 12 approved reviews from the live API (cached in _reviews/all.json),
renders one premium card per review (stars + comment + author + trip), and
stitches them into a 9:16 reel with the same brand frame as the trip videos.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import config as C                  # noqa: E402
import util as U                    # noqa: E402
import music_engine as ME           # noqa: E402
import sound_design as SD           # noqa: E402
from audio_mixer import Mixer       # noqa: E402
import trip_frame as TF             # noqa: E402
from titles import clip_from_rgba   # noqa: E402

REVIEWS_JSON = HERE / "_reviews" / "all.json"
AD_LIBRARY = HERE / "ad_library"
MUSIC_LIBRARY = HERE / "music_library"
EXTS = (".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac")


# ============================================================ data
def _load_reviews():
    d = json.loads(REVIEWS_JSON.read_text(encoding="utf-8"))
    items = d.get("data", {}).get("items", []) or d.get("items", [])
    return [r for r in items if r.get("isApproved", True)]


def _trip_title(review):
    trip = review.get("trip") or {}
    for t in (trip.get("translations") or []):
        if t.get("locale") == "AR" and t.get("title"):
            return t["title"]
    for t in (trip.get("translations") or []):
        if t.get("title"):
            return t["title"]
    return ""


# ============================================================ wrap + measure
def _measure_w(d, text, font):
    try:
        b = d.textbbox((0, 0), text, font=font)
        return b[2] - b[0]
    except Exception:
        return d.textlength(text, font=font)


def _wrap_lines(d, text, font, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if _measure_w(d, U.shape_ar(trial), font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


# ============================================================ card render
def _render_review_card(review, area_w, palette):
    pal = palette or {}
    accent = pal.get("accent", C.GOLD)
    accent_l = pal.get("accent_light", C.GOLD_LIGHT)

    img = Image.new("RGBA", (area_w, 900), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = area_w // 2
    max_w = area_w - 220
    y = 30

    # accent pill — "آراء عملائنا"
    f_pill = U.font("sans_bold", 26)
    pill_text = U.shape_ar("آراء عملائنا · GUEST REVIEW")
    pw = int(_measure_w(d, pill_text, f_pill)) + 52
    pillh = 50
    d.rounded_rectangle([cx - pw // 2, y, cx + pw // 2, y + pillh],
                        radius=pillh // 2,
                        fill=U.with_alpha(accent, 240), outline=accent_l, width=2)
    d.text((cx, y + pillh // 2), pill_text, font=f_pill,
           fill=C.TEAL_DEEP, anchor="mm")
    y += pillh + 32

    # opening quote glyph
    f_quote = U.font("serif_bold", 140)
    d.text((cx, y - 20), '"', font=f_quote,
           fill=U.with_alpha(accent_l, 180), anchor="mt")
    y += 100

    # stars row — 5 stars w/ rating count highlighted
    rating = int(review.get("rating", 5))
    f_star = U.font("sans_bold", 56)
    star = "★"
    full = star * rating
    empty = star * (5 - rating)
    line = full + empty
    lw = _measure_w(d, line, f_star)
    x = cx - lw / 2
    fw = _measure_w(d, full, f_star)
    d.text((x, y), full, font=f_star, fill=accent, anchor="lt",
           stroke_width=2, stroke_fill=(0, 0, 0, 200))
    if empty:
        d.text((x + fw, y), empty, font=f_star,
               fill=U.with_alpha(accent, 70), anchor="lt")
    y += 70

    # comment text — wrap + shape per line
    comment = (review.get("comment") or "").strip()
    # collapse whitespace and emojis sprinkle
    comment = re.sub(r"\s+", " ", comment)
    size = 38
    wrap = []
    while size > 24:
        f_body = U.font("sans_bold", size)
        wrap = _wrap_lines(d, comment, f_body, max_w)
        if len(wrap) <= 6:
            break
        size -= 2
    f_body = U.font("sans_bold", size)
    wrap = _wrap_lines(d, comment, f_body, max_w)
    for line in wrap[:7]:
        d.text((cx, y), U.shape_ar(line), font=f_body,
               fill=C.WHITE, anchor="mt",
               stroke_width=3, stroke_fill=(0, 0, 0, 220))
        y += size + 12
    y += 30

    # gold divider with diamond
    d.line([(cx - 90, y), (cx - 14, y)], fill=accent_l, width=2)
    d.line([(cx + 14, y), (cx + 90, y)], fill=accent_l, width=2)
    d.polygon([(cx, y - 8), (cx + 8, y), (cx, y + 8), (cx - 8, y)],
              fill=accent)
    y += 22

    # author
    f_author = U.font("sans_bold", 38)
    author = (review.get("customerName") or "—").strip()
    d.text((cx, y), U.shape_ar(f"— {author}"), font=f_author,
           fill=accent_l, anchor="mt",
           stroke_width=2, stroke_fill=(0, 0, 0, 220))
    y += 50

    # trip title (small)
    trip_name = _trip_title(review)
    if trip_name:
        f_trip = U.font("sans", 26)
        wrap_t = _wrap_lines(d, trip_name, f_trip, max_w)
        for line in wrap_t[:1]:
            d.text((cx, y), U.shape_ar(line), font=f_trip,
                   fill=U.with_alpha(C.WHITE, 220), anchor="mt",
                   stroke_width=2, stroke_fill=(0, 0, 0, 200))
            y += 36

    bbox = img.getbbox()
    if bbox:
        img = img.crop((0, max(0, bbox[1] - 10),
                        area_w, min(900, bbox[3] + 14)))
    return np.asarray(img), img.height


# ============================================================ scenes
def _make_bg_card(area_w, area_h, palette, seed=0):
    """A subtle, cinematic teal gradient background with a soft gold glow.
    Each review uses a slightly different glow position for variety."""
    pal = palette or {}
    accent_l = pal.get("accent_light", C.GOLD_LIGHT)
    grad = U.vertical_gradient(area_w, area_h, [
        (0.0, C.TEAL_DEEP), (0.45, C.TEAL_DARK),
        (0.55, C.TEAL_DARK), (1.0, C.TEAL_DEEP)]).convert("RGB")
    arr = np.asarray(grad, np.float32)

    rng = np.random.default_rng(seed)
    glow = U.radial_gradient(area_w, area_h, accent_l, (0, 0, 0),
                             cx=float(rng.uniform(0.25, 0.75)),
                             cy=float(rng.uniform(0.30, 0.65)),
                             radius=0.55, power=1.6).convert("RGB")
    arr = np.clip(arr + np.asarray(glow, np.float32) * 0.16, 0, 255)
    return arr.astype(np.uint8)


def _make_review_clip(review, area_w, area_h, palette, duration=5.5,
                      bg_seed=0):
    from moviepy import ImageClip, CompositeVideoClip
    bg = ImageClip(_make_bg_card(area_w, area_h, palette, bg_seed))
    bg = bg.with_duration(duration).with_fps(30)

    card, ch = _render_review_card(review, area_w, palette)
    y = max(40, (area_h - ch) // 2)
    card_clip = clip_from_rgba(card, duration).with_position((0, y))

    return CompositeVideoClip([bg, card_clip],
                              size=(area_w, area_h)).with_duration(duration)


def _intro_segment(area_w, area_h, palette, duration=3.0):
    from moviepy import CompositeVideoClip, vfx
    bg = _make_bg_card(area_w, area_h, palette, seed=42)
    from moviepy import ImageClip
    bg_clip = ImageClip(bg).with_duration(duration).with_fps(30)

    pal = palette or {}
    accent_l = pal.get("accent_light", C.GOLD_LIGHT)

    img = Image.new("RGBA", (area_w, 600), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = area_w // 2
    y = 80

    f_eyebrow = U.font("sans_bold", 32)
    text = U.shape_ar("الحقيقة كما يرونها")
    d.text((cx, y), text, font=f_eyebrow, fill=accent_l, anchor="mt")
    y += 60

    f_main = U.font("sans_bold", 100)
    main_ar = U.shape_ar("آراء عملائنا")
    d.text((cx, y), main_ar, font=f_main, fill=C.WHITE, anchor="mt",
           stroke_width=4, stroke_fill=(0, 0, 0, 230))
    y += 130

    f_en = U.font("serif_bold", 64)
    d.text((cx, y), "WHAT OUR GUESTS SAY", font=f_en, fill=accent_l, anchor="mt",
           stroke_width=3, stroke_fill=(0, 0, 0, 220))
    y += 80

    f_count = U.font("sans", 30)
    d.text((cx, y), "Real reviews · ★★★★★", font=f_count, fill=C.WHITE,
           anchor="mt")
    bbox = img.getbbox()
    img = img.crop((0, max(0, bbox[1] - 10),
                    area_w, min(600, bbox[3] + 14)))
    title_rgba = np.asarray(img)
    ty = (area_h - title_rgba.shape[0]) // 2
    title = clip_from_rgba(title_rgba, duration).with_position((0, ty))
    title = title.with_effects([vfx.CrossFadeIn(0.7), vfx.CrossFadeOut(0.5)])

    return CompositeVideoClip([bg_clip, title],
                              size=(area_w, area_h)).with_duration(duration)


def _outro_segment(area_w, area_h, palette, duration=3.5):
    """Reuse the trip-video outro card (احجز رحلتك الآن)."""
    from moviepy import CompositeVideoClip, ImageClip
    import trip_video as TV
    bg = ImageClip(_make_bg_card(area_w, area_h, palette, seed=99))
    bg = bg.with_duration(duration).with_fps(30)
    card, ch = TV._render_outro_card(palette, area_w)
    y = max(40, (area_h - ch) // 2)
    cta = clip_from_rgba(card, duration).with_position((0, y))
    from moviepy import vfx
    cta = cta.with_effects([vfx.CrossFadeIn(0.7), vfx.CrossFadeOut(0.5)])
    return CompositeVideoClip([bg, cta],
                              size=(area_w, area_h)).with_duration(duration)


# ============================================================ audio
def _resolve_music(total_d, prefer_ads=True):
    pools = ([AD_LIBRARY, MUSIC_LIBRARY] if prefer_ads
             else [MUSIC_LIBRARY, AD_LIBRARY])
    for d_ in pools:
        if not d_.exists():
            continue
        tracks = sorted(p for p in d_.iterdir()
                        if p.suffix.lower() in EXTS)
        if tracks:
            return tracks[0]
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


def build_audio(music_arr, total_d):
    mix = Mixer(total_d)
    if music_arr is not None:
        mix.add_bed(music_arr, gain=0.92, fade=0.8)
    mix.add(SD.sparkle(1.0, seed=7), at=0.3, gain=0.4)
    mix.add(SD.whoosh(0.5, "up", seed=11), at=0.05, gain=0.32)
    mix.add(SD.whoosh(0.5, "down", seed=23),
            at=max(0, total_d - 1.0), gain=0.32)
    return mix.to_audioclip().with_duration(total_d)


# ============================================================ screenshot mode
SHOTS_DIR = HERE / "_reviews" / "shots"


def _fit_shot_to_card(path, area_w, area_h):
    """Lay a screenshot card on a brand-coloured panel that fills the image
    area. Each shot is scaled to fit (no crop) and centred."""
    bg = Image.new("RGB", (area_w, area_h), C.TEAL_DEEP)
    # subtle gradient
    grad = U.vertical_gradient(area_w, area_h, [
        (0.0, C.TEAL_DEEP), (0.5, C.TEAL_DARK),
        (1.0, C.TEAL_DEEP)]).convert("RGB")
    bg = grad

    shot = Image.open(path).convert("RGBA")
    sw, sh = shot.size
    # fit within (area_w - margin, area_h - margin)
    margin = 60
    target_w, target_h = area_w - 2 * margin, area_h - 2 * margin
    scale = min(target_w / sw, target_h / sh)
    new_w, new_h = int(sw * scale), int(sh * scale)
    shot = shot.resize((new_w, new_h), Image.LANCZOS)

    # white-card drop shadow
    shadow = Image.new("RGBA", (new_w + 40, new_h + 40), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([16, 16, new_w + 30, new_h + 30],
                          radius=24, fill=(0, 0, 0, 130))
    from PIL import ImageFilter
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))

    cx = (area_w - new_w) // 2
    cy = (area_h - new_h) // 2
    bg.paste(shadow, (cx - 20, cy - 20), shadow)
    bg.paste(shot, (cx, cy), shot)
    return np.asarray(bg)


def _make_shot_clip(path, area_w, area_h, duration=5.0, kind=0):
    """One slideshow slide built from a review screenshot card."""
    from moviepy import ImageClip, vfx
    arr = _fit_shot_to_card(path, area_w, area_h)
    clip = ImageClip(arr).with_duration(duration).with_fps(30)

    # gentle Ken Burns on the card so it isn't a static slide
    table = [(1.00, 1.06, 0.0, 0.0),
             (1.06, 1.00, 0.0, 0.0),
             (1.03, 1.07, 0.02, 0.0),
             (1.03, 1.07, -0.02, 0.0)]
    z0, z1, panx, pany = table[kind % len(table)]
    dur = duration

    def scale(t):
        k = (t / dur) if dur else 0
        return z0 + (z1 - z0) * U.ease_in_out_cubic(k)

    zoomed = clip.with_effects([vfx.Resize(scale)])

    def pos(t):
        s = scale(t)
        k = (t / dur) if dur else 0
        e = U.ease_in_out_cubic(k)
        return ((area_w - area_w * s) / 2 - panx * area_w * e,
                (area_h - area_h * s) / 2 - pany * area_h * e)
    return zoomed.with_position(pos)


def render_reviews_from_shots(out_path, per_review=5.0, crf=20,
                              shots_dir=None):
    """Build the reviews video from real screenshots of the live cards —
    preserves emojis, images, fonts, stars exactly as users see them."""
    from moviepy import (ImageClip, CompositeVideoClip,
                         concatenate_videoclips, vfx)
    t0 = time.time()
    C.ensure_dirs()
    sd = Path(shots_dir) if shots_dir else SHOTS_DIR
    shots = sorted(sd.glob("*.png"))
    if not shots:
        raise SystemExit(f"no screenshots in {sd}")

    # filter: skip extremely-narrow widgets (< 200 px wide)
    keep = []
    for p in shots:
        try:
            im = Image.open(p)
            if im.size[0] >= 220 and im.size[1] >= 150:
                keep.append(p)
        except Exception:
            continue
    print(f"  {len(keep)}/{len(shots)} screenshots accepted", flush=True)

    pal = {"accent": C.GOLD, "accent_light": C.GOLD_LIGHT, "title": C.WHITE}
    area_w = C.W
    area_h = C.H - TF.TOP_H - TF.BOT_H

    # per-screenshot clips with varied transitions
    cf = 0.5
    clips = []
    for i, p in enumerate(keep):
        clip = _make_shot_clip(p, area_w, area_h, duration=per_review, kind=i)
        canvas = CompositeVideoClip([clip],
                                    size=(area_w, area_h)).with_duration(per_review)
        if i == 0:
            canvas = canvas.with_effects([vfx.CrossFadeIn(0.5)])
        else:
            mode = i % 4
            if mode == 1:
                canvas = canvas.with_effects(
                    [vfx.SlideIn(cf, "left"), vfx.CrossFadeIn(0.3)])
            elif mode == 2:
                canvas = canvas.with_effects(
                    [vfx.SlideIn(cf, "right"), vfx.CrossFadeIn(0.3)])
            elif mode == 3:
                canvas = canvas.with_effects(
                    [vfx.SlideIn(cf, "top"), vfx.CrossFadeIn(0.3)])
            else:
                canvas = canvas.with_effects([vfx.CrossFadeIn(cf)])
        clips.append(canvas)

    body = concatenate_videoclips(clips, method="compose", padding=-cf)
    body_d = body.duration

    intro = _intro_segment(area_w, area_h, pal, duration=3.0)
    outro = _outro_segment(area_w, area_h, pal, duration=3.5)
    image_track = concatenate_videoclips(
        [intro,
         body.with_effects([vfx.CrossFadeIn(0.5)]),
         outro.with_effects([vfx.CrossFadeIn(0.5)])],
        method="compose", padding=-0.5)
    image_track = image_track.with_position((0, TF.TOP_H))
    total = image_track.duration
    print(f"  intro 3s + body {body_d:.1f}s + outro 3.5s = {total:.1f}s total",
          flush=True)

    bg_canvas_arr = np.zeros((C.H, C.W, 3), np.uint8)
    bg_canvas_arr[..., 0], bg_canvas_arr[..., 1], bg_canvas_arr[..., 2] = C.TEAL_DEEP
    bg_canvas = ImageClip(bg_canvas_arr).with_duration(total)

    brand_rgba = TF.build_overlay(palette=pal)
    brand = clip_from_rgba(brand_rgba, total)

    video = CompositeVideoClip(
        [bg_canvas, image_track, brand],
        size=(C.W, C.H)).with_duration(total).with_fps(30)

    music_path = _resolve_music(total)
    music_arr = _load_audio(music_path) if music_path else None
    audio = build_audio(music_arr, total)
    video = video.with_audio(audio)

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    video.write_videofile(
        str(out_path), fps=30, codec="libx264", audio_codec="aac",
        preset="medium", threads=4, logger="bar",
        ffmpeg_params=["-crf", str(crf), "-pix_fmt", "yuv420p"])

    size_mb = out_path.stat().st_size / 1024 / 1024
    print(f"  OK  ->  {out_path}   {size_mb:.1f} MB   "
          f"({time.time() - t0:.0f}s)", flush=True)


# ============================================================ orchestrator
def render_reviews_video(out_path, per_review=5.5, crf=20):
    from moviepy import (ImageClip, CompositeVideoClip,
                         concatenate_videoclips, vfx)
    t0 = time.time()
    C.ensure_dirs()
    reviews = _load_reviews()
    if not reviews:
        raise SystemExit("no reviews found in _reviews/all.json")
    print(f"  {len(reviews)} reviews loaded", flush=True)

    pal = {"accent": C.GOLD, "accent_light": C.GOLD_LIGHT, "title": C.WHITE}
    area_w = C.W
    area_h = C.H - TF.TOP_H - TF.BOT_H

    # build per-review clips with varied transitions
    clips = []
    for i, r in enumerate(reviews):
        clip = _make_review_clip(r, area_w, area_h, pal,
                                 duration=per_review, bg_seed=i)
        if i == 0:
            clip = clip.with_effects([vfx.CrossFadeIn(0.5)])
        else:
            mode = i % 4
            if mode == 1:
                clip = clip.with_effects(
                    [vfx.SlideIn(0.5, "left"), vfx.CrossFadeIn(0.3)])
            elif mode == 2:
                clip = clip.with_effects(
                    [vfx.SlideIn(0.5, "right"), vfx.CrossFadeIn(0.3)])
            elif mode == 3:
                clip = clip.with_effects(
                    [vfx.SlideIn(0.5, "top"), vfx.CrossFadeIn(0.3)])
            else:
                clip = clip.with_effects([vfx.CrossFadeIn(0.5)])
        clips.append(clip)

    body = concatenate_videoclips(clips, method="compose", padding=-0.5)
    body_d = body.duration

    # intro + outro
    intro = _intro_segment(area_w, area_h, pal, duration=3.0)
    outro = _outro_segment(area_w, area_h, pal, duration=3.5)
    image_track = concatenate_videoclips(
        [intro,
         body.with_effects([vfx.CrossFadeIn(0.5)]),
         outro.with_effects([vfx.CrossFadeIn(0.5)])],
        method="compose", padding=-0.5)
    image_track = image_track.with_position((0, TF.TOP_H))
    total = image_track.duration

    print(f"  intro 3s + {len(reviews)} reviews × {per_review}s + outro 3.5s "
          f"= {total:.1f}s total", flush=True)

    # canvas bg + brand overlay
    bg_canvas_arr = np.zeros((C.H, C.W, 3), np.uint8)
    bg_canvas_arr[..., 0], bg_canvas_arr[..., 1], bg_canvas_arr[..., 2] = C.TEAL_DEEP
    bg_canvas = ImageClip(bg_canvas_arr).with_duration(total)

    brand_rgba = TF.build_overlay(palette=pal)
    brand = clip_from_rgba(brand_rgba, total)

    video = CompositeVideoClip([bg_canvas, image_track, brand],
                               size=(C.W, C.H)).with_duration(total).with_fps(30)

    # audio
    music_path = _resolve_music(total)
    music_arr = _load_audio(music_path) if music_path else None
    audio = build_audio(music_arr, total)
    video = video.with_audio(audio)

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    video.write_videofile(
        str(out_path), fps=30, codec="libx264", audio_codec="aac",
        preset="medium", threads=4, logger="bar",
        ffmpeg_params=["-crf", str(crf), "-pix_fmt", "yuv420p"])

    size_mb = out_path.stat().st_size / 1024 / 1024
    print(f"  OK  ->  {out_path}   {size_mb:.1f} MB   "
          f"({time.time() - t0:.0f}s)", flush=True)


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(C.OUT_DIR / "reviews_video.mp4"))
    ap.add_argument("--per-review", type=float, default=5.5)
    ap.add_argument("--crf", type=int, default=20)
    ap.add_argument("--shots", action="store_true",
                    help="build from real review-card screenshots in "
                         "_reviews/shots/ instead of rendered text")
    args = ap.parse_args()
    if args.shots:
        render_reviews_from_shots(args.out, per_review=args.per_review,
                                  crf=args.crf)
    else:
        render_reviews_video(args.out, per_review=args.per_review, crf=args.crf)


if __name__ == "__main__":
    main()
