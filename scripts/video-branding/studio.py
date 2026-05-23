# -*- coding: utf-8 -*-
"""
Lotus Sharm — Cinematic Auto-Editor (desktop GUI).

A professional control panel that wraps `brand_video.py`:
  * Batch a whole folder (default: E:\\Lottus Sharm Tourism\\new videos).
  * Pick the music source — library folder, synth genre, a local audio file, or
    paste a URL and click Download (the file lands in music_library/).
  * Rotate themes across the batch or force a single one.
  * Live progress, log, safe Stop, persistent settings.

Run:  python studio.py
"""
from __future__ import annotations

import hashlib
import json
import queue
import re
import subprocess
import sys
import threading
import tkinter as tk
import urllib.request
from pathlib import Path
from tkinter import filedialog, ttk

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import config as C                    # noqa: E402
import themes as TH                   # noqa: E402
import music_engine as ME             # noqa: E402

DEFAULT_IN = Path(r"E:\Lottus Sharm Tourism\new videos")
VIDEO_EXTS = (".mp4", ".mov", ".m4v", ".mkv", ".webm", ".avi")
SETTINGS = HERE / "_work" / "studio_settings.json"

# brand-aligned dark palette
BG = "#001216"
PANEL = "#0a2226"
PANEL_HI = "#103338"
ACCENT = "#c9a86a"
ACCENT_L = "#e7cd94"
TEXT = "#eeeee8"
MUTED = "#8aa0a4"


