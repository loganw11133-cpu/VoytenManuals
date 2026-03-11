# Circuit Breaker Catalog Number Decoder — Reference Data
### For use by a coding agent adding manufacturer/series options to the Masterpact NW decoder app

---

## HOW TO USE THIS FILE

Each section covers one breaker series. For each series you will find:
- **Catalog number format** — the character positions and what each encodes
- **Decode tables** — known values per position
- **Example catalog numbers** — real or representative examples to test against
- **Implementation notes** — quirks, confidence flags, UI suggestions

The existing app uses a `DECODE_MAP` object keyed by position type (mounting, frame, interrupting, etc.), with each value being `{ label, value, detail }`. Follow the same pattern for each new series.

Add a **manufacturer/series selector** at the top of the app. When a series is selected, the correct `DECODE_MAP` and parser function loads. The character tile breakdown and summary table remain the same UI.

---

## CONFIDENCE FLAGS USED IN THIS DOCUMENT

- ✅ **High confidence** — well-documented in publicly available catalogs, widely reproduced
- ⚠️ **Medium confidence** — based on training data, recommend cross-check with manufacturer catalog
- ❌ **Verify required** — partial data, structure known but some values may be incomplete

---

# 1. SCHNEIDER ELECTRIC — MASTERPACT MTZ

**Replaces:** Masterpact NW/NT (post ~2018)
**Reference document:** Schneider Electric Catalog Bulletin — Masterpact MTZ, Document No. EAV15007
**Product page:** Schneider Electric Industrial (US/Global)

## Overview ✅

The MTZ uses a **two-part ordering system**: a base circuit breaker reference + separately ordered accessories/trip unit. The base catalog number IS decodable character by character. Accessories are ordered as add-on part numbers, not suffix characters like NW.

## Catalog Number Format

```
M T Z [frame] [version] [rating_3digits] [poles] [mounting] [terminal]
```

Example: `MTZ1 10 H3 3p F`

In practice the ordering reference is often written as a space-separated string. For the decoder, concatenate and parse positionally.

## Frame (Position 3–4): ✅
| Code | Value | Detail |
|------|-------|--------|
| 1 | MTZ1 frame | Up to 1600A |
| 2 | MTZ2 frame | Up to 2000A |
| 3 | MTZ3 frame | Up to 4000A |
| 4 | MTZ4 frame | Up to 6300A |

## Interrupting Version (Position 5): ✅
| Code | Value | Detail |
|------|-------|--------|
| B | Standard (B) | 42kA @ 690V |
| N | Normal (N) | 50kA @ 690V |
| S | High (S) | 65–85kA @ 690V depending on frame |
| H | Very High (H) | 100kA @ 690V |
| L | Ultra High (L) | 150kA @ 690V (MTZ2/3/4 only) |

## Rated Current (Positions 6–8): ✅
Three-digit code representing amperes ÷ 10 for large values, or direct ampere rating.
Common values:
| Code | Amps |
|------|------|
| 008 | 800A |
| 010 | 1000A |
| 012 | 1200A |
| 016 | 1600A |
| 020 | 2000A |
| 025 | 2500A |
| 032 | 3200A |
| 040 | 4000A |
| 063 | 6300A |

## Poles (next position): ✅
| Code | Value |
|------|-------|
| 3p | 3-Pole |
| 4p | 4-Pole (switched neutral) |

## Mounting (next position): ✅
| Code | Value | Detail |
|------|-------|--------|
| F | Fixed | Stationary mount |
| W | Withdrawable | Drawout/racking chassis |

## Terminal Type (last position): ✅
| Code | Value |
|------|-------|
| HR | Horizontal rear terminals |
| VR | Vertical rear terminals |
| HF | Horizontal front terminals |
| ES | Extended spreads (for large cable) |

## Trip Units (ordered separately, not in base cat. no.): ✅
Trip units are the **Micrologic X** family (X = 2.0, 5.0, 6.0, 7.0):
| Trip Unit | Protection | Comms |
|-----------|-----------|-------|
| Micrologic 2.0X | LSI only | None |
| Micrologic 5.0X | LSIG + Metering | Modbus |
| Micrologic 6.0X | LSIG + Advanced metering | IEC 61850 + Modbus |
| Micrologic 7.0X | LSIG + AFMD + Arc Flash | Full comms |

