# -*- coding: utf-8 -*-
"""Time each stage in isolation (no video encode) to find the bottleneck."""
import time, sys
import numpy as np
import config as C, fx, themes as TH, bookends, brand_video as BV

C.ensure_dirs()
theme = TH.get("Coral Dawn")


def timeit(label, fn, n=5):
    t = time.time()
    for i in range(n):
        fn(i)
    dt = (time.time() - t) / n
    print(f"{label:32s} {dt*1000:8.1f} ms/frame", flush=True)
    return dt


print("== particle clips (full res) ==", flush=True)
bok = fx.make_bokeh_clip(3.0, n=22, color=C.GOLD_LIGHT, seed=1)
timeit("bokeh full-res get_frame", lambda i: bok.get_frame(i * 0.1), n=4)

print("== intro composite ==", flush=True)
intro = bookends.intro_clip(2.6, palette=theme["palette"])
timeit("intro get_frame", lambda i: intro.get_frame(i * 0.3), n=4)

print("== body (fast) ==", flush=True)
from moviepy import VideoFileClip
src = VideoFileClip(sys.argv[1]).without_audio().subclipped(0, 2)
body = BV.build_body(src, theme, fast=True)
timeit("body fast get_frame", lambda i: body.get_frame(i * 0.3), n=4)
print("DONE", flush=True)
