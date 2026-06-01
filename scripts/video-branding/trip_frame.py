# -*- coding: utf-8 -*-
"""
Clean modern brand overlay for trip videos.

No corner brackets. Just two solid teal bands (top + bottom) with a soft gold
gradient hairline between them and the image area. Top carries the logo and
brand wordmark, bottom carries the website + phone strip and the new
"installments via EasyCash" badge.
"""
from __future__ import annotations

from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw

import config as C
import util as U
import frame as F


TOP_H = 200          # top brand strip height (px)
BOT_H = 300          # bottom info strip height (px)


def IMAGE_AREA():
    """The free vertical band where the slideshow images live."""
    return TOP_H, C.H - BOT_H


@lru_cache(maxsize=2)
def _easycash_badge(width: int):
    """A compact white pill: EasyCash logo + bilingual 'installments' label."""
    h = 70
    img = Image.new("RGBA", (width, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # pill background
    d.rounded_rectangle([0, 0, width - 1, h - 1], radius=h // 2,
                        fill=(238, 238, 232, 245),
                        outline=U.with_alpha(C.GOLD, 200), width=2)

    pad = 12
    # logo
    try:
        logo = Image.open(C.PUBLIC_DIR / "logo-easycash.png").convert("RGBA")
        target_h = h - 16
        ratio = target_h / logo.height
        logo = logo.resize((int(logo.width * ratio), target_h), Image.LANCZOS)
        img.paste(logo, (pad, (h - target_h) // 2), logo)
        text_x = pad + logo.width + 12
    except Exception:
        text_x = pad

    f_main = U.font("sans_bold", 22)             # Arial supports Arabic
    f_sub = U.font("sans", 16)
    d.text((text_x, 14), U.shape_ar("اقسّطها مع EasyCash"), font=f_main,
           fill=(0, 28, 32), anchor="la")
    d.text((text_x, 42), "Installments available", font=f_sub,
           fill=(60, 60, 60), anchor="la")
    return img


def build_overlay(palette=None):
    """Return an RGBA np array (C.H, C.W, 4) — the persistent overlay drawn
    on top of every slideshow frame."""
    pal = palette or {}
    accent = pal.get("accent", C.GOLD)
    accent_l = pal.get("accent_light", C.GOLD_LIGHT)

    w, h = C.W, C.H
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))

    # ---------- TOP STRIP ----------
    top_grad = U.vertical_gradient(w, TOP_H, [
        (0.0, C.TEAL_DEEP), (1.0, C.TEAL_DARK)]).convert("RGBA")
    img.paste(top_grad, (0, 0))

    d = ImageDraw.Draw(img)

    # logo badge (centred)
    D = 116
    cx = w // 2
    cy = 86
    d.ellipse([cx - D // 2 - 3, cy - D // 2 - 3,
               cx + D // 2 + 3, cy + D // 2 + 3],
              fill=C.TEAL_DEEP, outline=accent, width=3)
    inner = D - 14
    logo = F.circular_logo(inner)
    img.paste(logo, (cx - inner // 2, cy - inner // 2), logo)

    # brand wordmark + tagline
    fb = U.font("serif_bold", 26)
    ft = U.font("sans", 16)
    U.draw_tracked(d, 0, 152, C.BRAND, fb, accent_l, 5, anchor_center=cx)
    d.text((cx, 184), "SHARM EL SHEIKH · RED SEA", font=ft,
           fill=U.with_alpha(C.WHITE, 220), anchor="mt")

    # hairline gold gradient below top strip
    yline = TOP_H
    for k in range(3):
        a = int(180 - k * 50)
        d.line([(0, yline + k), (w, yline + k)],
               fill=U.with_alpha(accent, max(0, a)), width=1)

    # ---------- BOTTOM STRIP ----------
    bot_y0 = h - BOT_H
    bot_grad = U.vertical_gradient(w, BOT_H, [
        (0.0, C.TEAL_DARK), (1.0, C.TEAL_DEEP)]).convert("RGBA")
    img.paste(bot_grad, (0, bot_y0))

    # hairline gold gradient above bottom strip
    for k in range(3):
        a = int(180 - k * 50)
        d.line([(0, bot_y0 - 1 - k), (w, bot_y0 - 1 - k)],
               fill=U.with_alpha(accent, max(0, a)), width=1)

    # ----- bottom row 1: website + diamond + phone -----
    row1_y = bot_y0 + 60
    icon_d = 40
    pad_x = 70

    f_txt = U.font("sans", 30)
    globe = F.globe_icon(icon_d, accent)
    img.paste(globe, (pad_x, row1_y - icon_d // 2), globe)
    d.text((pad_x + icon_d + 14, row1_y), C.WEBSITE, font=f_txt,
           fill=C.WHITE, anchor="lm")

    phone = F.phone_icon(icon_d)
    pnum_w = d.textlength(C.PHONE, font=f_txt)
    p_icon_x = w - pad_x - int(pnum_w) - 14 - icon_d
    img.paste(phone, (p_icon_x, row1_y - icon_d // 2), phone)
    d.text((p_icon_x + icon_d + 14, row1_y), C.PHONE, font=f_txt,
           fill=C.WHITE, anchor="lm")

    # gold lotus diamond in the centre
    cxm = w // 2
    d.polygon([(cxm, row1_y - 9), (cxm + 9, row1_y),
               (cxm, row1_y + 9), (cxm - 9, row1_y)], fill=accent)
    d.line([(cxm - 32, row1_y), (cxm - 12, row1_y)],
           fill=U.with_alpha(accent, 150), width=1)
    d.line([(cxm + 12, row1_y), (cxm + 32, row1_y)],
           fill=U.with_alpha(accent, 150), width=1)

    # ----- bottom row 2: EasyCash installment badge -----
    badge_w = 540
    badge = _easycash_badge(badge_w)
    bx = (w - badge_w) // 2
    by = bot_y0 + 150
    img.paste(badge, (bx, by), badge)

    # ----- bottom row 3: subtle brand line -----
    line_y = h - 36
    d.text((cxm, line_y), C.BRAND, font=U.font("serif_bold", 18),
           fill=U.with_alpha(accent_l, 220), anchor="mm")

    return np.asarray(img)
