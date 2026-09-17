"""One-off UTF-8 / placeholder fixes for static HTML. Run from repo root."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

REPLACEMENTS: list[tuple[str, str]] = [
    ("Intel Deck ? ", "Intel Deck → "),
    ("Intel Deck ? Compliance", "Intel Deck → Compliance"),
    ("Business location ? ", "Business location → "),
    ("Corporate Vault ? ", "Corporate Vault → "),
    ("Upload more ? smarter AI ? fewer", "Upload more → smarter AI → fewer"),
    ("Hide on map ? read", "Hide on map — then read"),
    (
        "The ? icon in an inbox",
        "The <strong>Mark all read</strong> (checkmark) icon in an inbox",
    ),
    ("Learn more ?", "Learn more →"),
    ("? Back to home", "← Back to home"),
    ("? Back to pricing", "← Back to pricing"),
    ("What's included vs AI allowance ?", "What's included vs AI allowance →"),
    ("Full included vs interactive breakdown ?", "Full included vs interactive breakdown →"),
    ("Full intelligence breakdown ?", "Full intelligence breakdown →"),
    ("See common document types on the homepage ?", "See common document types on the homepage →"),
    ("Full pricing &amp; plan details ?", "Full pricing &amp; plan details →"),
    ("Full policy ?", "Full policy →"),
    ("Full breakdown on pricing ?", "Full breakdown on pricing →"),
    ("Full details for all states ?", "Full details for all states →"),
    ("Pricing ?", "Pricing →"),
    ("Intel Deck ? App tutorial", "Intel Deck → App tutorial"),
    ("Intel Deck ? Feedback &amp; Support", "Intel Deck → Feedback &amp; Support"),
    ("Intel Deck ? open", "Intel Deck → open"),
    ("Chat &amp; voice � no", "Chat &amp; voice — no"),
    ("know�or", "know—or"),
    ("hold�not", "hold—not"),
    ("about</strong> � bug", "about</strong> — bug"),
    ("message</strong> � what", "message</strong> — what"),
    ("optional) � if", "optional) — if"),
    ("you � whether", "you — whether"),
    ("inbox � same", "inbox — same"),
    ("Intel Deck � tap", "Intel Deck — tap"),
    ("lists � even", "lists — even"),
    ("have � the", "have — the"),
    ("19) � first", "19) — first"),
    ("documents � not", "documents — not"),
    ("again � not", "again — not"),
    ("Updates � Dashboard", "Updates · Dashboard"),
    ("Updates � purple", "Updates · purple"),
    ("Updates � scoped", "Updates · scoped"),
    ("Compliance � runs", "Compliance · runs"),
    ("Ask AI � ", "Ask AI · "),
    ("Patrol � scoped", "Patrol · scoped"),
]

WHY_NO = 'class="why-no"><span class="why-icon" aria-hidden="true">?</span>'
WHY_YES = 'class="why-yes"><span class="why-icon" aria-hidden="true">?</span>'

# UTF-8 bytes mis-saved / mis-read as Latin-1 (common on Windows edits).
MOJIBAKE: list[tuple[str, str]] = [
    ("â€”", "—"),
    ("â€“", "–"),
    ("â†’", "→"),
    ("â†", "←"),
    ("â€™", "'"),
    ("â€œ", '"'),
    ("â€\x9d", '"'),
    ("â€¦", "…"),
    ("â€˜", "'"),
]


def fix_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8", errors="replace")
    original = text
    for old, new in MOJIBAKE + REPLACEMENTS:
        text = text.replace(old, new)
    text = text.replace("\ufffd", "—")
    text = re.sub(
        r'(<a[^>]*class="[^"]*text-link-arrow[^"]*"[^>]*>)([^<]+?) →(</a>)',
        r"\1\2\3",
        text,
    )
    text = re.sub(
        r'styles\.css\?v=[^"]+',
        "styles.css?v=20260917utf",
        text,
    )
    text = re.sub(
        r'site-public\.js\?v=[^"]+',
        "site-public.js?v=20260917utf",
        text,
    )
    text = text.replace(WHY_NO, 'class="why-no"><span class="why-icon" aria-hidden="true">×</span>')
    text = text.replace(WHY_YES, 'class="why-yes"><span class="why-icon" aria-hidden="true">✓</span>')
    text = re.sub(r'(<details[^>]*)\sopen(\s|>)', r"\1\2", text)
    if text != original:
        path.write_text(text, encoding="utf-8", newline="\n")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(ROOT.glob("*.html")):
        if fix_file(path):
            changed.append(path.name)
    print("Updated:", ", ".join(changed) if changed else "(none)")


if __name__ == "__main__":
    main()
