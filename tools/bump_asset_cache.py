"""Bump shared asset query strings on all root HTML files."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VER = "20260918chooser"

ASSETS = (
    "styles.css",
    "site-chrome.js",
    "site-support-mailto.js",
    "site-email-compose.js",
)


def main() -> None:
    for path in sorted(ROOT.glob("*.html")):
        text = path.read_text(encoding="utf-8", errors="replace")
        updated = text
        for asset in ASSETS:
            updated = re.sub(
                re.escape(asset) + r"\?v=[^\"']+",
                f"{asset}?v={VER}",
                updated,
            )
        if updated != text:
            path.write_text(updated, encoding="utf-8", newline="\n")
            print(path.name)


if __name__ == "__main__":
    main()