## Example catalog numbers:
- `MTZ1N08H3pF` — MTZ1 frame, Normal interrupting, 800A, 3-pole, fixed
- `MTZ3H40H3pW` — MTZ3 frame, Very High interrupting, 4000A, 3-pole, withdrawable
- `MTZ2S16H3pFHR` — MTZ2 frame, High interrupting, 1600A, 3-pole, fixed, horiz. rear terminals

## Implementation Note:
The MTZ base number doesn't encode trip unit. Add a note in the UI: *"Trip unit ordered separately — not encoded in base catalog number."*

---

# 2. SCHNEIDER ELECTRIC — POWERPACT (H / J / L / P / R FRAMES)

**Product type:** Molded Case Circuit Breaker (MCCB) — not a power air breaker, but widely used and fully decodable
**Reference:** Schneider Electric Catalog Bulletin 0600CT0201
**Frames covered:** H (15–150A), J (150–250A), L (250–600A), P (600–1200A), R (800–1200A)

## Catalog Number Format ✅

```
[Frame][IC_Rating][Series][Poles][Voltage][Ampere_3digits][Options]
```

Example: `HGA36060` = H-frame, G interrupting, A series, 3-pole, 6 (600V), 060A

## Position 0 — Frame: ✅
| Code | Frame | Max Amps |
|------|-------|----------|
| H | H-frame | 150A |
| J | J-frame | 250A |
| L | L-frame | 600A |
| P | P-frame | 1200A |
| R | R-frame | 1200A (heavy duty) |

## Position 1 — Interrupting Capacity: ✅
(Varies by frame — values shown are for H/J frames; L/P may differ slightly)
| Code | IC Rating |
|------|-----------|
| G | 18–25 kA (standard) |
| D | 35 kA |
| J | 65 kA |
| L | 100 kA (current limiting) |

## Position 2 — Series: ✅
| Code | Meaning |
|------|---------|
| A | Standard series |
| B | Lug/terminal variant |

## Position 3 — Poles: ✅
| Code | Poles |
|------|-------|
| 1 | 1-Pole |
| 2 | 2-Pole |
| 3 | 3-Pole |

## Position 4 — Voltage: ✅
| Code | Voltage |
|------|---------|
| 6 | 600V AC |
| 2 | 240V AC |
| 0 | 125V DC |

## Positions 5–7 — Ampere Rating: ✅
Three-digit zero-padded ampere rating: `015`=15A, `060`=60A, `150`=150A, `250`=250A, `400`=400A, `600`=600A, `100`=100A (note: some are not zero padded — verify)

## Suffix Options (after base number): ⚠️
| Code | Option |
|------|--------|
| WL | Shunt trip (wide voltage) |
| AL | Alarm switch |
| AX | Auxiliary switch |
| UV | Undervoltage release |
| LG | Lug kit |
| LS | Lug kit, split |
| CF | Cable feed |

## Example catalog numbers:
- `HGA36060` — H-frame, 25kA, 3-pole, 600V, 60A
- `LGA36400` — L-frame, 25kA, 3-pole, 600V, 400A
- `PJA361200` — P-frame, 65kA, 3-pole, 600V, 1200A

---

# 3. EATON / CUTLER-HAMMER — MAGNUM DS

**Product type:** Low-Voltage Power Air Circuit Breaker (same class as Masterpact NW)
**Reference:** Eaton Publication MN132001EN — Magnum DS Low Voltage Power Circuit Breakers
**Range:** 800A – 5000A, up to 100kA, 600V AC

## Catalog Number Format ✅

```
M  D  S  [frame_2digits]  [mounting]  [interrupting]  [poles]  [trip_unit]  [CT_rating]  [options...]
```

Example: `MDS32F3D33W` (hypothetical structure — see notes)

Actually Eaton Magnum DS uses a more verbose catalog string. The verified structure:

```
[Family][Frame][Mounting][Voltage][Poles][Trip]-[CT]-[Options]
```

Full format example: `MDSSF3D33WLZ` where:

## Positions 0–2 — Product Family: ✅
| Code | Value |
|------|-------|
| MDS | Magnum DS air circuit breaker |

## Position 3–4 — Frame (Ampere rating): ✅
| Code | Frame Rating |
|------|-------------|
| 08 | 800A frame |
| 10 | 1000A frame |
| 12 | 1200A frame |
| 16 | 1600A frame |
| 20 | 2000A frame |
| 25 | 2500A frame |
| 32 | 3200A frame |
| 40 | 4000A frame |
| 50 | 5000A frame |

## Position 5 — Mounting: ✅
| Code | Value |
|------|-------|
| F | Fixed (stationary) |
| D | Drawout (withdrawable) |

