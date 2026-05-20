# -*- coding: utf-8 -*-
"""
Enhanced Lotus Sharm Travel branded video for TikTok / tourism:
  - teal+gold frame, gold corner brackets, circular logo badge, info bar
  - animated cinematic title  (Discover / SHARM EL SHEIKH / subtitle)
  - dark gradient scrim for text legibility
  - royalty-free synthesised music (original audio muted)
Renders two versions: upbeat tropical and calm cinematic.
"""
import numpy as np
from PIL import Image, ImageDraw

import make_branded_video as base
import music

# reuse layout / theme from the base module
TEAL, TEAL_DARK = base.TEAL, base.TEAL_DARK
GOLD, GOLD_LIGHT, WHITE = base.GOLD, base.GOLD_LIGHT, base.WHITE
VX, VY, VW, VH, W, H = base.VX, base.VY, base.VW, base.VH, base.W, base.H
font = base.font

SRC        = base.SRC_VIDEO
OVERLAY    = base.OVERLAY_PNG
SCRIM_PNG  = r"E:\work\_scrim.png"
TITLE_PNG  = r"E:\work\_title.png"

TITLE = "SHARM EL SHEIKH"
KICKER = "Discover"
SUBTITLE = [("WHERE ", WHITE), ("DESERT", GOLD_LIGHT),
            (" MEETS THE ", WHITE), ("SEA", GOLD_LIGHT)]


# ----------------------------------------------------------------- helpers
def tracked_chars(draw, segments, tracking):
    chars = [(ch, f, c) for text, f, c in segments for ch in text]
    width = sum(draw.textlength(ch, font=f) for ch, f, _ in chars)
    width += tracking * max(0, len(chars) - 1)
    return chars, width


def draw_tracked(draw, cx, y, segments, tracking, shadow=None):
    chars, width = tracked_chars(draw, segments, tracking)
    x = cx - width / 2
    for ch, f, col in chars:
        if shadow:
            draw.text((x + shadow[0], y + shadow[1]), ch, font=f,
                      fill=shadow[2], anchor="la")
        draw.text((x, y), ch, font=f, fill=col, anchor="la")
        x += draw.textlength(ch, font=f) + tracking


# ----------------------------------------------------------------- scrim
def build_scrim():
    h = 640
    grad = np.zeros((h, VW, 4), dtype=np.uint8)
    grad[:, :, 0] = TEAL_DARK[0]
    grad[:, :, 1] = TEAL_DARK[1]
    grad[:, :, 2] = TEAL_DARK[2]
    a = np.clip(np.linspace(0, 1, h) ** 1.6, 0, 1) * 205
    grad[:, :, 3] = a[:, None].astype(np.uint8)
    Image.fromarray(grad, "RGBA").save(SCRIM_PNG)
    return h


SCRIM_H = build_scrim()
SCRIM_Y = VY + VH - SCRIM_H


# ----------------------------------------------------------------- title
def build_title():
    img = Image.new("RGBA", (VW, 210), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = VW // 2

    # kicker – elegant script
    f_kick = font("FREESCPT.TTF", 76)
    d.text((cx, 2), KICKER, font=f_kick, fill=GOLD_LIGHT, anchor="mt")

    # main title – auto-fit serif, letter-spaced, with soft shadow
    size = 60
    while size > 28:
        f_main = font("georgiab.ttf", size)
        _, w = tracked_chars(d, [(TITLE, f_main, WHITE)], size * 0.05)
        if w <= VW - 30:
            break
        size -= 2
    draw_tracked(d, cx, 74, [(TITLE, f_main, WHITE)], size * 0.05,
                 shadow=(0, 2, (0, 0, 0, 150)))

    # divider with small gold lotus diamond
    yd = 74 + size + 14
    d.line([(cx - 78, yd), (cx - 14, yd)], fill=GOLD, width=1)
    d.line([(cx + 14, yd), (cx + 78, yd)], fill=GOLD, width=1)
    d.polygon([(cx, yd - 6), (cx + 6, yd), (cx, yd + 6), (cx - 6, yd)], fill=GOLD)

    # subtitle – tracked
    f_sub = font("georgia.ttf", 17)
    subsegs = [(t, f_sub, c) for t, c in SUBTITLE]
    draw_tracked(d, cx, yd + 16, subsegs, 4)

    img.save(TITLE_PNG)
    # tight visual bottom for positioning
    return yd + 16 + 22


TITLE_BOTTOM = build_title()
TITLE_Y = (VY + VH - 46) - TITLE_BOTTOM     # so title sits in lower third
TITLE_X = VX


# ----------------------------------------------------------------- render
def render(music_wav, out_path):
    from moviepy import (VideoFileClip, ImageClip, CompositeVideoClip,
                         AudioFileClip, vfx)

    video = VideoFileClip(SRC).without_audio()
    dur = video.duration

    frame = ImageClip(OVERLAY).with_duration(dur)
    scrim = ImageClip(SCRIM_PNG).with_duration(dur).with_position((VX, SCRIM_Y))
    title = (ImageClip(TITLE_PNG).with_duration(dur - 0.5).with_start(0.5)
             .with_position(lambda t: (TITLE_X,
                                       TITLE_Y + int(max(0, 1 - t / 0.8) * 22)))
             .with_effects([vfx.CrossFadeIn(0.8)]))

    comp = CompositeVideoClip(
        [video.with_position((VX, VY)), scrim, title, frame],
        size=(W, H), bg_color=TEAL,
    ).with_effects([vfx.FadeIn(0.3)])

    comp = comp.with_audio(AudioFileClip(music_wav).with_duration(dur))
    comp.write_videofile(out_path, fps=video.fps, codec="libx264",
                         audio_codec="aac", preset="medium", threads=4,
                         logger=None)
    video.close()
    comp.close()
    print("rendered ->", out_path)


if __name__ == "__main__":
    print("building frame overlay ...")
    base.build_overlay()

    dur = 6.68
    music.tropical(dur, music.__dict__.get("_t", r"E:\work\_music_tropical.wav"))
    music.cinematic(dur, r"E:\work\_music_cinematic.wav")

    render(r"E:\work\_music_tropical.wav",
           r"C:\Users\MATRIX\Downloads\lotus_sharm_tropical.mp4")
    render(r"E:\work\_music_cinematic.wav",
           r"C:\Users\MATRIX\Downloads\lotus_sharm_cinematic.mp4")
    print("ALL DONE")
