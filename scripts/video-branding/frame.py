# -*- coding: utf-8 -*-
"""
Persistent on-video branding: a tasteful logo badge, corner accents and an
animated lower-third (website | brand | phone). Lighter than a heavy frame so
the footage breathes — the intro/outro carry the loud branding.
"""
from __future__ import annotations

from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw

import config as C
import util as U


# --------------------------------------------------------------- art bits
@lru_cache(maxsize=4)
def circular_logo(diameter, ring=True):
    try:
        src = Image.open(C.LOGO).convert("RGBA")
    except Exception:
        src = Image.new("RGBA", (diameter, diameter), C.TEAL + (255,))
    s = min(src.size)
    left = (src.width - s) // 2
    top = max(0, min(int((src.height - s) * 0.42), src.height - s))
    src = src.crop((left, top, left + s, top + s)).resize(
        (diameter, diameter), Image.LANCZOS)
    mask = Image.new("L", (diameter, diameter), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, diameter - 1, diameter - 1], fill=255)
    out = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
    out.paste(src, (0, 0), mask)
    return out


def globe_icon(d, color=C.GOLD):
    img = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    dr.ellipse([1, 1, d - 2, d - 2], outline=color, width=2)
    dr.ellipse([d * 0.32, 1, d * 0.68, d - 2], outline=color, width=1)
    dr.line([1, d / 2, d - 2, d / 2], fill=color, width=1)
    dr.line([d * 0.16, d * 0.28, d * 0.84, d * 0.28], fill=color, width=1)
    dr.line([d * 0.16, d * 0.72, d * 0.84, d * 0.72], fill=color, width=1)
    return img


def phone_icon(d):
    img = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    dr.ellipse([0, 0, d - 1, d - 1], fill=C.WA_GREEN)
    glyph = U.font("symbol", int(d * 0.6))
    try:
        bb = dr.textbbox((0, 0), "☎", font=glyph)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        dr.text(((d - tw) / 2 - bb[0], (d - th) / 2 - bb[1]), "☎",
                font=glyph, fill=C.WHITE)
    except Exception:
        dr.ellipse([d * 0.3, d * 0.3, d * 0.7, d * 0.7], fill=C.WHITE)
    return img


def corner_brackets(draw, w, h, color, inset=40, length=92, t=4):
    g = color
    for (cx, cy, dx, dy) in [(inset, inset, 1, 1),
                              (w - inset, inset, -1, 1),
                              (inset, h - inset, 1, -1),
                              (w - inset, h - inset, -1, -1)]:
        draw.line([(cx, cy), (cx + dx * length, cy)], fill=g, width=t)
        draw.line([(cx, cy), (cx, cy + dy * length)], fill=g, width=t)


# --------------------------------------------------------------- overlay
def branding_overlay(palette=None, layout="full_bleed"):
    """Static RGBA branding overlay (logo badge, brackets, lower-third)."""
    pal = palette or {}
    gold = pal.get("accent", C.GOLD)
    gold_l = pal.get("accent_light", C.GOLD_LIGHT)
    w, h = C.W, C.H
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # thin keyline + corner brackets (subtle)
    if layout == "framed":
        d.rectangle([18, 18, w - 19, h - 19], outline=U.with_alpha(gold, 150), width=3)
        corner_brackets(d, w, h, gold, inset=34, length=110, t=5)
    else:
        corner_brackets(d, w, h, U.with_alpha(gold, 200), inset=46, length=78, t=4)

    # ---- top logo badge ----
    D = 150
    cx, cy = w // 2, 150
    d.ellipse([cx - D // 2 - 4, cy - D // 2 - 4, cx + D // 2 + 4, cy + D // 2 + 4],
              fill=U.with_alpha(C.TEAL_DARK, 235), outline=gold, width=3)
    inner = D - 18
    logo = circular_logo(inner)
    img.paste(logo, (cx - inner // 2, cy - inner // 2), logo)
    d.ellipse([cx - inner // 2, cy - inner // 2, cx + inner // 2, cy + inner // 2],
              outline=U.with_alpha(gold_l, 220), width=2)

    # small brand wordmark under badge
    fb = U.font("serif_bold", 30)
    U.draw_tracked(d, 0, cy + D // 2 + 14, C.BRAND, fb, gold_l, 6, anchor_center=cx)

    # ---- bottom lower-third info bar ----
    pad = 70
    bar_h = 92
    by1 = h - 250
    by2 = by1 + bar_h
    d.rounded_rectangle([pad, by1, w - pad, by2], radius=bar_h // 2,
                        fill=U.with_alpha(C.TEAL_DARK, 215),
                        outline=U.with_alpha(gold, 230), width=2)
    mid = (by1 + by2) // 2
    f_txt = U.font("sans", 30)
    f_brand = U.font("serif_bold", 28)
    icon_d = 40

    g = globe_icon(icon_d, gold)
    gx = pad + 34
    img.paste(g, (gx, mid - icon_d // 2), g)
    web_x = gx + icon_d + 12
    d.text((web_x, mid), C.WEBSITE, font=f_txt, fill=C.WHITE, anchor="lm")
    left_end = web_x + d.textlength(C.WEBSITE, font=f_txt)

    p = phone_icon(icon_d)
    pnum_w = d.textlength(C.PHONE, font=f_txt)
    p_icon_x = w - pad - 34 - icon_d - 12 - int(pnum_w)
    img.paste(p, (p_icon_x, mid - icon_d // 2), p)
    d.text((p_icon_x + icon_d + 12, mid), C.PHONE, font=f_txt, fill=C.WHITE, anchor="lm")
    right_start = p_icon_x

    cx_brand = (left_end + right_start) / 2
    U.draw_tracked(d, 0, by1 + bar_h // 2 - 16, C.BRAND, f_brand, gold_l, 3,
                   anchor_center=cx_brand)

    return np.asarray(img)


def make_branding_clip(duration, palette=None, layout="full_bleed",
                       fade_in=0.6):
    """Animated branding overlay: fades/slides in, with a slow gold light sweep
    travelling across the lower-third bar."""
    from moviepy import ImageClip, VideoClip, CompositeVideoClip, vfx
    from titles import clip_from_rgba

    base = branding_overlay(palette, layout)
    overlay = clip_from_rgba(base, duration).with_effects(
        [vfx.CrossFadeIn(fade_in)])

    # light sweep over the bottom bar
    pal = palette or {}
    sweep_col = np.array(pal.get("accent_light", C.GOLD_LIGHT), np.float32)
    w, h = C.W, C.H
    by1, bar_h = h - 250, 92

    def sweep_frame(t):
        return np.broadcast_to(sweep_col, (h, w, 3)).astype(np.uint8)

    def sweep_mask(t):
        period = 6.0
        cx = ((t % period) / period) * (w + 400) - 200
        xs = np.arange(w)
        line = np.exp(-((xs - cx) ** 2) / (2 * 90 ** 2)) * 0.5
        m = np.zeros((h, w), np.float32)
        m[by1:by1 + bar_h, :] = line[None, :]
        return m

    sweep = (VideoClip(sweep_frame, duration=duration)
             .with_mask(VideoClip(sweep_mask, duration=duration, is_mask=True)))

    return CompositeVideoClip([overlay, sweep], size=(w, h)).with_duration(duration)
