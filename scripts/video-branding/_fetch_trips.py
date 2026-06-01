"""
Fetch full data + images for all 9 trips from the live API.
Saves to _trip_videos/<slug>/{meta.json, images/*.jpg}.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE / "_trip_videos"
API = "https://lotussharm.com/api/public/trips"


def fetch_json(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (LotusSharmStudio)",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def fetch_bytes(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (LotusSharmStudio)",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def pick_url(media):
    """Best image URL out of a Media object."""
    for k in ("largeUrl", "mediumUrl", "url"):
        v = media.get(k)
        if v: return v
    return None


def normalize_url(u):
    if not u: return None
    if u.startswith(("http://", "https://")): return u
    return urllib.parse.urljoin("https://lotussharm.com", u)


def extract_highlights(html: str, n=4):
    """Pick up to n <li> bullets from a long-description HTML."""
    if not html: return []
    items = re.findall(r"<li[^>]*>(.*?)</li>", html, flags=re.S | re.I)
    out = []
    for it in items:
        txt = re.sub(r"<[^>]+>", "", it).strip()
        txt = re.sub(r"\s+", " ", txt)
        if txt and len(txt) <= 90:
            out.append(txt)
        if len(out) >= n: break
    return out


def fetch_trip(slug):
    print(f"  fetching {slug} …", flush=True)
    d = fetch_json(f"{API}/{slug}")
    trip = d.get("data") if d.get("ok") else d
    # find translations
    trs = {t.get("locale", "").upper(): t for t in trip.get("translations", []) if isinstance(t, dict)}
    ar = trs.get("AR") or {}
    en = trs.get("EN") or {}
    ru = trs.get("RU") or {}
    images = []
    hero = trip.get("heroImage")
    if hero and pick_url(hero):
        images.append(normalize_url(pick_url(hero)))
    for g in trip.get("gallery", []) or []:
        m = g.get("media") if isinstance(g, dict) else None
        if m and pick_url(m):
            u = normalize_url(pick_url(m))
            if u and u not in images:
                images.append(u)
    meta = {
        "slug": slug,
        "category": trip.get("category"),
        "priceLocalEGP": int(trip.get("priceLocalEGP") or 0),
        "priceForeignUSD": int(trip.get("priceForeignUSD") or 0),
        "durationMinutes": int(trip.get("durationMinutes") or 0),
        "meetingPoint": trip.get("meetingPoint") or "",
        "startTime": trip.get("startTime") or "",
        "title": {
            "ar": ar.get("title", ""), "en": en.get("title", ""),
            "ru": ru.get("title", ""),
        },
        "shortDesc": {
            "ar": ar.get("shortDesc", ""), "en": en.get("shortDesc", ""),
            "ru": ru.get("shortDesc", ""),
        },
        "highlights": {
            "ar": extract_highlights(ar.get("longDesc", "")),
            "en": extract_highlights(en.get("longDesc", "")),
            "ru": extract_highlights(ru.get("longDesc", "")),
        },
        "images": images,
    }
    return meta


def download_image(slug, idx, url, out_dir):
    ext = ".jpg"
    for cand in (".jpg", ".jpeg", ".png", ".webp"):
        if cand in url.lower(): ext = cand if cand != ".jpeg" else ".jpg"; break
    out = out_dir / f"{idx:02d}{ext}"
    if out.exists() and out.stat().st_size > 1000:
        return out, "cached"
    try:
        data = fetch_bytes(url)
        out.write_bytes(data)
        return out, f"{len(data)/1024:.0f}KB"
    except Exception as e:
        return None, f"FAIL: {e}"


def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    listing = fetch_json(f"{API}?pageSize=20")
    trips = listing["data"]["items"]
    print(f"found {len(trips)} trips", flush=True)

    metas = []
    for t in trips:
        slug = t["slug"]
        out_dir = ROOT / slug
        (out_dir / "images").mkdir(parents=True, exist_ok=True)
        meta = fetch_trip(slug)
        (out_dir / "meta.json").write_text(
            json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
        metas.append((meta, out_dir))
        time.sleep(0.3)

    # download images in parallel across trips
    jobs = []
    for meta, out_dir in metas:
        for i, url in enumerate(meta["images"]):
            jobs.append((meta["slug"], i, url, out_dir / "images"))
    print(f"\ndownloading {len(jobs)} images …", flush=True)

    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(download_image, *j): j for j in jobs}
        for fut in as_completed(futures):
            slug, idx, _, _ = futures[fut]
            try:
                out, info = fut.result()
                tag = "OK" if out else "FAIL"
                print(f"  [{tag}] {slug}/{idx:02d}  {info}", flush=True)
            except Exception as e:
                print(f"  [FAIL] {slug}/{idx:02d}  {e}", flush=True)

    # final summary
    print("\n=== summary ===")
    for meta, out_dir in metas:
        imgs = list((out_dir / "images").glob("*"))
        title_ar = (meta["title"]["ar"] or "")[:50]
        print(f"  {meta['slug']:35s}  {len(imgs):2d} images  · {title_ar}")


if __name__ == "__main__":
    main()
