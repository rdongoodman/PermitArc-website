# PermitArc-website

Marketing site for [PermitArc](https://permitarc.com) — static HTML on GitHub Pages.

- **Live:** https://permitarc.com
- **Stack:** HTML + CSS · Cloudflare DNS · GitHub Pages

## Preview locally (Windows)

Double-click on Desktop:

- **`Preview PermitArc Website.bat`** → opens http://127.0.0.1:8081/

No install needed. Press **Ctrl+C** in the black window to stop the preview server.

## If permitarc.com shows 404

The site files are fine on GitHub. A 404 usually means the **custom domain is not linked** in GitHub Pages settings.

1. Open https://github.com/rdongoodman/PermitArc-website/settings/pages
2. Under **Custom domain**, enter `permitarc.com` and save
3. Wait a few minutes for DNS check (green checkmark)
4. In **Cloudflare DNS** for permitarc.com, ensure the root record points to GitHub Pages:
   - **CNAME** `@` → `rdongoodman.github.io` (Cloudflare flattens apex CNAME), **or**
   - **A** records to GitHub Pages IPs (same pattern as papathaigg.com if that works for you)
5. SSL/TLS mode in Cloudflare: **Full** (not Flexible)

Temporary workaround while fixing DNS: https://rdongoodman.github.io/PermitArc-website/

## Pages (v1)

| Page | Status |
|------|--------|
| Home (`index.html`) | Live — Phase 1 copy Jul 19 |
| Pricing (`pricing.html`) | Live — included vs metered Jul 19 |
| Feedback (`feedback.html`) | Live — mailto v1 |
| Privacy, Terms, AI disclaimer | Live |
| Stripe checkout, Download page | Coming |

Built to match the PermitArc app color palette (dark hero, teal accent).
