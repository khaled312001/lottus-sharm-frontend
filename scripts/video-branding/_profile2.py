# -*- coding: utf-8 -*-
"""Drill into body sub-stage costs."""
import time, sys
import numpy as np
from moviepy import VideoFileClip
from PIL import Image
import config as C, colorgrade, fx, frame as F, titles, themes as TH

theme = TH.get("Coral Dawn"); pal = theme["palette"]
grade = colorgrade.get(theme["grade"])
src = VideoFileClip(sys.argv[1]).without_audio().subclipped(0, 2)
fr = src.get_frame(0.5)
fr = np.asarray(Image.fromarray(fr).resize((C.W, C.H)))


def t(label, fn, n=8):
    fn(0)
    s = time.time()
    for i in range(n): fn(i)
    print(f"{label:28s} {(time.time()-s)/n*1000:7.1f} ms", flush=True)


t("colorgrade.apply", lambda i: colorgrade.apply(fr, grade))
t("sharpen", lambda i: fx.sharpen(0.35)(fr))
t("grain", lambda i: fx.grain(0.04)(fr))
t("bloom", lambda i: fx.bloom()(fr))

dur = 2.0
brand = F.make_branding_clip(dur, palette=pal, layout=theme["layout"])
t("branding get_frame", lambda i: brand.get_frame(i*0.2), n=6)

title = titles.make_title("SHARM EL SHEIKH", dur, kicker="Discover",
                          subtitle="WHERE DESERT MEETS THE SEA", palette=pal,
                          style=theme["style"])
t("title get_frame", lambda i: title.get_frame(0.5+i*0.1), n=6)
print("DONE", flush=True)
