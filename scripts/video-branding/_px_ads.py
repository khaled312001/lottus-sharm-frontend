"""Pixabay tourism-advertising / commercial-vlog vocal tracks."""
import re, sys, time, urllib.parse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import config as C
from curl_cffi import requests as cffi
N = int(sys.argv[1]) if len(sys.argv) > 1 else 18
DEST = C.MUSIC_DIR.parent / "ad_library"; DEST.mkdir(parents=True, exist_ok=True)
QUERIES = ["travel-advert", "cinematic-vlog", "uplifting-corporate", "summer-pop",
           "tourism-promo", "background-pop", "vlog-music", "fashion-pop",
           "happy-uplifting", "feel-good-pop"]
LINK = re.compile(r"/music/([\w-]+-(\d+))/")
AUDIO = re.compile(r"https?://cdn\.pixabay\.com/download/audio/[^\"'<>\s]+\.mp3[^\"'<>\s]*", re.I)
IMP = ["chrome120","chrome124","edge99"]
def get(u,k=0):
    for i in range(3):
        try:
            r = cffi.get(u, impersonate=IMP[(k+i)%len(IMP)], timeout=60,
                         headers={"Referer":"https://pixabay.com/","Accept":"*/*"})
            if r.status_code==200: return r
        except: pass
        time.sleep(1.2*(i+1))
    raise RuntimeError(u)
pages=[]; seen=set()
for q in QUERIES:
    if len(pages)>=N: break
    try: r=get(f"https://pixabay.com/music/search/{q}/")
    except Exception as e: print(f"  '{q}': {e}",flush=True); continue
    b=len(pages)
    for m in LINK.finditer(r.text):
        if m.group(2) in seen: continue
        seen.add(m.group(2)); pages.append(f"https://pixabay.com/music/{m.group(1)}/")
        if len(pages)>=N: break
    print(f"  '{q}': +{len(pages)-b} (total {len(pages)})",flush=True); time.sleep(0.8)
print(f"\ndownloading {len(pages)} tracks",flush=True)
for i,u in enumerate(pages,1):
    try:
        r=get(u); m=AUDIO.search(r.text)
        if not m: raise RuntimeError("no mp3")
        rr=get(m.group(0))
        params=urllib.parse.parse_qs(urllib.parse.urlparse(m.group(0)).query)
        name=params.get("filename",[f"ad-{i}.mp3"])[0]
        out=DEST/f"ad_{i:02d}_{name}"; out.write_bytes(rr.content)
        print(f"  [{i}/{len(pages)}] {out.name} ({len(rr.content)/1024/1024:.1f}MB)",flush=True)
    except Exception as e: print(f"  [{i}] FAIL {e}",flush=True)
    time.sleep(0.6)
print(f"\n=== done, {DEST} ===")
