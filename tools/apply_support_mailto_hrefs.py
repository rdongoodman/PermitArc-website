"""Replace support@ mailto links with canonical empty-body mailto."""
from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent

SUPPORT_SCRIPT = (
    '  <script src="site-support-mailto.js?v=20260918form"></script>\n'
)


def build_canonical_href(for_html: bool) -> str:
    subject = quote("PermitArc support")
    return f"mailto:support@permitarc.com?subject={subject}"


def main() -> None:
    canonical = build_canonical_href(for_html=True)
    pattern = re.compile(r'href="mailto:support@permitarc\.com[^"]*"')

    for path in sorted(ROOT.glob("*.html")):
        text = path.read_text(encoding="utf-8", errors="replace")
        updated = pattern.sub(f'href="{canonical}"', text)
        for old in (
            "site-support-mailto.js?v=20260918support2",
            "site-support-mailto.js?v=20260918support",
            "site-support-mailto.js?v=20260917email2",
        ):
            updated = updated.replace(old, "site-support-mailto.js?v=20260918form")
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
