/** Canonical support mailto — same draft in Gmail, Outlook, Yahoo, default app. */
(function () {
  var lines = [
    'Hi PermitArc team,',
    '',
    'Write your message BELOW the divider line.',
    'Do not type above the divider (you can delete these instructions).',
    '',
    '----------------------------------------',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Optional — only if it helps us reply faster:',
    '',
    'Topic (bug, billing, idea, other):',
    '',
    '',
    '',
    'What you were doing (if relevant):',
    '',
    '',
    '',
    'Your email for a reply (optional):',
    '',
    '',
  ];
  var body = encodeURIComponent(lines.join('\r\n'));
  window.PermitArcSupportMailto =
    'mailto:support@permitarc.com?subject=' +
    encodeURIComponent('PermitArc support') +
    '&body=' +
    body;
})();