class Studio(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Lotus Sharm — Cinematic Auto-Editor")
        self.geometry("1060x800")
        self.minsize(940, 700)
        self.configure(bg=BG)
        self._try_icon()
        self._style()
        self.q: queue.Queue = queue.Queue()
        self.proc: subprocess.Popen | None = None
        self.stop_flag = False
        self.worker: threading.Thread | None = None
        self._build()
        self._load_settings()
        self.after(100, self._drain)
        self.protocol("WM_DELETE_WINDOW", self._on_close)

    # ------------------------------------------------------------- styling
    def _try_icon(self):
        try:
            from PIL import Image, ImageTk
            img = Image.open(C.LOGO).convert("RGBA").resize((64, 64),
                                                            Image.LANCZOS)
            self._icon = ImageTk.PhotoImage(img)
            self.iconphoto(True, self._icon)
        except Exception:
            pass

    def _style(self):
        s = ttk.Style(self)
        for t in ("clam", "alt", "default"):
            try:
                s.theme_use(t); break
            except Exception:
                continue
        s.configure(".", background=BG, foreground=TEXT,
                    fieldbackground=PANEL, font=("Segoe UI", 10))
        s.configure("TFrame", background=BG)
        s.configure("TLabel", background=BG, foreground=TEXT)
        s.configure("Muted.TLabel", foreground=MUTED)
        s.configure("TLabelframe", background=BG, foreground=ACCENT_L,
                    bordercolor=ACCENT, relief="solid")
        s.configure("TLabelframe.Label", background=BG, foreground=ACCENT_L,
                    font=("Segoe UI", 10, "bold"))
        s.configure("TButton", background=PANEL_HI, foreground=TEXT,
                    bordercolor=ACCENT, padding=(10, 6))
        s.map("TButton",
              background=[("active", ACCENT), ("disabled", "#1c1c1c")],
              foreground=[("active", BG), ("disabled", MUTED)])
        s.configure("Accent.TButton", background=ACCENT, foreground=BG,
                    font=("Segoe UI", 10, "bold"), padding=(16, 9))
        s.map("Accent.TButton", background=[("active", ACCENT_L),
                                            ("disabled", "#444")])
        s.configure("Danger.TButton", background="#7a2c2c", foreground=TEXT)
        s.map("Danger.TButton",
              background=[("active", "#a73a3a"), ("disabled", "#333")])
        s.configure("TEntry", fieldbackground=PANEL, foreground=TEXT,
                    insertcolor=TEXT, bordercolor=ACCENT, padding=4)
        s.configure("TCombobox", fieldbackground=PANEL, foreground=TEXT,
                    background=PANEL, selectbackground=PANEL_HI,
                    selectforeground=TEXT, padding=4)
        s.configure("TCheckbutton", background=BG, foreground=TEXT)
        s.map("TCheckbutton", background=[("active", BG)])
        s.configure("TRadiobutton", background=BG, foreground=TEXT)
        s.map("TRadiobutton", background=[("active", BG)])
        s.configure("Horizontal.TProgressbar", background=ACCENT,
                    troughcolor=PANEL, bordercolor=PANEL, lightcolor=ACCENT,
                    darkcolor=ACCENT)

    # ------------------------------------------------------------- build
    def _build(self):
        hdr = ttk.Frame(self)
        hdr.pack(fill="x", padx=22, pady=(18, 4))
        ttk.Label(hdr, text="LOTUS SHARM",
                  font=("Georgia", 17, "bold"), foreground=ACCENT_L).pack(side="left")
        ttk.Label(hdr, text="   Cinematic Auto-Editor",
                  font=("Georgia", 13), foreground=MUTED).pack(side="left")

        body = ttk.Frame(self)
        body.pack(fill="both", expand=True, padx=22, pady=(4, 16))

        # ---- input ----
        f = ttk.Labelframe(body, text="  Input videos  ", padding=12)
        f.pack(fill="x", pady=6)
        self.var_in = tk.StringVar(value=str(DEFAULT_IN))
        row = ttk.Frame(f); row.pack(fill="x")
        ttk.Label(row, text="Folder").pack(side="left")
        ent = ttk.Entry(row, textvariable=self.var_in)
        ent.pack(side="left", padx=10, fill="x", expand=True)
        ttk.Button(row, text="Browse…", command=self._browse_in).pack(side="left")
        self.lbl_count = ttk.Label(f, text="", style="Muted.TLabel")
        self.lbl_count.pack(anchor="w", pady=(6, 0))
        self.var_in.trace_add("write", lambda *_: self._refresh_count())

        # ---- music ----
        f = ttk.Labelframe(body, text="  Music  ", padding=12)
        f.pack(fill="x", pady=6)
        self.var_music_mode = tk.StringVar(value="library")

        r = ttk.Frame(f); r.pack(fill="x", pady=2)
        ttk.Radiobutton(r, text="Library folder (auto-rotates one track per theme)",
                        variable=self.var_music_mode, value="library").pack(side="left")
        ttk.Button(r, text="Open folder",
                   command=lambda: self._open(C.MUSIC_DIR)).pack(side="left", padx=10)
        self.lbl_lib = ttk.Label(r, text="", style="Muted.TLabel")
        self.lbl_lib.pack(side="left")

        r = ttk.Frame(f); r.pack(fill="x", pady=2)
        ttk.Radiobutton(r, text="Synth genre",
                        variable=self.var_music_mode, value="synth").pack(side="left")
        self.var_genre = tk.StringVar(value="travel")
        ttk.Combobox(r, textvariable=self.var_genre,
                     values=list(ME.GENRES.keys()), width=22,
                     state="readonly").pack(side="left", padx=10)

        r = ttk.Frame(f); r.pack(fill="x", pady=2)
        ttk.Radiobutton(r, text="Audio file",
                        variable=self.var_music_mode, value="file").pack(side="left")
        self.var_file = tk.StringVar()
        ttk.Entry(r, textvariable=self.var_file).pack(
            side="left", padx=10, fill="x", expand=True)
        ttk.Button(r, text="Browse…", command=self._browse_audio).pack(side="left")

        r = ttk.Frame(f); r.pack(fill="x", pady=2)
        ttk.Radiobutton(r, text="URL",
                        variable=self.var_music_mode, value="url").pack(side="left")
        self.var_url = tk.StringVar()
        ttk.Entry(r, textvariable=self.var_url).pack(
            side="left", padx=10, fill="x", expand=True)
        self.btn_dl = ttk.Button(r, text="Download", command=self._download)
        self.btn_dl.pack(side="left")

        # ---- theme + options ----
        row = ttk.Frame(body); row.pack(fill="x", pady=6)

        f = ttk.Labelframe(row, text="  Theme  ", padding=12)
        f.pack(side="left", fill="both", expand=True)
        self.var_theme = tk.StringVar(value="(rotate)")
        names = ["(rotate)"] + [f"{t['index']:02d}  {t['name']}" for t in TH.THEMES]
        ttk.Combobox(f, textvariable=self.var_theme, values=names,
                     state="readonly").pack(fill="x")

        f = ttk.Labelframe(row, text="  Options  ", padding=12)
        f.pack(side="left", fill="both", expand=True, padx=(12, 0))
        self.var_intro = tk.BooleanVar(value=True)
        self.var_outro = tk.BooleanVar(value=True)
        self.var_fast = tk.BooleanVar(value=False)
        ttk.Checkbutton(f, text="Intro", variable=self.var_intro).pack(side="left", padx=4)
        ttk.Checkbutton(f, text="Outro", variable=self.var_outro).pack(side="left", padx=4)
        ttk.Checkbutton(f, text="Fast (preview)", variable=self.var_fast).pack(side="left", padx=8)
        ttk.Label(f, text="Max body (s):").pack(side="left", padx=(12, 4))
        self.var_max = tk.StringVar(value="")
        ttk.Entry(f, textvariable=self.var_max, width=6).pack(side="left")

        # ---- buttons ----
        bar = ttk.Frame(body); bar.pack(fill="x", pady=12)
        self.btn_all = ttk.Button(bar, text="▶  Render Batch",
                                  style="Accent.TButton", command=self._start)
        self.btn_all.pack(side="left")
        self.btn_one = ttk.Button(bar, text="Render first (quick test)",
                                  command=lambda: self._start(only_first=True))
        self.btn_one.pack(side="left", padx=10)
        self.btn_stop = ttk.Button(bar, text="■  Stop", style="Danger.TButton",
                                   state="disabled", command=self._stop)
        self.btn_stop.pack(side="left", padx=4)
        ttk.Button(bar, text="Open output folder",
                   command=lambda: self._open(C.OUT_DIR)).pack(side="right")

        # ---- progress ----
        self.pbar = ttk.Progressbar(body, mode="determinate", maximum=100)
        self.pbar.pack(fill="x", pady=(6, 4))
        self.lbl_status = ttk.Label(body, text="Idle.", style="Muted.TLabel")
        self.lbl_status.pack(anchor="w")

        # ---- log ----
        f = ttk.Labelframe(body, text="  Log  ", padding=8)
        f.pack(fill="both", expand=True, pady=8)
        inner = ttk.Frame(f); inner.pack(fill="both", expand=True)
        self.log = tk.Text(inner, height=14, bg=PANEL, fg=TEXT,
                           insertbackground=TEXT, font=("Consolas", 10),
                           wrap="word", relief="flat", borderwidth=0)
        self.log.pack(side="left", fill="both", expand=True)
        sb = ttk.Scrollbar(inner, command=self.log.yview)
        sb.pack(side="right", fill="y")
        self.log.configure(yscrollcommand=sb.set)
        self.log.tag_configure("err", foreground="#ff9a8a")
        self.log.tag_configure("ok", foreground=ACCENT_L)

        self._refresh_count()

    # ------------------------------------------------------------- helpers
    def _list_videos(self, d: Path):
        return sorted(p for p in d.iterdir()
                      if p.is_file() and p.suffix.lower() in VIDEO_EXTS)

    def _refresh_count(self):
        d = Path(self.var_in.get())
        if d.exists() and d.is_dir():
            self.lbl_count.config(text=f"{len(self._list_videos(d))} videos found.")
        else:
            self.lbl_count.config(text="folder not found.")
        try:
            n = len(C.music_tracks())
        except Exception:
            n = 0
        self.lbl_lib.config(text=f"({n} track{'s' if n != 1 else ''} in library)")

    def _browse_in(self):
        p = filedialog.askdirectory(initialdir=self.var_in.get())
        if p:
            self.var_in.set(p)

    def _browse_audio(self):
        p = filedialog.askopenfilename(
            title="Pick a music track",
            filetypes=[("Audio", "*.mp3 *.wav *.m4a *.aac *.ogg *.flac"),
                       ("All files", "*.*")])
        if p:
            self.var_file.set(p); self.var_music_mode.set("file")

    def _open(self, path: Path):
        try:
            import os
            os.startfile(str(path))   # Windows
        except Exception as e:
            self._log(f"can't open: {e}", "err")

    # ------------------------------------------------------------- url dl
    def _download(self):
        url = self.var_url.get().strip()
        if not url:
            self._log("paste a URL first.", "err"); return
        self._log(f"downloading {url} ...")
        self.btn_dl.state(["disabled"])

        def go():
            try:
                req = urllib.request.Request(url, headers={
                    "User-Agent": "Mozilla/5.0 (LotusSharmStudio)",
                    "Accept": "*/*"})
                with urllib.request.urlopen(req, timeout=60) as r:
                    ct = (r.headers.get("Content-Type") or "").lower()
                    ext = ".mp3"
                    for cand, e in (("wav", ".wav"), ("aac", ".aac"),
                                    ("mp4", ".m4a"), ("ogg", ".ogg"),
                                    ("flac", ".flac"), ("mpeg", ".mp3"),
                                    ("mp3", ".mp3")):
                        if cand in ct:
                            ext = e; break
                    name = "dl_" + hashlib.md5(url.encode()).hexdigest()[:10] + ext
                    out = C.MUSIC_DIR / name
                    out.parent.mkdir(parents=True, exist_ok=True)
                    written = 0
                    with open(out, "wb") as f:
                        while True:
                            chunk = r.read(64 * 1024)
                            if not chunk: break
                            f.write(chunk); written += len(chunk)
                self.q.put(("log", f"saved {written/1024:.0f} KB -> {out}", "ok"))
                self.q.put(("setfile", str(out), None))
            except Exception as e:
                self.q.put(("log", f"download failed: {e}", "err"))
            finally:
                self.q.put(("dl_done", None, None))
        threading.Thread(target=go, daemon=True).start()

    # ------------------------------------------------------------- render
    def _music_args(self):
        m = self.var_music_mode.get()
        if m == "library":
            return ["--music", "library"]
        if m == "synth":
            return ["--music", self.var_genre.get()]
        if m == "file":
            v = self.var_file.get().strip()
            if not v:
                raise ValueError("no audio file picked.")
            return ["--music", v]
        if m == "url":
            v = self.var_file.get().strip()   # set by Download
            if not v:
                raise ValueError("download the URL first (the file path will fill in).")
            return ["--music", v]
        return []

    def _start(self, only_first=False):
        d = Path(self.var_in.get())
        if not d.is_dir():
            self._log("input folder not found.", "err"); return
        files = self._list_videos(d)
        if only_first:
            files = files[:1]
        if not files:
            self._log("no videos to render.", "err"); return
        if self.worker and self.worker.is_alive():
            self._log("already running.", "err"); return
        try:
            self._music_args()      # validate music selection up-front
        except ValueError as e:
            self._log(str(e), "err"); return
        self.stop_flag = False
        self.btn_all.state(["disabled"]); self.btn_one.state(["disabled"])
        self.btn_stop.state(["!disabled"])
        self.pbar["value"] = 0
        self._save_settings()
        self.worker = threading.Thread(target=self._worker, args=(files,), daemon=True)
        self.worker.start()

    def _stop(self):
        self.stop_flag = True
        if self.proc and self.proc.poll() is None:
            try: self.proc.terminate()
            except Exception: pass
        self._log("stopping after the current video…", "err")

    def _worker(self, files):
        rotate = (self.var_theme.get() == "(rotate)")
        chosen_idx = None
        if not rotate:
            try:
                chosen_idx = int(self.var_theme.get().split()[0])
            except Exception:
                chosen_idx = None
        out_dir = C.OUT_DIR
        out_dir.mkdir(parents=True, exist_ok=True)
        total = len(files)
        music_args = self._music_args()

        for i, inp in enumerate(files):
            if self.stop_flag: break
            theme_idx = chosen_idx if chosen_idx is not None else i % len(TH.THEMES)
            theme = TH.THEMES[theme_idx]
            safe = theme["name"].lower().replace(" ", "_")
            out = out_dir / f"{inp.stem}__{theme_idx:02d}_{safe}.mp4"
            self.q.put(("status",
                        f"[{i+1}/{total}] {inp.name}  ->  {theme['name']}", None))
            cmd = [sys.executable, "-u", str(HERE / "brand_video.py"),
                   str(inp), "--theme", str(theme_idx),
                   "--out", str(out)] + music_args
            if self.var_fast.get(): cmd.append("--fast")
            if not self.var_intro.get(): cmd.append("--no-intro")
            if not self.var_outro.get(): cmd.append("--no-outro")
            mx = self.var_max.get().strip()
            if mx:
                try:
                    float(mx); cmd += ["--max", mx]
                except ValueError:
                    pass

            self.q.put(("log", f"$ {' '.join(cmd)}", None))
            try:
                CNW = 0x08000000      # CREATE_NO_WINDOW
                self.proc = subprocess.Popen(
                    cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    encoding="utf-8", errors="replace",
                    creationflags=CNW if sys.platform == "win32" else 0,
                    bufsize=1)
            except Exception as e:
                self.q.put(("log", f"failed to launch: {e}", "err")); continue

            self._pump_proc(i, total)
            rc = self.proc.wait() if self.proc else 1
            tag = "ok" if rc == 0 and out.exists() else "err"
            self.q.put(("log",
                        f"  exit={rc}   {out.name}  ({_size(out)})", tag))
            self.proc = None

        self.q.put(("status",
                    "Done." if not self.stop_flag else "Stopped.", None))
        self.q.put(("done", None, None))

    _PROG = re.compile(r"(\d+)/(\d+)")

    def _pump_proc(self, i, total):
        assert self.proc and self.proc.stdout
        # moviepy progress uses '\r' to overwrite — split on it and process each segment
        for raw in self.proc.stdout:
            for seg in raw.replace("\r", "\n").splitlines():
                seg = seg.rstrip()
                if not seg: continue
                if "frame_index" in seg:
                    m = self._PROG.search(seg)
                    if m:
                        cur, mx = int(m.group(1)), int(m.group(2))
                        if mx:
                            overall = (i + cur / mx) / total * 100
                            self.q.put(("pbar", overall, None))
                    continue
                if "chunk:" in seg or "%|" in seg:
                    continue
                if "Traceback" in seg or "Error" in seg:
                    self.q.put(("log", seg, "err"))
                else:
                    self.q.put(("log", seg, None))

    # ------------------------------------------------------------- queue
    def _drain(self):
        try:
            while True:
                kind, val, tag = self.q.get_nowait()
                if kind == "log":
                    self._log(val, tag)
                elif kind == "status":
                    self.lbl_status.config(text=val)
                elif kind == "pbar":
                    self.pbar["value"] = val
                elif kind == "setfile":
                    self.var_file.set(val); self.var_music_mode.set("file")
                    self._refresh_count()
                elif kind == "dl_done":
                    self.btn_dl.state(["!disabled"])
                elif kind == "done":
                    self.btn_all.state(["!disabled"])
                    self.btn_one.state(["!disabled"])
                    self.btn_stop.state(["disabled"])
                    self.pbar["value"] = 100 if not self.stop_flag else self.pbar["value"]
        except queue.Empty:
            pass
        self.after(100, self._drain)

    def _log(self, s, tag=None):
        self.log.insert("end", s + "\n", tag or "")
        self.log.see("end")

    # ------------------------------------------------------------- settings
    def _save_settings(self):
        try:
            SETTINGS.parent.mkdir(parents=True, exist_ok=True)
            SETTINGS.write_text(json.dumps({
                "in": self.var_in.get(),
                "music_mode": self.var_music_mode.get(),
                "genre": self.var_genre.get(),
                "file": self.var_file.get(),
                "url": self.var_url.get(),
                "theme": self.var_theme.get(),
                "intro": self.var_intro.get(),
                "outro": self.var_outro.get(),
                "fast": self.var_fast.get(),
                "max": self.var_max.get(),
            }, indent=2), encoding="utf-8")
        except Exception:
            pass

    def _load_settings(self):
        if not SETTINGS.exists(): return
        try:
            s = json.loads(SETTINGS.read_text(encoding="utf-8"))
            self.var_in.set(s.get("in", str(DEFAULT_IN)))
            self.var_music_mode.set(s.get("music_mode", "library"))
            self.var_genre.set(s.get("genre", "travel"))
            self.var_file.set(s.get("file", ""))
            self.var_url.set(s.get("url", ""))
            self.var_theme.set(s.get("theme", "(rotate)"))
            self.var_intro.set(s.get("intro", True))
            self.var_outro.set(s.get("outro", True))
            self.var_fast.set(s.get("fast", False))
            self.var_max.set(s.get("max", ""))
        except Exception:
            pass

    def _on_close(self):
        self._save_settings()
        if self.proc and self.proc.poll() is None:
            try: self.proc.terminate()
            except Exception: pass
        self.destroy()


def _size(p: Path):
    try:
        n = p.stat().st_size
        return f"{n/1024/1024:.1f} MB" if n >= 1024 * 1024 else f"{n/1024:.1f} KB"
    except Exception:
        return "?"


if __name__ == "__main__":
    Studio().mainloop()
