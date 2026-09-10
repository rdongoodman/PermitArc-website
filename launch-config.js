/**
 * PermitArc website launch switches — flip when checkout + downloads are ready.
 * checkoutEnabled: false = pricing preview only (no Stripe opens).
 * downloadsPublic: false = hide Download nav; /download.html redirects unless preview token.
 */
window.PermitArcLaunch = {
  checkoutEnabled: false,
  downloadsPublic: false,
  downloadPreviewToken: 'permitarc-owner-preview',
};
