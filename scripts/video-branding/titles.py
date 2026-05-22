# -*- coding: utf-8 -*-
"""
Kinetic typography — animated cinematic titles and lower-thirds.

A title is rendered to a tight RGBA card (full canvas width) and then wrapped in
a style-specific reveal animation (fade-rise, scale-punch, mask-wipe). Themes
pick a style; this keeps the look varied across the 50 videos without bespoke
code per video.
"""
from __future__ import annotations

import numpy as np
from PIL import Image, ImageDraw

import config as C
import util as U


# --------------------------------------------------------------- clip bridge
def clip_from_rgba(rgba, duration):
    """Static RGBA np array -> moviepy ImageClip with alpha mask."""
    from moviepy import ImageClip
    rgb = np.ascontiguousarray(rgba[..., :3])
    alpha = rgba[..., 3].astype(np.float32) / 255.0
    base = ImageClip(rgb).with_duration(duration)
    mask = ImageClip(alpha, is_mask=True).with_duration(duration)
    return base.with_mask(mask)


# --------------------------------------------------------------- card render
def _draw_divider(d, cx, y, half=78, color=C.GOLD):
    d.line([(cx - half, y), (cx - 16, y)], fill=color, width=2)
    d.line([(cx + 16, y), (cx + half, y)], fill=color, width=2)
    d.polygon([(cx, y - 7), (cx + 7, y), (cx, y + 7), (cx - 7, y)], fill=color)


def render_card(title, kicker=None, subtitle=None, palette=None, style="cinematic_serif"):
    """
    Render a title card to a tight RGBA array (C.W wide). Returns (rgba, height).
    `subtitle` may be a plain string or a list of (text, color) segments.
    """
    pal = palette or {}
    accent = pal.get("accent", C.GOLD_LIGHT)
    main_col = pal.get("title", C.WHITE)
    cx = C.W // 2
    margin = 90
    maxw = C.W - 2 * margin

    card_h = 560
    img = Image.new("RGBA", (C.W, card_h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    y = 40

    # kicker (script or condensed depending on style)
    if kicker:
        if style in ("elegant_script", "cinematic_serif", "pastel"):
            fk = U.font("script", 110)
        else:
            fk = U.font("sans_bold", 46)
        d.text((cx, y), kicker, font=fk, fill=accent, anchor="mt")
        y += (118 if "script" in str(fk.path).lower() or style in
              ("elegant_script", "cinematic_serif", "pastel") else 64)

    # main title — auto-fit, letter-spaced serif (or condensed for bold styles)
    fkey = "condensed" if style == "kinetic_bold" else "serif_bold"
    size = 132 if style == "kinetic_bold" else 96
    tracking = lambda s: s * (0.10 if style == "kinetic_bold" else 0.045)
    while size > 40:
        f_main = U.font(fkey, size)
        w = U.tracked_width(d, title, f_main, tracking(size))
        if w <= maxw:
            break
        size -= 3
    U.draw_tracked(d, 0, y, title, f_main, main_col, tracking(size),
                   anchor_center=cx, shadow=(0, 3, (0, 0, 0, 170)))
    y += size + 22

    # divider
    _draw_divider(d, cx, y, color=accent)
    y += 26

    # subtitle — tracked small caps
    if subtitle:
        fs = U.font("serif", 30)
        if isinstance(subtitle, str):
            subtitle = [(subtitle, main_col)]
        # measure total tracked width
        tot = sum(U.tracked_width(d, t, fs, 5) for t, _ in subtitle) + 5 * (len(subtitle) - 1)
        x = cx - tot / 2
        for text, col in subtitle:
            x += U.draw_tracked(d, x, y, text, fs, col, 5) + 5
        y += 44

    # crop tightly
    bbox = img.getbbox()
    if bbox:
        top = max(0, bbox[1] - 10)
        bot = min(card_h, bbox[3] + 10)
        img = img.crop((0, top, C.W, bot))
    return np.asarray(img), img.height


# --------------------------------------------------------------- animators
def _fade_rise(card, duration, start, y, rise=34, fade=0.8):
    from moviepy import vfx
    clip = clip_from_rgba(card, duration - start)
    clip = clip.with_start(start).with_effects(
        [vfx.CrossFadeIn(fade), vfx.CrossFadeOut(0.5)])

    def pos(t):
        e = U.ease_out_cubic(t / fade) if fade else 1
        return (0, y + int((1 - e) * rise))
    return clip.with_position(pos)


def _scale_punch(card, duration, start, y):
    from moviepy import vfx
    h, w = card.shape[:2]
    clip = clip_from_rgba(card, duration - start).with_start(start)
    clip = clip.with_effects([vfx.CrossFadeIn(0.25), vfx.CrossFadeOut(0.45)])
    dur = 0.55

    def scale(t):
        return 1.18 - 0.18 * U.ease_out_back(min(1, t / dur))
    clip = clip.with_effects([vfx.Resize(scale)])

    def pos(t):
        s = scale(t)
        return ((C.W - w * s) / 2, y - (h * s - h) / 2)
    return clip.with_position(pos)


def _mask_wipe(card, duration, start, y, direction="lr"):
    """Reveal the card behind a moving soft edge."""
    from moviepy import ImageClip, VideoClip
    h, w = card.shape[:2]
    rgb = np.ascontiguousarray(card[..., :3])
    base_alpha = card[..., 3].astype(np.float32) / 255.0
    reveal = 0.7

    xx = np.tile(np.linspace(0, 1, w), (h, 1)).astype(np.float32)
    if direction == "rl":
        xx = 1 - xx

    def make_mask(t):
        p = U.ease_out_cubic(min(1, t / reveal))
        edge = np.clip((p * 1.15 - xx) * 8, 0, 1)
        out = base_alpha * edge
        # fade out tail
        if t > (duration - start) - 0.5:
            out = out * U.clamp(((duration - start) - t) / 0.5)
        return out

    rgb_clip = ImageClip(rgb).with_duration(duration - start)
    mask = VideoClip(make_mask, duration=duration - start, is_mask=True)
    return rgb_clip.with_mask(mask).with_start(start).with_position((0, y))


# --------------------------------------------------------------- public
ANIMATORS = {
    "cinematic_serif": lambda card, d, s, y: _fade_rise(card, d, s, y, fade=0.9),
    "elegant_script": lambda card, d, s, y: _fade_rise(card, d, s, y, rise=24, fade=1.0),
    "pastel": lambda card, d, s, y: _fade_rise(card, d, s, y, rise=20, fade=1.0),
    "kinetic_bold": lambda card, d, s, y: _scale_punch(card, d, s, y),
    "split_reveal": lambda card, d, s, y: _mask_wipe(card, d, s, y, "lr"),
    "minimal_lower": lambda card, d, s, y: _mask_wipe(card, d, s, y, "lr"),
}


def make_title(title, duration, *, kicker=None, subtitle=None, palette=None,
               style="cinematic_serif", start=0.6, y_frac=0.66):
    """Build a positioned, animated title clip for the body video."""
    card, ch = render_card(title, kicker, subtitle, palette, style)
    y = int(C.H * y_frac - ch / 2)
    animator = ANIMATORS.get(style, ANIMATORS["cinematic_serif"])
    return animator(card, duration, start, y)
