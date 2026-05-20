# -*- coding: utf-8 -*-
"""
Brand a video with the "Lotus Sharm Travel" theme:
  - dark teal frame around the video
  - gold corner brackets
  - circular logo badge at the top
  - bottom info bar: website | brand | phone
Audio from the source video is preserved.
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ---------------------------------------------------------------- paths
SRC_VIDEO  = r"C:\Users\MATRIX\Downloads\WhatsApp Video 2026-05-20 at 9.52.08 PM.mp4"
LOGO       = r"E:\work\lottus-sharm-frontend\public\logo.jpg"
OUT_VIDEO  = r"C:\Users\MATRIX\Downloads\lotus_branded_video.mp4"
OVERLAY_PNG = r"E:\work\_overlay.png"
PREVIEW_PNG = r"E:\work\_preview.png"

# ---------------------------------------------------------------- theme
TEAL       = (0, 49, 54)
TEAL_DARK  = (0, 30, 34)
TEAL_LIGHT = (6, 66, 68)
GOLD       = (201, 168, 106)
GOLD_LIGHT = (227, 200, 142)
WHITE      = (238, 238, 232)
WA_GREEN   = (37, 211, 102)

WEBSITE = "lotussharm.com"
BRAND   = "LOTUS SHARM TRAVEL"
PHONE   = "+20 109 076 7278"

# ---------------------------------------------------------------- layout
VW, VH      = 576, 1024          # native video size (kept, no upscaling)
SIDE        = 42
TOP_BAND    = 182
BOT_BAND    = 132
VX          = SIDE
VY          = TOP_BAND
W           = VW + 2 * SIDE                 # 660
H           = VY + VH + BOT_BAND            # 1338
RADIUS      = 16                            # video window corner radius


def font(name, size):
    for p in (rf"C:\Windows\Fonts\{name}", name):
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()


def vertical_gradient(w, h, top, mid, bot):
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / (h - 1)
        if t < 0.5:
            k = t / 0.5
            c = tuple(int(top[i] + (mid[i] - top[i]) * k) for i in range(3))
        else:
            k = (t - 0.5) / 0.5
            c = tuple(int(mid[i] + (bot[i] - mid[i]) * k) for i in range(3))
        for x in range(w):
            px[x, y] = c
    return img


def circular_logo(diameter):
    """Crop logo to a centered circle for the badge."""
    src = Image.open(LOGO).convert("RGB")
    s = min(src.size)
    left = (src.width - s) // 2
    top = int((src.height - s) * 0.42)          # bias up to center the lotus
    top = max(0, min(top, src.height - s))
    src = src.crop((left, top, left + s, top + s)).resize(
        (diameter, diameter), Image.LANCZOS)
    mask = Image.new("L", (diameter, diameter), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, diameter - 1, diameter - 1], fill=255)
    out = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
    out.paste(src, (0, 0), mask)
    return out


def corner_brackets(draw, inset=18, length=66, t=4):
    g = GOLD
    # top-left
    draw.line([(inset, inset), (inset + length, inset)], fill=g, width=t)
    draw.line([(inset, inset), (inset, inset + length)], fill=g, width=t)
    # top-right
    draw.line([(W - inset, inset), (W - inset - length, inset)], fill=g, width=t)
    draw.line([(W - inset, inset), (W - inset, inset + length)], fill=g, width=t)
    # bottom-left
    draw.line([(inset, H - inset), (inset + length, H - inset)], fill=g, width=t)
    draw.line([(inset, H - inset), (inset, H - inset - length)], fill=g, width=t)
    # bottom-right
    draw.line([(W - inset, H - inset), (W - inset - length, H - inset)], fill=g, width=t)
    draw.line([(W - inset, H - inset), (W - inset, H - inset - length)], fill=g, width=t)


def globe_icon(d):
    img = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    dr.ellipse([1, 1, d - 2, d - 2], outline=GOLD, width=2)
    dr.ellipse([d * 0.32, 1, d * 0.68, d - 2], outline=GOLD, width=1)   # meridian
    dr.line([1, d / 2, d - 2, d / 2], fill=GOLD, width=1)               # equator
    dr.line([d * 0.16, d * 0.28, d * 0.84, d * 0.28], fill=GOLD, width=1)
    dr.line([d * 0.16, d * 0.72, d * 0.84, d * 0.72], fill=GOLD, width=1)
    return img


def phone_icon(d):
    img = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    dr.ellipse([0, 0, d - 1, d - 1], fill=WA_GREEN)
    glyph = font("seguisym.ttf", int(d * 0.62))
    ch = "☎"  # telephone
    try:
        bb = dr.textbbox((0, 0), ch, font=glyph)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        dr.text(((d - tw) / 2 - bb[0], (d - th) / 2 - bb[1]), ch,
                font=glyph, fill=WHITE)
    except Exception:
        dr.ellipse([d * 0.3, d * 0.3, d * 0.7, d * 0.7], fill=WHITE)
    return img


def build_overlay():
    bg = vertical_gradient(W, H, TEAL_DARK, TEAL, TEAL_DARK).convert("RGBA")
    img = bg
    draw = ImageDraw.Draw(img)

    # outer thin gold frame line
    draw.rectangle([8, 8, W - 9, H - 9], outline=GOLD, width=2)
    corner_brackets(draw)

    # ---- top logo badge ----
    D = 158
    cx, cy = W // 2, TOP_BAND // 2 + 4
    bx0, by0 = cx - D // 2, cy - D // 2
    draw.ellipse([bx0 - 3, by0 - 3, bx0 + D + 2, by0 + D + 2],
                 fill=TEAL_DARK, outline=GOLD, width=3)
    inner = D - 16
    logo = circular_logo(inner)
    img.paste(logo, (cx - inner // 2, cy - inner // 2), logo)
    draw.ellipse([cx - inner // 2, cy - inner // 2,
                  cx + inner // 2, cy + inner // 2], outline=GOLD, width=1)

    # ---- bottom info bar ----
    pad = 30
    bar_h = 78
    by1 = VY + VH + (BOT_BAND - bar_h) // 2
    by2 = by1 + bar_h
    draw.rounded_rectangle([pad, by1, W - pad, by2], radius=bar_h // 2,
                           fill=TEAL_DARK, outline=GOLD, width=2)
    mid_y = (by1 + by2) // 2

    f_small = font("arial.ttf", 16)
    f_brand = font("georgiab.ttf", 16)
    icon_d = 26

    # left: globe + website
    g = globe_icon(icon_d)
    gx = pad + 18
    img.paste(g, (gx, mid_y - icon_d // 2), g)
    web_x = gx + icon_d + 8
    draw.text((web_x, mid_y), WEBSITE, font=f_small, fill=WHITE, anchor="lm")
    left_end = web_x + draw.textlength(WEBSITE, font=f_small)

    # right: phone + number (right-aligned)
    p = phone_icon(icon_d)
    pnum_w = draw.textlength(PHONE, font=f_small)
    p_icon_x = W - pad - 18 - icon_d - 8 - int(pnum_w)
    img.paste(p, (p_icon_x, mid_y - icon_d // 2), p)
    draw.text((p_icon_x + icon_d + 8, mid_y), PHONE, font=f_small, fill=WHITE,
              anchor="lm")
    right_start = p_icon_x

    # center: brand, centred in the space between the side blocks
    cx_brand = (left_end + right_start) / 2
    draw.text((cx_brand, mid_y), BRAND, font=f_brand, fill=GOLD_LIGHT, anchor="mm")
    brand_w = draw.textlength(BRAND, font=f_brand)

    # thin gold dividers between sections
    for dx in ((left_end + (cx_brand - brand_w / 2)) / 2,
               ((cx_brand + brand_w / 2) + right_start) / 2):
        draw.line([(dx, mid_y - 12), (dx, mid_y + 12)], fill=GOLD, width=1)

    # ---- cut transparent rounded window for the video ----
    alpha = Image.new("L", (W, H), 255)
    ImageDraw.Draw(alpha).rounded_rectangle(
        [VX, VY, VX + VW - 1, VY + VH - 1], radius=RADIUS, fill=0)
    img.putalpha(alpha)

    img.save(OVERLAY_PNG)
    return img


def composite_video():
    from moviepy import VideoFileClip, ImageClip, CompositeVideoClip

    video = VideoFileClip(SRC_VIDEO)
    overlay = ImageClip(OVERLAY_PNG).with_duration(video.duration)

    comp = CompositeVideoClip(
        [video.with_position((VX, VY)), overlay.with_position((0, 0))],
        size=(W, H), bg_color=TEAL,
    )

    # quick still preview before the full render
    comp.save_frame(PREVIEW_PNG, t=min(1.0, video.duration / 2))
    print("preview saved ->", PREVIEW_PNG)

    comp.write_videofile(
        OUT_VIDEO, fps=video.fps, codec="libx264", audio_codec="aac",
        preset="medium", threads=4,
    )
    video.close()
    comp.close()


if __name__ == "__main__":
    print("building overlay ...")
    build_overlay()
    print("overlay ->", OVERLAY_PNG, f"({W}x{H})")
    composite_video()
    print("done ->", OUT_VIDEO)
