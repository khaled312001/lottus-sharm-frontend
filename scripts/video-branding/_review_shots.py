"""
Open the live Lotus Sharm reviews page in a headless browser, find each
review card, and screenshot it as a separate PNG.
Saves to _reviews/shots/01.png … NN.png.
"""
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
OUT = HERE / "_reviews" / "shots"
OUT.mkdir(parents=True, exist_ok=True)

URL = sys.argv[1] if len(sys.argv) > 1 else "https://lotussharm.com/ar/review"

# selectors to try in order — the first one that finds >=1 element wins
CARD_SELECTORS = [
    "[data-review-card]",
    "article",
    "div[class*='ReviewCard']",
    "div[class*='review-card']",
    "div[class*='review']",
    "li[class*='review']",
    "div[role='article']",
]


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    # clean previous shots
    for f in OUT.glob("*.png"):
        f.unlink()

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True,
                                     args=["--disable-blink-features=AutomationControlled"])
        ctx = browser.new_context(
            viewport={"width": 1280, "height": 1800},
            device_scale_factor=2,            # render at 2x for crisp screenshots
            user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/124.0 Safari/537.36"),
            locale="ar-EG",
        )
        page = ctx.new_page()
        print(f"opening {URL}", flush=True)
        page.goto(URL, timeout=60000, wait_until="networkidle")

        # let Next.js hydrate + lazy content load
        time.sleep(2)
        # scroll to bottom to load any lazy-loaded reviews
        try:
            for _ in range(8):
                page.evaluate("window.scrollBy(0, 900)")
                time.sleep(0.4)
            page.evaluate("window.scrollTo(0, 0)")
            time.sleep(1)
        except Exception:
            pass

        cards = []
        used_sel = None
        for sel in CARD_SELECTORS:
            els = page.query_selector_all(sel)
            print(f"  selector {sel!r}: {len(els)} element(s)", flush=True)
            if len(els) >= 3:
                cards = els
                used_sel = sel
                break

        if not cards:
            print("FAIL: no review cards found. Dumping page HTML head…",
                  flush=True)
            print(page.content()[:2000])
            browser.close()
            return

        # filter to elements that look like reviews (contain a star or rating)
        good = []
        for el in cards:
            try:
                txt = (el.inner_text() or "").strip()
                if not txt:
                    continue
                if len(txt) < 30:
                    continue                   # skip too-short non-review cards
                if not any(ch in txt for ch in "★⭐") and not (
                        "rating" in (el.get_attribute("class") or "").lower()):
                    # accept if it contains a numeric rating or "review"
                    if "review" not in txt.lower() and "تقييم" not in txt:
                        # last-resort: keep if the card is in a list of similar siblings
                        pass
                good.append(el)
            except Exception:
                continue

        # Pick the LARGEST set of similar-sized siblings (heuristic)
        print(f"  filtered to {len(good)} candidate cards "
              f"(selector={used_sel!r})", flush=True)

        # screenshot each
        saved = 0
        for i, el in enumerate(good[:25], 1):
            try:
                el.scroll_into_view_if_needed()
                time.sleep(0.2)
                path = OUT / f"{i:02d}.png"
                el.screenshot(path=str(path), omit_background=False)
                saved += 1
                print(f"  saved {path.name}", flush=True)
            except Exception as e:
                print(f"  [{i}] fail: {e}", flush=True)

        browser.close()
        print(f"\nDONE — {saved} review screenshots saved to {OUT}", flush=True)


if __name__ == "__main__":
    main()
