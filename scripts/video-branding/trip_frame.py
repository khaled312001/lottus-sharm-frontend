# -*- coding: utf-8 -*-
"""
Premium brand frame for trip videos.

A single persistent overlay drawn on top of every frame:

  ┌──────────────── gold gradient line ────────────────┐
  │  [logo badge]  LOTUS SHARM TRAVEL                  │   top brand strip
  │      SHARM EL SHEIKH · RED SEA                     │
  ├════════════════ gold gradient line ════════════════┤
  │ │                                              │ │
  │ │            (slideshow image area)            │ │   thin gold side
  │ │                                              │ │   gradient rails
  ├════════════════ gold gradient line ════════════════┤
  │   🌐 lotussharm.com   ◆   ☎ +20 109 076 7278       │   bottom info strip
  │       [EasyCash badge — installments]              │   (with EasyCash)
  └──────────────── gold gradient line ────────────────┘
"""
from __future__ import annotations

from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import config as C
import util as U
import frame as F


TOP_H = 300
BOT_H = 360
SIDE_W = 28


def IMAGE_AREA():
    return TOP_H, C.H - BOT_H


# ============================================================ helpers
def _vertical_gradient_rgba(w, h, stops):
    """vertical_gradient + opaque alpha."""
    rgb = U.vertical_gradient(w, h, stops).convert("RGBA")
    return rgb


def _brand_strip(w, h, accent, accent_l, mirror=False):
    """A premium strip with vertical teal gradient, a centred gold radial
    glow and a horizontal sweep highlight — replaces the flat rectangles."""
    # base teal gradient — richer than a flat fill
    if mirror:
        stops = [(0.0, C.TEAL_DARK), (0.45, C.TEAL_DEEP),
                 (0.65, C.TEAL_DEEP), (1.0, (0, 8, 10))]
    else:
        stops = [(0.0, (0, 8, 10)), (0.35, C.TEAL_DEEP),
                 (0.55, C.TEAL_DEEP), (1.0, C.TEAL_DARK)]
    base = U.vertical_gradient(w, h, stops).convert("RGBA")

    # centred gold radial glow (~25% intensity) so the strip "lights up"
    glow = U.radial_gradient(w, h, accent_l, (0, 0, 0),
                             cx=0.5, cy=0.55 if mirror else 0.45,
                             radius=0.65, power=1.4).convert("RGBA")
    glow_arr = np.asarray(glow, np.float32)
    base_arr = np.asarray(base, np.float32)
    # screen blend at ~22% intensity for a soft glow
    blended = base_arr + (glow_arr * 0.22)
    out = np.clip(blended, 0, 255).astype(np.uint8)
    out[..., 3] = 255

    # warm horizontal sweep highlight near the middle (subtle gold sheen)
    sheen = Image.new("L", (w, h), 0)
    dd = ImageDraw.Draw(sheen)
    band_y = int(h * (0.55 if mirror else 0.45))
    for k in range(60):
        a = max(0, 80 - k * 2)
        dd.line([(0, band_y - 30 + k), (w, band_y - 30 + k)], fill=a, width=1)
    sheen_arr = np.asarray(sheen.filter(ImageFilter.GaussianBlur(18)),
                            np.float32)[..., None]
    gold = np.array((*accent_l, 0), np.float32)         # alpha=0 → no touch on A
    sheened = out.astype(np.float32) + (gold * (sheen_arr / 255.0) * 0.18)
    sheened[..., 3] = 255
    return Image.fromarray(np.clip(sheened, 0, 255).astype(np.uint8), "RGBA")


def _gold_hairline(d, x0, y0, x1, y1, accent, accent_l):
    """Three-pixel gold gradient line for premium hairline separators."""
    horizontal = abs(x1 - x0) > abs(y1 - y0)
    if horizontal:
        d.line([(x0, y0), (x1, y0)], fill=U.with_alpha(accent_l, 230), width=1)
        d.line([(x0, y0 + 1), (x1, y0 + 1)], fill=U.with_alpha(accent, 230), width=1)
        d.line([(x0, y0 + 2), (x1, y0 + 2)], fill=U.with_alpha(accent, 80), width=1)
    else:
        d.line([(x0, y0), (x0, y1)], fill=U.with_alpha(accent_l, 230), width=1)
        d.line([(x0 + 1, y0), (x0 + 1, y1)], fill=U.with_alpha(accent, 230), width=1)
        d.line([(x0 + 2, y0), (x0 + 2, y1)], fill=U.with_alpha(accent, 80), width=1)


