/* decoder-quote.js — Shared "Get Quote — Configured to Spec" action for all Voyten decoder tools.
   Reads the decoded result cards from the DOM, then asks the parent page (the Next.js
   /tools/* wrapper) to open a quote modal pre-filled with the exact configuration.
   Each decoder adds its own button that calls openDecoderQuote().

   Why postMessage instead of a modal inside this iframe: a position:fixed modal rendered
   inside the decoder iframe is positioned relative to the (very tall) iframe viewport, so it
   scrolls out of view. The parent renders the overlay against the real browser viewport and
   reuses the site's existing CSRF-protected LeadCaptureForm. */

/* ── DOM readers (mirror decoder-pdf.js so this works on every decoder unchanged) ── */

function _rfqGetCatalog() {
  var el = document.getElementById('catInput') || document.getElementById('quickInput');
  if (!el) {
    var inputs = document.querySelectorAll('input[type="text"]');
    if (inputs.length) el = inputs[0];
  }
  return el ? el.value.trim().toUpperCase() : '';
}

function _rfqGetDecoderName() {
  var h1 = document.querySelector('.header h1, header h1');
  return h1 ? h1.textContent.trim().replace(/\s+/g, ' ') : 'Circuit Breaker Decoder';
}

function _rfqReadCards() {
  var results = document.getElementById('results');
  if (!results) return [];
  var cardEls = results.querySelectorAll('.card, .result-card');
  var cards = [];
  cardEls.forEach(function (el) {
    var titleEl = el.querySelector('h3, .card-title');
    var title = titleEl ? titleEl.textContent.trim() : '';
    var rowEls = el.querySelectorAll('.field, .card-row, .result-item');
    var rows = [];
    rowEls.forEach(function (r) {
      var lbl = r.querySelector('.field-label, .card-label, .label');
      var val = r.querySelector('.field-value, .card-value, .value');
      if (lbl && val) rows.push({ label: lbl.textContent.trim(), value: val.textContent.trim() });
    });
    if (rows.length) cards.push({ title: title, rows: rows });
  });
  return cards;
}

/* Build a plain-text spec summary from the decoded cards. */
function _rfqBuildSummary(catalog, decoderName) {
  var cards = _rfqReadCards();
  var lines = [];
  lines.push('Configured-to-spec quote request via the ' + decoderName + '.');
  lines.push('');
  lines.push('Catalog / part number: ' + (catalog || 'N/A'));
  if (cards.length) {
    lines.push('');
    lines.push('Decoded configuration:');
    cards.forEach(function (card) {
      if (card.title) lines.push('[' + card.title + ']');
      card.rows.forEach(function (row) {
        lines.push('  - ' + row.label + ': ' + row.value);
      });
    });
  }
  return lines.join('\n');
}

/* ── Public entry — called by each decoder's "Get Quote" button ── */

function openDecoderQuote() {
  var catalog = _rfqGetCatalog();
  var cards = _rfqReadCards();
  if (!catalog || !cards.length) {
    alert('Enter and decode a catalog number first, then request a configured-to-spec quote.');
    return;
  }

  var decoderName = _rfqGetDecoderName();
  var payload = {
    __voytenDecoder: true,
    action: 'openQuote',
    catalog: catalog,
    decoder: decoderName,
    summary: _rfqBuildSummary(catalog, decoderName),
    path: (function () { try { return window.location.pathname; } catch (e) { return ''; } })(),
  };

  // Normal case: embedded in the Next.js /tools/* page — hand off to the parent modal.
  if (window.parent && window.parent !== window) {
    try {
      window.parent.postMessage(payload, window.location.origin);
      return;
    } catch (e) { /* fall through to mailto */ }
  }

  // Fallback (decoder opened stand-alone, no parent frame): email client with the spec.
  var subject = 'Quote request — ' + catalog;
  var href = 'mailto:sales@voyten.com?subject=' + encodeURIComponent(subject) +
             '&body=' + encodeURIComponent(payload.summary);
  window.location.href = href;
}
