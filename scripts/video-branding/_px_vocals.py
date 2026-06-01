"""Download Pixabay vocal/song tracks suited for travel/tourism content."""
import re
import sys
import time
import urllib.parse
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import config as C

from curl_cffi import requests as cffi

# Pixabay queries that tend to surface vocal/song tracks fit for tourism reels
QUERIES = [
    "summer-pop", "upbeat-vocal", "indie-pop", "travel-vlog",
    "happy-vocal", "feel-good-pop", "summer-song", "tropical-vibes",
]
N = int(sys.argv[1]) if len(sys.argv) > 1 else 12
DEST = C.MUSIC_DIR.parent / "vocals_library"
DEST.mkdir(parents=True, exist_ok=True)

PX_TRACK_LINK_RE = re.compile(r"/music/([\w-]+-(\d+))/")
PX_AUDIO_RE = re.compile(
    r"https?://cdn\.pixabay\.com/download/audio/[^\"'<>\s]+\.mp3[^\"'<>\s]*", re.I)
IMPS = ["chrome120", "chrome124", "edge99", "chrome110"]


def fetch(url, attempt=0):
    for k in range(3):
        imp = IMPS[(attempt + k) % len(IMPS)]
        try:
            r = cffi.get(url, impersonate=imp, timeout=60,
                         headers={"Accept": "*/*",
                                  "Referer": "https://pixabay.com/"})
            if r.status_code == 200:
                return r
        except Exception:
            pass
        time.sleep(1.2 * (k + 1))
    raise RuntimeError(f"fetch failed: {url}")


def main():
    pages = []
    seen = set()
    for q in QUERIES:
        if len(pages) >= N: break
        try:
            r = fetch(f"https://pixabay.com/music/search/{q}/")
        except Exception as e:
            print(f"  search '{q}': {e}", flush=True); continue
        before = len(pages)
        for m in PX_TRACK_LINK_RE.finditer(r.text):
            tid = m.group(2)
            if tid in seen: continue
            seen.add(tid)
            pages.append((tid, f"https://pixabay.com/music/{m.group(1)}/"))
            if len(pages) >= N: break
        print(f"  '{q}': +{len(pages)-before}  (total {len(pages)})", flush=True)
        time.sleep(0.8)

    print(f"\n--- collected {len(pages)} tracks; downloading ---", flush=True)
    for i, (tid, page_url) in enumerate(pages, 1):
        try:
            r = fetch(page_url)
            m = PX_AUDIO_RE.search(r.text)
            if not m: raise RuntimeError("no mp3 link")
            direct = m.group(0)
            rr = fetch(direct)
            params = urllib.parse.parse_qs(urllib.parse.urlparse(direct).query)
            name = params.get("filename", [f"px-{tid}.mp3"])[0]
            out = DEST / f"vocal_{i:02d}_{name}"
            out.write_bytes(rr.content)
            print(f"  [{i}/{len(pages)}] {out.name}  ({len(rr.content)/1024/1024:.1f}MB)", flush=True)
        except Exception as e:
            print(f"  [{i}/{len(pages)}] {tid}: {e}", flush=True)
        time.sleep(0.6)
    print(f"\n=== {DEST} ===")


if __name__ == "__main__":
    main()
