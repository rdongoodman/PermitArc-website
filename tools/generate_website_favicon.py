"""Build favicon.ico and PNG tab icons from assets/shield_logo.png.

Regenerate:
  python tools/generate_website_favicon.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "shield_logo.png"
CACHE_VER = "20260929shield"
ICO_SIZES = (16, 32, 48)


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"Missing source: {SRC}")
    base = Image.open(SRC).convert("RGBA")
    master = base.resize((256, 256), Image.Resampling.LANCZOS)
    master.save(
        ROOT / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
    )
    for size, name in (
        (16, "favicon-16x16.png"),
        (32, "favicon-32x32.png"),
        (180, "apple-touch-icon.png"),
    ):
        out = ROOT / name
        base.resize((size, size), Image.Resampling.LANCZOS).save(out, format="PNG")
        print(f"Wrote {name}")
    print(f"Wrote favicon.ico (cache bust ?v={CACHE_VER} in HTML)")


if __name__ == "__main__":
    main()