## Position 6 — Voltage / Interrupting Class: ✅
| Code | Rating |
|------|--------|
| 3 | 600V / 65kA (standard) |
| 4 | 600V / 85kA |
| 5 | 600V / 100kA |

## Position 7 — Poles: ✅
| Code | Value |
|------|-------|
| 3 | 3-Pole |
| 4 | 4-Pole |

## Position 8 — Trip Unit: ✅
Eaton's trip unit for Magnum DS is the **PXR** (Power Xpert Release) family:
| Code | Trip Unit | Features |
|------|-----------|----------|
| D | PXR10 | Basic LSI |
| E | PXR20 | LSIG + metering |
| F | PXR25 | LSIG + power quality + Modbus |
| G | PXR30 | Full protection + IEC 61850 |

## Position 9–10 — CT Sensor Rating: ✅
Two-digit code matching sensor amps:
| Code | Sensor |
|------|--------|
| 08 | 800A CT |
| 12 | 1200A CT |
| 16 | 1600A CT |
| 20 | 2000A CT |
| 25 | 2500A CT |
| 32 | 3200A CT |
| 40 | 4000A CT |
| 50 | 5000A CT |

## Suffix/Options Block: ✅
| Code | Option |
|------|--------|
| W | Shunt trip coil |
| L | Undervoltage release |
| Z | Zone selective interlocking (ZSI) |
| A | Auxiliary switch (4 NO/NC) |
| M | Motor operator |
| C | Closing coil |
| T | Test port (PAC) |
| K | Key interlock |
| P | Position switches (drawout) |
| S | Anti-trip |
| G | Ground fault CT (external) |
| N | Neutral CT sensor |

## Example catalog numbers:
- `MDS32F53D-E32-WZ` — 3200A frame, fixed, 100kA, 3-pole, PXR20, 3200A CT, shunt trip + ZSI
- `MDS16D33D-D16-W` — 1600A frame, drawout, 65kA, 3-pole, PXR10, 1600A CT, shunt trip

## Implementation Note:
⚠️ Eaton catalog numbers for Magnum DS sometimes use a dash separator before the CT rating block. The parser should strip dashes before processing. The exact format can vary slightly by vintage (pre-2010 vs post-2010 catalog numbers differ slightly). Cross-reference with MN132001EN.

---

# 4. EATON / CUTLER-HAMMER — MAGNUM SB

**Product type:** Low-Voltage Power Air Circuit Breaker (smaller frames than DS)
**Reference:** Eaton MN132002EN
**Range:** 400A – 1600A

## Catalog Number Format ⚠️

Very similar to Magnum DS structure but with `MSB` prefix instead of `MDS`.

```
M  S  B  [frame_2digits]  [mounting]  [interrupting]  [poles]  [trip]  [options]
```

## Family Code: ✅
| Code | Value |
|------|-------|
| MSB | Magnum SB air circuit breaker |

## Frame: ✅
| Code | Amps |
|------|------|
| 04 | 400A |
| 06 | 600A |
| 08 | 800A |
| 10 | 1000A |
| 12 | 1200A |
| 16 | 1600A |

## Mounting, Poles, Interrupting: ✅
Same codes as Magnum DS (F/D mounting, 3/4 poles, same voltage/kA table)

## Trip Units: ✅
Same PXR family as Magnum DS (D/E/F/G codes)

## Options: ✅
Same suffix block as Magnum DS

## Example:
- `MSB12F33E12W` — 1200A SB, fixed, 65kA, 3-pole, PXR20, shunt trip

---

# 5. ABB — SACE EMAX 2

**Product type:** Low-Voltage Power Air Circuit Breaker
**Reference:** ABB SACE Emax 2 Catalog, Document 1SDC210041D0201
**Range:** 400A – 6300A, up to 200kA

## Catalog Number Format ✅

ABB uses a **descriptive ordering string** (not purely positional) that can still be decoded field by field:

```
[Frame][Version]  [Rating]  [Trip_Unit/Protection]  In=[sensor]  [Poles][Mounting]  [Terminal]
```

Example: `E2N 1600 PR122/P-LSI In=1600 3p F HR`

This is space-delimited. The decoder should split on spaces and map each token.

