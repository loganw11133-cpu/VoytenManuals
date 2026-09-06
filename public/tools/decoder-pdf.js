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
  var LINE_H = 9;
  var MIN_LABEL_W = 72;   // below this a row stacks instead of colliding      // spacing between wrapped lines inside one row
  var SECTION_GAP = 10;
  var TITLE_H = 16;
  var footerTop = H - 50;

  /* Lay each row out ONCE and reuse it for both the height calculation and the
     draw, so the two can never disagree.

     The label used to be drawn unmeasured while only the value was truncated, so
     a long label ran underneath the right-aligned value and the two overlapped.
     Worst on the medium-voltage parts tables, whose labels carry a rating, a
     current and a column name. Now the value is measured first, the label gets
     whatever width is left, and it wraps instead of colliding. */
  function layoutRow(row) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    // Value keeps the width it always had, so nothing that used to render in
    // full is newly truncated in the eight other decoders.
    var val = String(row.value == null ? '' : row.value);
    while (doc.getTextWidth(val) > colW - 8 && val.length > 4) {
      val = val.substring(0, val.length - 2) + '\u2026';
    }
    var valW = doc.getTextWidth(val);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    var avail = colW - valW - 12;

    // When label and value cannot share a line without colliding, stack them:
    // label wrapped across the full column, value right-aligned beneath. Better
    // than truncating either, since both carry ordering information.
    if (avail < MIN_LABEL_W) {
      var wrapped = doc.splitTextToSize(String(row.label == null ? '' : row.label), colW - 4);
      if (wrapped.length > 3) wrapped = wrapped.slice(0, 3).concat('\u2026');
      return { lines: wrapped, val: val, stacked: true };
    }
    var lines = doc.splitTextToSize(String(row.label == null ? '' : row.label), avail);
    if (lines.length > 3) lines = lines.slice(0, 3).concat('\u2026');
    return { lines: lines, val: val, stacked: false };
  }

  cards.forEach(function (card) { card.laid = card.rows.map(layoutRow); });

  function rowHeight(l) {
    return ROW_H + (l.lines.length - 1) * LINE_H + (l.stacked ? LINE_H : 0);
  }
  function cardHeight(c) {
    var h = TITLE_H + SECTION_GAP;
    c.laid.forEach(function (l) { h += rowHeight(l); });
    return h;
  }

  function drawFooter() {
    doc.setDrawColor(LGRY[0], LGRY[1], LGRY[2]);
    doc.setLineWidth(0.5);
    doc.line(M, H - 46, W - M, H - 46);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(GRY[0], GRY[1], GRY[2]);
    doc.text('Voyten Electric & Electronics, Inc.  \u00B7  voytenmanuals.com  \u00B7  1-800-458-4001', M, H - 32);
    doc.text('Generated from catalog number data. Verify against the physical breaker nameplate.', M, H - 22);
  }

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

    card.laid.forEach(function (l) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(GRY[0], GRY[1], GRY[2]);
      for (var i = 0; i < l.lines.length; i++) {
        doc.text(l.lines[i], cx + 2, cy + i * LINE_H);
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(BLK[0], BLK[1], BLK[2]);
      var vy = l.stacked ? cy + l.lines.length * LINE_H : cy;
      doc.text(l.val, cx + colW - 2, vy, { align: 'right' });
      cy += rowHeight(l);
    });
  }

  /* A card that fitted in neither column used to be drawn anyway, straight over
     the footer. Start a new page instead. */
  cards.forEach(function (card) {
    var h = cardHeight(card);
    if (leftY + h >= footerTop && rightY + h >= footerTop) {
      drawFooter();
      doc.addPage();
      leftY = rightY = M + 20;
    }
    var useLeft = (leftY <= rightY) ? (leftY + h < footerTop) : !(rightY + h < footerTop);
    if (useLeft) { drawCard(card, M, leftY); leftY += h; }
    else { drawCard(card, M + colW + COL_GAP, rightY); rightY += h; }
  });

  drawFooter();

  var fn = cat ? 'decode-' + cat.replace(/[^A-Z0-9-]/gi, '') + '.pdf' : 'decode-report.pdf';
  doc.save(fn);
}
