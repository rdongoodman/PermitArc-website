"""Replace support@ mailto links with the canonical feedback starter template."""
from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent

SUPPORT_SCRIPT = (
    '  <script src="site-support-mailto.js?v=20260918support2"></script>\n'
)


def build_body() -> str:
    lines = [
        "Hi PermitArc team,",
        "",
        "Write your message BELOW the divider line.",
        "Do not type above the divider (you can delete these instructions).",
        "",
        "----------------------------------------",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Optional — only if it helps us reply faster:",
        "",
        "Topic (bug, billing, idea, other):",
        "",
        "",
        "",
        "What you were doing (if relevant):",
        "",
        "",
        "",
        "Your email for a reply (optional):",
        "",
        "",
    ]
    return "\r\n".join(lines)


def build_canonical_href(for_html: bool) -> str:
    subject = quote("PermitArc support")
    body = quote(build_body(), safe="")
    sep = "&amp;" if for_html else "&"
    return f"mailto:support@permitarc.com?subject={subject}{sep}body={body}"


def main() -> None:
    canonical = build_canonical_href(for_html=True)
    pattern = re.compile(r'href="mailto:support@permitarc\.com[^"]*"')

    for path in sorted(ROOT.glob("*.html")):
        text = path.read_text(encoding="utf-8", errors="replace")
        updated = pattern.sub(f'href="{canonical}"', text)
        updated = updated.replace(
            "site-support-mailto.js?v=20260918support",
            "site-support-mailto.js?v=20260918support2",
        )
        updated = updated.replace(
            "site-support-mailto.js?v=20260917email2",
            "site-support-mailto.js?v=20260918support2",
        )
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