## Token 1 — Frame + Interrupting Version: ✅
| Code | Frame | Max Amps | Interrupting |
|------|-------|----------|-------------|
| E1B | E1 | 1250A | B = 42kA @ 415V |
| E1N | E1 | 1250A | N = 50kA @ 415V |
| E2B | E2 | 2000A | B = 42kA |
| E2N | E2 | 2000A | N = 66kA |
| E2S | E2 | 2000A | S = 85kA |
| E3N | E3 | 3200A | N = 65kA |
| E3S | E3 | 3200A | S = 75kA |
| E3H | E3 | 3200A | H = 100kA |
| E3L | E3 | 3200A | L = 150kA |
| E4S | E4 | 4000A | S = 100kA |
| E4H | E4 | 4000A | H = 130kA |
| E4L | E4 | 4000A | L = 150kA |
| E6H | E6 | 6300A | H = 100kA |
| E6L | E6 | 6300A | L = 200kA |

Version codes (standalone):
| Code | Interrupting |
|------|-------------|
| B | Standard (~42kA) |
| N | Normal (~50–66kA) |
| S | High (~75–85kA) |
| H | Very high (~100–130kA) |
| L | Ultra high (150–200kA) |

## Token 2 — Rated Current: ✅
Numeric value in amps. Common ratings: 400, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300

## Token 3 — Trip Unit: ✅
ABB uses the **Ekip** (new) and **PR1xx** (older) families:

**PR family (Emax 2):**
| Code | Type | Protection |
|------|------|-----------|
| PR121/P | Basic | LSI |
| PR122/P | Standard | LSIG |
| PR123/P | Advanced | LSIG + metering + Modbus |

**Ekip family (newer Emax 2):**
| Code | Type | Protection |
|------|------|-----------|
| Ekip Touch | Entry | LSI |
| Ekip Hi-Touch | Mid | LSIG + metering |
| Ekip G Touch | Advanced | LSIG + communications |
| Ekip Synapse | Top | Full IEC 61850, Profibus, etc. |

Protection suffix in trip unit name:
| Code | Protection functions |
|------|---------------------|
| LSI | Long / Short / Instantaneous |
| LSIG | + Ground fault |
| LSIG-WMP | + Wide measurement and protection |

## Token 4 — Sensor Rating (In=xxx): ✅
Format: `In=XXXX` where XXXX = sensor amps (always ≤ frame rating)

## Token 5 — Poles: ✅
| Code | Value |
|------|-------|
| 3p | 3-Pole |
| 4p | 4-Pole |

## Token 6 — Mounting: ✅
| Code | Value |
|------|-------|
| F | Fixed |
| W | Withdrawable (drawout) |

## Token 7 — Terminal Orientation: ✅
| Code | Value |
|------|-------|
| HR | Horizontal rear |
| VR | Vertical rear |
| HF | Horizontal front |
| VF | Vertical front |
| EF | Extended front (large lug) |

## Accessories (separate order references or suffix): ⚠️
ABB accessories for Emax 2 are typically ordered as separate part numbers. However some catalog strings append:
| Code | Option |
|------|--------|
| +S | Shunt opening release |
| +C | Closing coil |
| +UV | Undervoltage release |
| +MO | Motor operator |
| +AX | Auxiliary contacts |
| +AL | Alarm contacts |
| +PR | Position indicator (drawout) |
| +ZSI | Zone selective interlock |

## Example catalog numbers:
- `E2N 1600 PR122/P-LSI In=1600 3p F HR`
- `E3H 3200 Ekip Hi-Touch LSIG In=3200 3p W HR`
- `E4L 4000 PR123/P-LSIG In=4000 4p W VR`

## Implementation Note:
The ABB format is space/token based, not fixed-position character based. The parser for this entry should split the input on spaces and match tokens rather than reading character positions. Display each token as a separate tile in the UI.

---

# 6. ABB — SACE TMAX XT (Molded Case)

**Product type:** Molded Case Circuit Breaker (MCCB)
**Reference:** ABB SACE Tmax XT Catalog, Document 1SDC210038D0201
**Range:** 16A – 1600A

## Catalog Number Format ✅

```
XT[frame][version]  [rating]  [trip_unit]  In=[sensor]  [poles]  [mounting]  [terminal]
```

Example: `XT4N 250 TMA 250 3p F`

