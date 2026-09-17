"""Replace plain support@ mailto links with the feedback starter template."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CANONICAL = (
    "mailto:support@permitarc.com?subject=PermitArc%20feedback&amp;body="
    "Category%20(bug%20%2F%20readability%20%2F%20feature%20%2F%20account%20%2F%20other)%3A%0A%0A"
    "What%20I%20was%20trying%20to%20do%3A%0A%0AWhat%20happened%20instead%3A%0A%0A"
    "Reply%20email%20(optional)%3A"
)

PLAIN = 'href="mailto:support@permitarc.com"'
SUBJECT_ONLY = (
    'href="mailto:support@permitarc.com?subject=PermitArc%20feedback"'
)
SUPPORT_SCRIPT = (
    '  <script src="site-support-mailto.js?v=20260917email2"></script>\n'
)


def main() -> None:
    for path in sorted(ROOT.glob("*.html")):
        text = path.read_text(encoding="utf-8", errors="replace")
        updated = text.replace(PLAIN, f'href="{CANONICAL}"')
        updated = updated.replace(SUBJECT_ONLY, f'href="{CANONICAL}"')
        if "site-support-mailto.js" not in updated:
            updated = updated.replace(
                '  <script src="site-nav-config.js',
                SUPPORT_SCRIPT + '  <script src="site-nav-config.js',
                1,
            )
        if updated != text:
            path.write_text(updated, encoding="utf-8", newline="\n")
            print(path.name)


if __name__ == "__main__":
    main()