@lru_cache(maxsize=2)
def _easycash_badge(width: int):
    """White pill with the EasyCash logo + bilingual installment label
    — logo + text CENTERED together inside the pill."""
    h = 96
    img = Image.new("RGBA", (width, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, width - 1, h - 1], radius=h // 2,
                        fill=(245, 245, 240, 250),
                        outline=U.with_alpha(C.GOLD, 230), width=3)

    f_main = U.font("sans_bold", 30)
    f_sub = U.font("sans", 20)
    main_text = U.shape_ar("قسّط مع EasyCash")
    sub_text = "Installments available"
    text_w = max(d.textlength(main_text, font=f_main),
                 d.textlength(sub_text, font=f_sub))

    # try loading the logo
    logo = None
    try:
        logo = Image.open(C.PUBLIC_DIR / "logo-easycash.png").convert("RGBA")
        target_h = h - 26
        ratio = target_h / logo.height
        logo = logo.resize((int(logo.width * ratio), target_h), Image.LANCZOS)
    except Exception:
        logo = None

    gap = 18
    logo_w = logo.width if logo else 0
    total = logo_w + (gap if logo else 0) + text_w
    start_x = max(0, (width - int(total)) // 2)

    if logo:
        img.paste(logo, (start_x, (h - logo.height) // 2), logo)

    text_x = start_x + logo_w + (gap if logo else 0) + int(text_w) // 2
    d.text((text_x, 22), main_text, font=f_main, fill=(0, 28, 32), anchor="mt")
    d.text((text_x, 60), sub_text, font=f_sub, fill=(55, 55, 55), anchor="mt")
    return img


@lru_cache(maxsize=8)
def _lotus_motif(size: int, color):
    """Stylised 5-petal gold lotus ornament — points UP by default.
    Used as decorative corner accent (rotate per corner)."""
    color_rgb = tuple(color)
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx = size // 2
    cy = int(size * 0.68)                            # bloom base, slightly low
    petal_w = max(5, size // 13)
    petal_h = int(size * 0.46)

    # 5 elongated petals fanning upward
    for ang in (-62, -32, 0, 32, 62):
        layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        ld.ellipse(
            [cx - petal_w, cy - petal_h, cx + petal_w, cy + petal_h // 9],
            fill=(*color_rgb, 220),
            outline=(*color_rgb, 255), width=2)
        # subtle highlight ridge along the centre of the petal
        ld.line([(cx, cy - petal_h + 4), (cx, cy - 4)],
                fill=(255, 250, 235, 220), width=1)
        rotated = layer.rotate(-ang, resample=Image.BICUBIC, center=(cx, cy))
        img.alpha_composite(rotated)

    # base bloom: filled circle + soft inner highlight
    d = ImageDraw.Draw(img)
    bud = int(size * 0.08)
    d.ellipse([cx - bud, cy - bud, cx + bud, cy + bud],
              fill=(*color_rgb, 255))
    d.ellipse([cx - bud // 2, cy - bud // 2, cx + bud // 2, cy + bud // 2],
              fill=(255, 248, 230, 240))

    # gentle stem stroke under the bloom
    d.line([(cx, cy + bud), (cx, cy + bud + int(size * 0.10))],
           fill=(*color_rgb, 200), width=2)
    return img


@lru_cache(maxsize=2)
def _scrim_band(w, h, alpha=170):
    """A dark gradient band — placed behind text overlays for legibility."""
    a = np.zeros((h, w, 4), np.uint8)
    a[..., 0], a[..., 1], a[..., 2] = C.TEAL_DEEP
    grad = np.linspace(0, alpha, h, dtype=np.uint8)
    a[..., 3] = grad[:, None]
    return a


# ============================================================ overlay
def build_overlay(palette=None):
    pal = palette or {}
    accent = pal.get("accent", C.GOLD)
    accent_l = pal.get("accent_light", C.GOLD_LIGHT)
    w, h = C.W, C.H
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))

    # ---------- TOP STRIP ----------
    top_grad = _brand_strip(w, TOP_H, accent, accent_l, mirror=False)
    img.paste(top_grad, (0, 0))

    d = ImageDraw.Draw(img)

    # logo badge (bigger)
    D = 180
    cx = w // 2
    cy = 110
    d.ellipse([cx - D // 2 - 5, cy - D // 2 - 5,
               cx + D // 2 + 5, cy + D // 2 + 5],
              fill=C.TEAL_DEEP, outline=accent, width=4)
    inner = D - 18
    logo = F.circular_logo(inner)
    img.paste(logo, (cx - inner // 2, cy - inner // 2), logo)
    # subtle inner gold rim
    d.ellipse([cx - inner // 2, cy - inner // 2,
               cx + inner // 2, cy + inner // 2],
              outline=U.with_alpha(accent_l, 200), width=2)

    # brand wordmark — bigger + tracked, tagline sits inside the top strip
    fb = U.font("serif_bold", 40)
    ft = U.font("sans", 20)
    U.draw_tracked(d, 0, cy + D // 2 + 10, C.BRAND, fb, accent_l, 7,
                   anchor_center=cx)
    d.text((cx, TOP_H - 28), "SHARM EL SHEIKH · RED SEA", font=ft,
           fill=U.with_alpha(C.WHITE, 220), anchor="mt")

    # gold gradient hairline under top strip
    _gold_hairline(d, 0, TOP_H, w, TOP_H, accent, accent_l)

    # ---------- BOTTOM STRIP ----------
    bot_y0 = h - BOT_H
    bot_grad = _brand_strip(w, BOT_H, accent, accent_l, mirror=True)
    img.paste(bot_grad, (0, bot_y0))

    # gold gradient hairline above bottom strip
    _gold_hairline(d, 0, bot_y0 - 3, w, bot_y0 - 3, accent, accent_l)

    # ----- row 1: website + diamond + phone (bigger icons + text) -----
    row1_y = bot_y0 + 88
    icon_d = 56
    pad_x = 70

    f_txt = U.font("sans", 38)
    globe = F.globe_icon(icon_d, accent)
    img.paste(globe, (pad_x, row1_y - icon_d // 2), globe)
    d.text((pad_x + icon_d + 16, row1_y), C.WEBSITE, font=f_txt,
           fill=C.WHITE, anchor="lm")

    phone = F.phone_icon(icon_d)
    pnum_w = d.textlength(C.PHONE, font=f_txt)
    p_icon_x = w - pad_x - int(pnum_w) - 16 - icon_d
    img.paste(phone, (p_icon_x, row1_y - icon_d // 2), phone)
    d.text((p_icon_x + icon_d + 16, row1_y), C.PHONE, font=f_txt,
           fill=C.WHITE, anchor="lm")

    # centre lotus diamond
    cxm = w // 2
    d.polygon([(cxm, row1_y - 12), (cxm + 12, row1_y),
               (cxm, row1_y + 12), (cxm - 12, row1_y)], fill=accent)
    d.line([(cxm - 38, row1_y), (cxm - 16, row1_y)],
           fill=U.with_alpha(accent, 150), width=2)
    d.line([(cxm + 16, row1_y), (cxm + 38, row1_y)],
           fill=U.with_alpha(accent, 150), width=2)

    # ----- row 2: EasyCash badge (larger) -----
    badge_w = 740
    badge = _easycash_badge(badge_w)
    bx = (w - badge_w) // 2
    by = bot_y0 + 200
    img.paste(badge, (bx, by), badge)

    # ----- row 3: tagline (centered) -----
    line_y = h - 36
    d.text((cxm, line_y), C.BRAND, font=U.font("serif_bold", 22),
           fill=U.with_alpha(accent_l, 230), anchor="mm")

    # ---------- 4-CORNER LOTUS ORNAMENTS ----------
    img_y0, img_y1 = TOP_H + 3, bot_y0 - 3
    LM = 130                                          # motif size in px
    margin = 22
    base = _lotus_motif(LM, accent)

    # rotate per corner so each lotus faces INTO the canvas
    m_tl = base.rotate(-135, resample=Image.BICUBIC, expand=False)
    m_tr = base.rotate(135,  resample=Image.BICUBIC, expand=False)
    m_bl = base.rotate(-45,  resample=Image.BICUBIC, expand=False)
    m_br = base.rotate(45,   resample=Image.BICUBIC, expand=False)

    img.paste(m_tl, (margin,            img_y0 + margin), m_tl)
    img.paste(m_tr, (w - LM - margin,   img_y0 + margin), m_tr)
    img.paste(m_bl, (margin,            img_y1 - LM - margin), m_bl)
    img.paste(m_br, (w - LM - margin,   img_y1 - LM - margin), m_br)

    return np.asarray(img)


def build_text_scrim(zone="lower"):
    """Dark gradient scrim drawn under text overlays so they stay legible
    over busy imagery. Returns RGBA np array sized to canvas."""
    w, h = C.W, C.H
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    band_h = 540
    band = _scrim_band(w, band_h, alpha=185)
    band_pil = Image.fromarray(band, "RGBA")
    if zone == "upper":
        img.paste(band_pil, (0, TOP_H + 8))
    elif zone == "lower":
        img.paste(band_pil, (0, C.H - BOT_H - band_h - 8))
    else:                                # centred mid
        img.paste(band_pil, (0, (C.H - band_h) // 2))
    return np.asarray(img)