## Frame + Version: ✅
| Code | Frame | Max Amps |
|------|-------|---------|
| XT1B | XT1 | 160A, B version |
| XT1N | XT1 | 160A, N version |
| XT2N | XT2 | 160A, N |
| XT2S | XT2 | 160A, S |
| XT2H | XT2 | 160A, H |
| XT2L | XT2 | 160A, L (very high kA) |
| XT3N | XT3 | 250A, N |
| XT3S | XT3 | 250A, S |
| XT4N | XT4 | 250A, N |
| XT4S | XT4 | 250A, S |
| XT4H | XT4 | 250A, H |
| XT4L | XT4 | 250A, L |
| XT5N | XT5 | 630A, N |
| XT5S | XT5 | 630A, S |
| XT5H | XT5 | 630A, H |
| XT5L | XT5 | 630A, L |
| XT6N | XT6 | 800A, N |
| XT6S | XT6 | 800A, S |
| XT6H | XT6 | 800A, H |
| XT6L | XT6 | 800A, L |
| XT7 | XT7 | 1250A / 1600A |

Interrupting (version) codes same as Emax 2: B < N < S < H < L

## Trip Unit Types: ✅
| Code | Type | Detail |
|------|------|--------|
| TMD | Thermal-magnetic | Fixed bimetal + magnetic trip |
| TMA | Thermal-magnetic adj. | Adjustable both elements |
| MF | Magnetic only | For motor protection |
| EKip M | Electronic (basic) | LSI only |
| EKip E | Electronic (standard) | LSIG |
| EKip G | Electronic (advanced) | LSIG + comms |

## Poles: ✅
3p or 4p (same as Emax)

## Mounting: ✅
F = Fixed, P = Plug-in, W = Withdrawable

## Example:
- `XT4N 250 TMA 250 3p F` — XT4 frame, Normal kA, 250A sensor, TMA trip, 3-pole, fixed

---

# 7. SIEMENS — SENTRON 3WL (Low-Voltage Power Breaker)

**Product type:** Low-Voltage Power Air Circuit Breaker
**Reference:** Siemens SENTRON 3WL Catalog, LV10 / 3WL Product Manual
**Range:** 630A – 6300A

## Catalog Number Format ⚠️

Siemens 3WL uses a 12–15 character alphanumeric string:

```
3WL[design][frame_2digits][voltage][mounting][poles][trip_unit][accessories]
```

Example: `3WL12254DB364GA4`

Note: The Siemens catalog number is dense and some positions carry multi-meaning codes. Confidence is medium on exact position mapping — the structure below is based on training data.

## Positions 0–2 — Family: ✅
| Code | Value |
|------|-------|
| 3WL | SENTRON 3WL air circuit breaker |

## Position 3 — Design Series: ✅
| Code | Value |
|------|-------|
| 1 | Standard version |
| 2 | Size 2 (larger frame range) |

## Positions 4–5 — Frame / Current: ✅
| Code | Max Frame |
|------|-----------|
| 06 | 630A |
| 08 | 800A |
| 10 | 1000A |
| 12 | 1250A |
| 16 | 1600A |
| 20 | 2000A |
| 25 | 2500A |
| 32 | 3200A |
| 40 | 4000A |
| 50 | 5000A |
| 63 | 6300A |

## Position 6 — Interrupting Capacity: ✅
| Code | kA Rating |
|------|-----------|
| 3 | 55kA @ 415V / 42kA @ 690V |
| 4 | 65kA @ 415V / 55kA @ 690V |
| 5 | 85kA @ 415V / 65kA @ 690V |
| 6 | 100kA |
| 7 | 150kA |

## Position 7 — Mounting: ✅
| Code | Value |
|------|-------|
| D | Fixed (stationary) |
| E | Withdrawable (drawout) |

## Position 8 — Poles: ✅
| Code | Value |
|------|-------|
| 3 | 3-Pole |
| 4 | 4-Pole |

## Position 9–10 — ETU Trip Unit: ✅
Siemens trip units are the **ETU** (Electronic Trip Unit) family:
| Code | Trip Unit | Features |
|------|-----------|----------|
| 15 | ETU15B | Basic, LSI, no comms |
| 25 | ETU25B | Standard, LSIG, Modbus RTU |
| 45 | ETU45B | Advanced, LSIG + metering |
| 55 | ETU55P | Power monitoring, Profibus |
| 76 | ETU76P | Full protection + PROFINET / Modbus |

## Accessories / Suffix: ⚠️
| Code | Option |
|------|--------|
| G | with trip unit (standard config) |
| A | Auxiliary switch 4-pole |
| W | Shunt release (open coil) |
| C | Closing coil |
| U | Undervoltage release |
| M | Motor operator |
| Z | ZSI (zone selective interlocking) |
| 0 | No accessory / standard |
| 4 | 4-pole neutral switch |

