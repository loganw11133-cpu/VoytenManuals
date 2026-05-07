/* decoder-pdf.js — Shared PDF export for all Voyten decoder tools
   Reads decoded result cards from the DOM and generates a branded single-page PDF.
   Each decoder adds its own "Download PDF" button that calls downloadDecoderPDF().
   Requires jsPDF (loaded via CDN before this script). */

/* ── DOM Readers (handle all 3 decoder card patterns) ── */

function _pdfReadCards() {
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
    if (title || rows.length) cards.push({ title: title, rows: rows });
  });
  return cards;
}

function _pdfGetDecoderName() {
  var h1 = document.querySelector('.header h1, header h1');
  return h1 ? h1.textContent.trim() : 'Circuit Breaker Decoder';
}

function _pdfGetCatalog() {
  var el = document.getElementById('catInput') || document.getElementById('quickInput');
  if (!el) {
    var inputs = document.querySelectorAll('input[type="text"]');
    if (inputs.length) el = inputs[0];
  }
  return el ? el.value.trim().toUpperCase() : '';
}

/* ── PDF Builder — called by each decoder's Download PDF button ── */

function downloadDecoderPDF() {
  var jsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!jsPDF) { alert('PDF library is still loading \u2014 please try again in a moment.'); return; }

  var cards = _pdfReadCards();
  if (!cards.length) { alert('Decode a catalog number first.'); return; }

  var cat = _pdfGetCatalog();
  var name = _pdfGetDecoderName();
  var doc = new jsPDF('p', 'pt', 'letter');
  var W = 612, H = 792, M = 40, CW = W - M * 2;
  var y = 0;

  var RED  = [220, 38, 38];
  var BLK  = [26, 26, 26];
  var GRY  = [107, 114, 128];
  var LGRY = [209, 213, 219];
  var WHT  = [255, 255, 255];

  /* ── Header bar ── */
  doc.setFillColor(BLK[0], BLK[1], BLK[2]);
  doc.rect(0, 0, W, 68, 'F');
  doc.setFillColor(RED[0], RED[1], RED[2]);
  doc.rect(0, 68, W, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(WHT[0], WHT[1], WHT[2]);
  doc.text('VOYTEN ELECTRIC', M, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text('voytenmanuals.com', M, 48);
  doc.text('1-800-458-4001', W - M, 48, { align: 'right' });

  y = 92;

  /* ── Title section ── */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BLK[0], BLK[1], BLK[2]);
  doc.text('CIRCUIT BREAKER DECODE REPORT', M, y);
  y += 22;

  doc.setFont('courier', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(RED[0], RED[1], RED[2]);
  doc.text(cat || 'N/A', M, y);
  y += 16;

  var dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(GRY[0], GRY[1], GRY[2]);
  doc.text(name, M, y);
  doc.text(dateStr, W - M, y, { align: 'right' });
  y += 8;

  doc.setDrawColor(LGRY[0], LGRY[1], LGRY[2]);
  doc.setLineWidth(0.5);
  doc.line(M, y, W - M, y);
  y += 16;

  /* ── Two-column card layout ── */
  var COL_GAP = 16;
  var colW = (CW - COL_GAP) / 2;
  var ROW_H = 13;
  var SECTION_GAP = 10;
  var TITLE_H = 16;
  var footerTop = H - 50;

  function cardHeight(c) { return TITLE_H + c.rows.length * ROW_H + SECTION_GAP; }

  var leftY = y, rightY = y;

  function drawCard(card, cx, cy) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(RED[0], RED[1], RED[2]);
    var t = card.title.toUpperCase();
    doc.text(t, cx, cy);
    var tw = doc.getTextWidth(t);
    doc.setDrawColor(RED[0], RED[1], RED[2]);
    doc.setLineWidth(0.4);
    doc.line(cx, cy + 2, cx + tw, cy + 2);
    cy += TITLE_H;

    card.rows.forEach(function (row) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(GRY[0], GRY[1], GRY[2]);
      doc.text(row.label, cx + 2, cy);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(BLK[0], BLK[1], BLK[2]);
      var val = row.value;
      var maxValW = colW - 8;
      while (doc.getTextWidth(val) > maxValW && val.length > 4) {
        val = val.substring(0, val.length - 2) + '\u2026';
      }
      doc.text(val, cx + colW - 2, cy, { align: 'right' });
      cy += ROW_H;
    });
  }

  cards.forEach(function (card) {
    var h = cardHeight(card);
    if (leftY <= rightY) {
      if (leftY + h < footerTop) { drawCard(card, M, leftY); leftY += h; }
      else if (rightY + h < footerTop) { drawCard(card, M + colW + COL_GAP, rightY); rightY += h; }
      else { drawCard(card, M, leftY); leftY += h; }
    } else {
      if (rightY + h < footerTop) { drawCard(card, M + colW + COL_GAP, rightY); rightY += h; }
      else if (leftY + h < footerTop) { drawCard(card, M, leftY); leftY += h; }
      else { drawCard(card, M + colW + COL_GAP, rightY); rightY += h; }
    }
  });

  /* ── Footer ── */
  doc.setDrawColor(LGRY[0], LGRY[1], LGRY[2]);
  doc.setLineWidth(0.5);
  doc.line(M, H - 46, W - M, H - 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(GRY[0], GRY[1], GRY[2]);
  doc.text('Voyten Electric & Electronics, Inc.  \u00B7  voytenmanuals.com  \u00B7  1-800-458-4001', M, H - 32);
  doc.text('Generated from catalog number data. Verify against the physical breaker nameplate.', M, H - 22);

  var fn = cat ? 'decode-' + cat.replace(/[^A-Z0-9-]/gi, '') + '.pdf' : 'decode-report.pdf';
  doc.save(fn);
}
