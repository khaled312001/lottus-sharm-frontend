# -*- coding: utf-8 -*-
"""
Fixed cinematic intro & outro — identical across all 50 videos so the channel
gets a recognisable signature. Both carry the logo, brand, website and phone.

Intro  (~2.6s): dark teal stage, logo pulses in with a gold ring, brand wordmark
                wipes on, tagline fades, then hands off to the footage.
Outro  (~3.4s): logo settles, a "Book your trip" CTA, big website + phone, social
                line, framed in gold.
"""
from __future__ import annotations

import numpy as np
from PIL import Image, ImageDraw

import config as C
import util as U
import fx
import frame as F
from titles import clip_from_rgba


# --------------------------------------------------------------- background
def _stage_bg(duration, palette, seed=0, glow=C.GOLD):
    from moviepy import ImageClip, CompositeVideoClip
    grad = U.vertical_gradient(C.W, C.H, [
        (0.0, C.TEAL_DEEP), (0.45, C.TEAL), (0.55, C.TEAL),
        (1.0, C.TEAL_DEEP)])
    rad = U.radial_gradient(C.W, C.H, glow, (0, 0, 0), cy=0.42,
                            radius=0.7, power=1.6)
    bg = Image.blend(grad.convert("RGB"), rad.convert("RGB"), 0.22)
    bg_clip = ImageClip(np.asarray(bg)).with_duration(duration)

    bokeh = fx.make_bokeh_clip(duration, n=22, color=palette.get(
        "accent_light", C.GOLD_LIGHT), seed=seed).with_opacity(0.5)
    vig = clip_from_rgba(fx.vignette_overlay(strength=0.6), duration)

    comp = CompositeVideoClip([bg_clip, bokeh, vig], size=(C.W, C.H))
    return comp.with_duration(duration)