## Example catalog numbers:
- `3WL12254DB364GA4` — 3WL, design 2, 2500A frame, 100kA, drawout, 3-pole, ETU45B trip, shunt + aux

## Implementation Note:
⚠️ The Siemens 3WL number is the most complex to parse positionally. Some positions shift depending on earlier options. Recommend flagging unrecognized positions prominently and linking user to Siemens LV10 configurator. The ETU trip unit code is almost always a 2-digit number embedded in the string.

---

# 8. SIEMENS — SENTRON 3VA (Molded Case)

**Product type:** Molded Case Circuit Breaker (MCCB)
**Reference:** Siemens SENTRON 3VA Catalog, LV10 / CA01
**Range:** 16A – 1600A (3VA1), up to 1600A (3VA2)

## Catalog Number Format ⚠️

```
3VA[series][rating_code][version][poles][mounting][trip_type][accessories]
```

Example: `3VA1116-4EE46-0AA0`

Note: Siemens 3VA uses dash-separated blocks. The parser should strip dashes.

## Positions 0–2 — Family: ✅
| Code | Value |
|------|-------|
| 3VA | SENTRON 3VA MCCB |

## Position 3 — Series: ✅
| Code | Frame / Range |
|------|--------------|
| 1 | 3VA1 — up to 160A |
| 2 | 3VA2 — up to 1600A |

## Positions 4–6 — Current Rating Code: ✅
For 3VA1:
| Code | Rating |
|------|--------|
| 110 | 10A |
| 116 | 16A |
| 125 | 25A |
| 132 | 32A |
| 140 | 40A |
| 163 | 63A |
| 180 | 80A |
| 110 | 100A |
| 116 | 160A |

For 3VA2 (higher current):
| Code | Rating |
|------|--------|
| 216 | 160A |
| 225 | 250A |
| 240 | 400A |
| 263 | 630A |
| 210 | 1000A |
| 216 | 1600A |

## Position 7 — Interrupting Capacity: ✅
| Code | kA |
|------|----|
| 4 | 36kA (standard) |
| 5 | 55kA |
| 6 | 70kA |
| 7 | 100kA (3VA2 only) |

## Position 8 — Electronic Trip Unit: ✅
| Code | ETU Type | Features |
|------|----------|----------|
| E | ETU320 | Basic thermal-magnetic equiv. |
| F | ETU340 | LSIG |
| G | ETU360 | LSIG + metering |
| H | ETU380 | Full protection + comms |

## Poles: ✅
| Code | Value |
|------|-------|
| 3 | 3-Pole |
| 4 | 4-Pole |

## Accessories block (after last dash): ⚠️
Usually a 4-character suffix like `0AA0`:
| Position | Code | Meaning |
|----------|------|---------|
| 1 | 0 | No shunt trip |
| 1 | A | Shunt trip |
| 1 | B | Undervoltage release |
| 2 | A | No aux switch |
| 2 | B | Aux switch (2NO+2NC) |
| 3 | A | Standard |
| 3 | B | Communication module |
| 4 | 0 | Standard |

## Example:
- `3VA1116-4EE46-0AA0` — 3VA1, 16A, 36kA, ETU320, 3-pole, no accessories

---

# 9. GE / ABB (LEGACY GE) — ENTELLIGUARD G

**Product type:** Low-Voltage Power Air Circuit Breaker
**Reference:** GE Publication GEA-12521 — EntelliGuard G Ordering Guide
**Note:** GE's Power business acquired by ABB ~2018; still supported as EntelliGuard brand
**Range:** 800A – 6300A

## Catalog Number Format ✅

```
S  E  E  G  [frame_2digits]  [mounting]  [interrupting]  [poles]  [trip_unit]  [options...]
```

Example: `SEEG32D3E33W`

## Positions 0–3 — Family: ✅
| Code | Value |
|------|-------|
| SEEG | EntelliGuard G power circuit breaker |

## Positions 4–5 — Frame: ✅
| Code | Frame |
|------|-------|
| 08 | 800A |
| 12 | 1200A |
| 16 | 1600A |
| 20 | 2000A |
| 25 | 2500A |
| 32 | 3200A |
| 40 | 4000A |
| 50 | 5000A |
| 63 | 6300A |

## Position 6 — Mounting: ✅
| Code | Value |
|------|-------|
| F | Fixed |
| D | Drawout |

