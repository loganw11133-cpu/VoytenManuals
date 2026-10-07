// Lead spam filter for /api/leads.
//
// Two kinds of evidence:
//  - HARD: the hidden honeypot field was filled, or the form was submitted faster
//    than a person can type. Either one alone marks the lead as spam.
//  - SOFT: content scored against the bot pattern seen on /contact since 2026-09-29
//    (#70-72): random-case letter-only message ("LXEFFXWlsKWIyMfhD"), a Gmail address
//    salted with dots ("agef.o.h.a34.7@gmail.com"), keyboard-mash names and a
//    "<Gibberish> LLC" company. A lead needs SPAM_SCORE points to be rejected, so one
//    odd field (a real name with a consonant run, a dotted Gmail) never blocks a lead.

export interface LeadFields {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  message?: unknown;
  website?: unknown;     // honeypot — hidden from people, filled by bots
  elapsed_ms?: unknown;  // ms between form render and submit, sent by LeadCaptureForm
}

export interface SpamVerdict {
  spam: boolean;
  score: number;
  reasons: string[];
}

const SPAM_SCORE = 3;
const MIN_ELAPSED_MS = 2500;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** A single letters-only token, 12+ chars, whose case flips 3+ times — "dwmkkIvdONIISLpxGC".
 *  Part numbers carry digits or dashes and are excluded; so is anything with a space. */
function isRandomCaseToken(s: string): boolean {
  if (!/^[A-Za-z]{12,}$/.test(s)) return false;
  let flips = 0;
  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1] === s[i - 1].toUpperCase();
    const b = s[i] === s[i].toUpperCase();
    if (a !== b) flips++;
  }
  return flips >= 3;
}

/** A word with 5+ consonants in a row, or no vowel at all in 5+ letters — "Dlkmqfpgf", "Vljfv".
 *  Five, not four: real surnames reach four ("Schwartz", "Albrecht"). */
function isMashWord(w: string): boolean {
  const lw = w.toLowerCase();
  if (!/^[a-z]{5,}$/.test(lw)) return false;
  return /[^aeiouy]{5,}/.test(lw) || !/[aeiouy]/.test(lw);
}

/** Gmail ignores dots, so bots salt one inbox into thousands of "unique" addresses. */
function isDotSaltedGmail(email: string): boolean {
  const m = /^([^@]+)@(gmail|googlemail)\.com$/i.exec(email);
  return !!m && (m[1].match(/\./g)?.length ?? 0) >= 3;
}

export function checkLeadSpam(fields: LeadFields): SpamVerdict {
  const reasons: string[] = [];
  let score = 0;

  if (str(fields.website)) {
    reasons.push('honeypot');
    score += SPAM_SCORE;
  }

  // Older cached copies of the form send no elapsed_ms — treat that as no evidence.
  const elapsed = typeof fields.elapsed_ms === 'number' ? fields.elapsed_ms : null;
  if (elapsed !== null && elapsed < MIN_ELAPSED_MS) {
    reasons.push(`too-fast:${elapsed}ms`);
    score += SPAM_SCORE;
  }

  const message = str(fields.message);
  if (isRandomCaseToken(message)) {
    reasons.push('message:random-case');
    score += 2;
  }

  if (isDotSaltedGmail(str(fields.email))) {
    reasons.push('email:dot-salted-gmail');
    score += 2;
  }

  if (str(fields.name).split(/\s+/).some(isMashWord)) {
    reasons.push('name:mash');
    score += 1;
  }

  const company = /^(\S+)\s+LLC$/i.exec(str(fields.company));
  if (company && isMashWord(company[1])) {
    reasons.push('company:mash-llc');
    score += 1;
  }

  return { spam: score >= SPAM_SCORE, score, reasons };
}
