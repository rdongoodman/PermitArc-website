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

# why-list icons are CSS ::before (× / ✓) — do not inject characters here.

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

# Lone CP1252 bytes saved inside UTF-8 HTML (shows as � in browsers).
CP1252_LONE: list[tuple[str, str]] = [
    ("\x97", "—"),
    ("\x96", "–"),
    ("\x95", "•"),
    ("\xb7", "·"),
]


BYTE_TO_ENTITY: list[tuple[bytes, bytes]] = [
    (b"\x97", b"&mdash;"),
    (b"\x96", b"&ndash;"),
]


def fix_raw_bytes(raw: bytes) -> bytes:
    for old, new in BYTE_TO_ENTITY:
        raw = raw.replace(old, new)
    # Lone CP1252 middot only — skip valid UTF-8 (C2 B7).
    raw = re.sub(rb"(?<!\xc2)\xb7", b"&middot;", raw)
    return raw


def fix_file(path: Path) -> bool:
    raw = fix_raw_bytes(path.read_bytes())
    text = raw.decode("utf-8", errors="replace")
    original = text
    for old, new in MOJIBAKE + REPLACEMENTS:
        text = text.replace(old, new)
    text = text.replace("&mdash;&middot;", "&middot;")
    text = text.replace("\ufffd", "&mdash;")
    for char, entity in (
        ("\u2014", "&mdash;"),
        ("\u2013", "&ndash;"),
        ("\u2192", "&rarr;"),
        ("\u2190", "&larr;"),
        ("\u00b7", "&middot;"),
    ):
        text = text.replace(char, entity)
    text = re.sub(
        r'(<a[^>]*class="[^"]*text-link-arrow[^"]*"[^>]*>)([^<]+?) →(</a>)',
        r"\1\2\3",
        text,
    )
    text = re.sub(
        r'styles\.css\?v=[^"]+',
        "styles.css?v=20260917fix",
        text,
    )
    text = re.sub(
        r'site-public\.js\?v=[^"]+',
        "site-public.js?v=20260917fix",
        text,
    )
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