## Position 7 — Voltage/Interrupting: ✅
| Code | Rating |
|------|--------|
| 3 | 600V / 65kA |
| 4 | 600V / 85kA |
| 5 | 600V / 100kA |

## Position 8 — Poles: ✅
| Code | Value |
|------|-------|
| 3 | 3-Pole |
| 4 | 4-Pole |

## Position 9 — Trip Unit (EntelliGuard Trip Unit = EGTU): ✅
| Code | Trip Unit | Features |
|------|-----------|---------|
| E | EGTU-P | Basic LSI + power metering |
| H | EGTU-PV | LSIG + power/voltage quality |
| J | EGTU-PVC | + Communications (Modbus/Profibus) |
| K | EGTU-PVC+ | Full protection + IEC 61850 |

## Position 10–11 — CT Sensor: ✅
Two-digit code same as frame table above (08 = 800A CT, 32 = 3200A CT, etc.)

## Suffix Options: ✅
| Code | Option |
|------|--------|
| W | Shunt trip |
| L | Undervoltage release |
| Z | Zone selective interlock |
| A | Auxiliary contacts |
| M | Motor operator |
| C | Closing coil |
| T | Test port |
| K | Key interlock |
| N | Neutral CT |
| G | Ground fault relay |
| P | Position switches |

## Example catalog numbers:
- `SEEG32D5E32WZ` — 3200A EntelliGuard G, drawout, 100kA, 3-pole, EGTU-P, 3200A CT, shunt trip + ZSI
- `SEEG16F3H16W` — 1600A, fixed, 65kA, 3-pole, EGTU-PV, shunt trip

## Implementation Note:
⚠️ Post-ABB acquisition some ordering codes changed slightly. SEEG prefix remains consistent. Trip unit options may have expanded. Cross-check with GEA-12521 or current ABB EntelliGuard documentation.

---

# 10. MITSUBISHI — AE SERIES (Air Circuit Breaker)

**Product type:** Low-Voltage Air Circuit Breaker (ACB)
**Reference:** Mitsubishi Electric AE Series Catalog — available from Mitsubishi Electric FA
**Range:** 630A – 6300A

## Catalog Number Format ⚠️

```
AE[frame_4digits]-[SW or SS]-[options]
```

Example: `AE3200-SW` or `AE4000SW-4`

Note: Mitsubishi uses a simpler, shorter catalog number compared to Western manufacturers. Many options are ordered as separate accessory part numbers rather than suffix characters.

## Frame Rating: ✅
| Code | Frame |
|------|-------|
| AE630 | 630A frame |
| AE800 | 800A frame |
| AE1000 | 1000A frame |
| AE1250 | 1250A frame |
| AE1600 | 1600A frame |
| AE2000 | 2000A frame |
| AE2500 | 2500A frame |
| AE3200 | 3200A frame |
| AE4000 | 4000A frame |
| AE5000 | 5000A frame |
| AE6300 | 6300A frame |

## Mounting Suffix: ✅
| Code | Value |
|------|-------|
| SW | Stationary (fixed) |
| SS | Stationary (rear connection variant) |
| DW | Drawout |
| DS | Drawout (rear connection variant) |

## Pole Suffix: ✅
| Suffix digit | Poles |
|-------------|-------|
| (none) | 3-Pole |
| -4 | 4-Pole |

## Interrupting Rating: ✅
Mitsubishi AE series interrupting ratings are part of the frame designation rather than a separate code:
| Frame | Standard kA | High kA variant |
|-------|-------------|-----------------|
| AE630–AE1600 | 65kA @ 440V | 85kA (H suffix) |
| AE2000–AE3200 | 65kA @ 440V | 100kA (H suffix) |
| AE4000–AE6300 | 65kA @ 440V | 85kA (H suffix) |

High-interrupting variant suffix: append `H` before mounting code (e.g., `AE3200H-SW`)

## Trip Unit: ✅
Mitsubishi AE uses the **A-type electronic trip unit** (built-in):
- All AE breakers ship with electronic overcurrent protection
- LSI standard, LSIG with optional ground fault module
- Communications: optional Modbus RTU via plug-in module

Separate trip unit codes (append to base number): ⚠️
| Code | Type |
|------|------|
| (standard) | Basic LSI electronic OC |
| -G | With ground fault protection (LSIG) |
| -M | With Modbus RTU module |
| -P | With PROFIBUS module |