# --------------------------------------------------------------- logo reveal
def _logo_reveal(duration, palette, start=0.1, cy_frac=0.40, big=300):
    """Logo badge that scales/fades in with an expanding gold ring."""
    from moviepy import VideoClip, vfx, CompositeVideoClip
    accent = palette.get("accent", C.GOLD)
    accent_l = palette.get("accent_light", C.GOLD_LIGHT)
    cx, cy = C.W // 2, int(C.H * cy_frac)

    logo = F.circular_logo(big)
    badge = Image.new("RGBA", (C.W, C.H), (0, 0, 0, 0))
    dd = ImageDraw.Draw(badge)
    dd.ellipse([cx - big // 2 - 8, cy - big // 2 - 8,
                cx + big // 2 + 8, cy + big // 2 + 8],
               fill=U.with_alpha(C.TEAL_DARK, 255), outline=accent, width=5)
    badge.paste(logo, (cx - big // 2, cy - big // 2), logo)
    dd.ellipse([cx - big // 2, cy - big // 2, cx + big // 2, cy + big // 2],
               outline=U.with_alpha(accent_l, 230), width=3)

    badge_clip = clip_from_rgba(np.asarray(badge), duration - start).with_start(start)
    badge_clip = badge_clip.with_effects([vfx.CrossFadeIn(0.5)])

    def scale(t):
        return 0.82 + 0.18 * U.ease_out_back(min(1, t / 0.7))
    badge_clip = badge_clip.with_effects([vfx.Resize(scale)])
    badge_clip = badge_clip.with_position(
        lambda t: ((C.W - C.W * scale(t)) / 2, (C.H - C.H * scale(t)) / 2))

    # expanding ring pulse
    def ring_frame(t):
        return np.broadcast_to(np.array(accent_l, np.uint8), (C.H, C.W, 3)).copy()

    def ring_mask(t):
        p = U.ease_out_cubic(min(1, t / 1.0))
        R = int(big * (0.55 + 0.7 * p))
        img = Image.new("L", (C.W, C.H), 0)
        a = int(200 * (1 - p))
        if a > 2:
            ImageDraw.Draw(img).ellipse(
                [cx - R, cy - R, cx + R, cy + R], outline=a, width=4)
        return np.asarray(img, np.float32) / 255.0

    ring = (VideoClip(ring_frame, duration=duration - start)
            .with_mask(VideoClip(ring_mask, duration=duration - start, is_mask=True))
            .with_start(start))

    return CompositeVideoClip([ring, badge_clip], size=(C.W, C.H)).with_duration(duration)


def _wordmark_card(lines, palette):
    """Render stacked brand text lines centred, return tight RGBA + height."""
    accent_l = palette.get("accent_light", C.GOLD_LIGHT)
    img = Image.new("RGBA", (C.W, 420), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = C.W // 2
    y = 10
    for text, key, size, col, track in lines:
        f = U.font(key, size)
        U.draw_tracked(d, 0, y, text, f, col, track, anchor_center=cx,
                       shadow=(0, 2, (0, 0, 0, 140)))
        y += size + 20
    bbox = img.getbbox()
    if bbox:
        img = img.crop((0, max(0, bbox[1] - 6), C.W, min(420, bbox[3] + 6)))
    return np.asarray(img), img.height


# --------------------------------------------------------------- intro
def intro_clip(duration=2.6, palette=None):
    from moviepy import CompositeVideoClip, vfx
    pal = palette or {}
    accent_l = pal.get("accent_light", C.GOLD_LIGHT)

    bg = _stage_bg(duration, pal, seed=7, glow=pal.get("accent", C.GOLD))
    logo = _logo_reveal(duration, pal, cy_frac=0.40, big=300)

    card, ch = _wordmark_card([
        (C.BRAND, "serif_bold", 70, C.WHITE, 8),
        (C.TAGLINE, "serif", 30, accent_l, 6),
    ], pal)
    y = int(C.H * 0.66 - ch / 2)
    word = clip_from_rgba(card, duration - 0.9).with_start(0.9)
    word = word.with_effects([vfx.CrossFadeIn(0.7), vfx.CrossFadeOut(0.4)])
    word = word.with_position(lambda t: (0, y + int((1 - U.ease_out_cubic(min(1, t / 0.7))) * 26)))

    comp = CompositeVideoClip([bg, logo, word], size=(C.W, C.H))
    comp = comp.with_effects([vfx.FadeIn(0.3)])      # crossfades into body
    return comp.with_duration(duration)


# --------------------------------------------------------------- outro
def outro_clip(duration=3.4, palette=None):
    from moviepy import CompositeVideoClip, vfx, ImageClip
    pal = palette or {}
    accent = pal.get("accent", C.GOLD)
    accent_l = pal.get("accent_light", C.GOLD_LIGHT)

    bg = _stage_bg(duration, pal, seed=13, glow=accent)
    logo = _logo_reveal(duration, pal, cy_frac=0.34, big=240)

    # gold frame
    fr = Image.new("RGBA", (C.W, C.H), (0, 0, 0, 0))
    dfr = ImageDraw.Draw(fr)
    dfr.rectangle([40, 40, C.W - 41, C.H - 41], outline=U.with_alpha(accent, 220), width=3)
    F.corner_brackets(dfr, C.W, C.H, accent_l, inset=58, length=120, t=5)
    frame_clip = clip_from_rgba(np.asarray(fr), duration).with_effects([vfx.CrossFadeIn(0.5)])

    # CTA + contact block
    card, ch = _wordmark_card([
        ("BOOK YOUR TRIP TODAY", "serif_bold", 52, C.WHITE, 4),
        (C.WEBSITE, "sans_bold", 46, accent_l, 2),
        (C.PHONE, "sans", 40, C.WHITE, 1),
        ("Facebook · Instagram · TikTok · YouTube", "sans", 26, accent_l, 1),
    ], pal)
    y = int(C.H * 0.60 - ch / 2)
    block = clip_from_rgba(card, duration - 0.8).with_start(0.8)
    block = block.with_effects([vfx.CrossFadeIn(0.7)])
    block = block.with_position(lambda t: (0, y + int((1 - U.ease_out_cubic(min(1, t / 0.7))) * 24)))

    comp = CompositeVideoClip([bg, frame_clip, logo, block], size=(C.W, C.H))
    comp = comp.with_effects([vfx.FadeOut(0.5)])     # crossfaded in from body
    return comp.with_duration(duration)
