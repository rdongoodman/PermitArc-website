"""Bump styles.css and site-chrome.js query strings on all root HTML files."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS_VER = "20260917email"
CHROME_VER = "20260917email"


def main() -> None:
    for path in sorted(ROOT.glob("*.html")):
        text = path.read_text(encoding="utf-8", errors="replace")
        updated = re.sub(r"styles\.css\?v=[^\"']+", f"styles.css?v={CSS_VER}", text)
        updated = re.sub(
            r"site-chrome\.js\?v=[^\"']+",
            f"site-chrome.js?v={CHROME_VER}",
            updated,
        )
        if updated != text:
            path.write_text(updated, encoding="utf-8", newline="\n")
            print(path.name)


if __name__ == "__main__":
    main()