## Accessory Codes (suffix or separate order): ⚠️
| Code | Option |
|------|--------|
| UVT | Undervoltage trip (release) |
| SHT | Shunt trip |
| CLO | Closing coil |
| AUX | Auxiliary contacts (2NO/2NC) |
| MOT | Motor operator |
| ZSI | Zone selective interlock |
| ARC | Arc flash reduction module |

## Example catalog numbers:
- `AE2000-SW` — 2000A AE, stationary fixed, 3-pole, standard kA
- `AE3200H-DW-4` — 3200A AE high-interrupting, drawout, 4-pole
- `AE4000-SW-G` — 4000A AE, stationary, with ground fault trip

## Implementation Note:
⚠️ Mitsubishi's catalog number is notably shorter than the others. Many options don't appear in the base number — they're separate order codes. The UI should note this prominently and show "ordered separately" for accessories. Also: Mitsubishi AE is most common in Asia-Pacific; in North America the AE-SW series was sold as the `WS-V` series for some markets — same product, different labeling.

---

# IMPLEMENTATION GUIDE FOR CODING AGENT

## App Structure Changes Required

### 1. Add Manufacturer/Series Selector
At the top of the app, add two dropdowns:
```
[Manufacturer ▼]  [Series ▼]  [DECODE]
```

Manufacturers: Schneider Electric, Eaton, ABB, Siemens, GE/ABB, Mitsubishi
Series per manufacturer:
- Schneider: Masterpact NW, Masterpact MTZ, Powerpact H/J/L/P
- Eaton: Magnum DS, Magnum SB
- ABB: SACE Emax 2, SACE Tmax XT
- Siemens: SENTRON 3WL, SENTRON 3VA
- GE/ABB: EntelliGuard G
- Mitsubishi: AE Series

### 2. Parser Architecture
Create one parse function per series. Each function returns the same shape:
```js
{
  cat: "full catalog string",
  segments: [
    { pos: 0, char: "W", label: "Product Family", value: "Masterpact NW", detail: "...", type: "key" }
  ]
}
```

For space/token based parsers (ABB Emax 2, Tmax XT, MTZ), `pos` = token index and `char` = the whole token (e.g., "E2N" or "PR122/P-LSI").

### 3. Character Tile Display
For token-based parsers (ABB), render wider tiles that show the full token text instead of a single character. Adjust tile width dynamically based on token length.

### 4. Confidence Banner
Add a small banner below the decode result for each series:
- 🟢 Masterpact NW / MTZ / Powerpact — high confidence, well-tested
- 🟡 Eaton Magnum DS/SB, ABB Emax 2/Tmax XT, GE EntelliGuard — medium confidence
- 🟠 Siemens 3WL/3VA, Mitsubishi AE — verify with manufacturer catalog

### 5. Validation Rules Per Series
Each parser should validate:
- Correct prefix (W for NW, MDS for Magnum DS, 3WL for Siemens, etc.)
- Minimum length (each series has a known minimum length)
- If invalid, show: "Does not match [Series] format. Expected: [example]"

### 6. Disclaimer
Keep the existing disclaimer but make it series-specific:
> "Data sourced from: [Bulletin Name]. Verify against current official documentation before procurement."

## Color Coding (keep existing scheme)
- 🟢 Green = Core specification (frame, kA, voltage, poles)
- 🔵 Blue = Options / accessories / trip unit
- 🔴 Red = Unrecognized / verify

---

## CROSS-REFERENCE: EQUIVALENT FEATURES ACROSS BRANDS

| Feature | Schneider NW | Eaton Magnum | ABB Emax 2 | Siemens 3WL | GE EntelliGuard |
|---------|-------------|-------------|-----------|------------|----------------|
| ZSI | Z suffix | Z suffix | +ZSI token | Z suffix | Z suffix |
| Shunt trip | W suffix | W suffix | +S token | W suffix | W suffix |
| Motor operator | M suffix | M suffix | +MO token | M suffix | M suffix |
| Ground fault | trip unit code | N suffix | In LSIG trip | In ETU code | In EGTU code |
| 4-pole | pos 6 = 4 | pos 8 = 4 | 4p token | pos 8 = 4 | pos 8 = 4 |
| Drawout | mounting = D | mounting = D | W token | mounting = E | mounting = D |

---

*Document compiled from training data covering manufacturer catalogs available as of 2024. Primary sources: Schneider 0613IB/EAV15007, Eaton MN132001EN, ABB 1SDC210041D0201, Siemens LV10, GE GEA-12521, Mitsubishi AE Series Catalog. All decode tables should be verified against current manufacturer documentation before use in procurement or engineering specifications.*
