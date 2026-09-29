"""Insert favicon <link> tags into all root HTML pages (once)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VER = "20260929shield"
BLOCK = f"""  <link rel="icon" href="favicon.ico?v={VER}" sizes="48x48">
  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png?v={VER}">
  <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png?v={VER}">
  <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png?v={VER}">
"""
MARKER = f'favicon.ico?v={VER}'


def main() -> None:
    for path in sorted(ROOT.glob("*.html")):
        text = path.read_text(encoding="utf-8", errors="replace")
        if MARKER in text:
            continue
        m = re.search(
            r'(<meta name="viewport"[^>]*>\s*\n)',
            text,
            flags=re.IGNORECASE,
        )
        if not m:
            print(f"skip (no viewport): {path.name}")
            continue
        updated = text[: m.end()] + BLOCK + text[m.end() :]
        path.write_text(updated, encoding="utf-8", newline="\n")
        print(f"updated {path.name}")


if __name__ == "__main__":
    main()
