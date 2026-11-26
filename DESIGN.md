# GrandHacks design

How the site looks and why, taken from the code as it stands. Tokens live in `app/globals.css` (`:root`); section styles live next to their section in `app/sections/*.css`.

## Direction

Elite, rich, minimal, bold. The site is a walk across the Golden Gate at golden hour: a painted hero, then full-bleed "rooms" whose colors are sampled from that painting. Gold is the one loud color; everything else is ink, cream, and muted grounds. Restraint does the luxury work: one accent per heading, one primary button per view, generous space, no gradients on flat UI except the brand gold.

## Color

| Token | Hex | Use |
| --- | --- | --- |
| `--ink` | `#14100b` | Text on light grounds, page background, logo tile |
| `--cream` | `#fbf4e6` | Text on dark grounds, cards, the name tag |
| `--gold` | `#e8b44a` | The brand color: primary buttons, the register pill, selection, the G |
| `--pale` | `#f6dfa4` | Hover for gold buttons, countdown digits, soft gold accents |
| `--deep` | `#a8771f` | Shadowed gold: gradient ends, caret, logo bronze |

Room grounds, all sampled from the hero painting:

| Token | Hex | Section |
| --- | --- | --- |
| `--fog` | `#d5dad6` | About, Schedule entrance, FAQ, Parents, info dialogs |
| `--sky` | `#1f5462` | Tracks |
| `--graphite` | `#202224` | Prizes |
| `--steel` | `#a8361a` | Sponsors (the bridge's red) |
| `--deep-sky` | `#17434e` | Footer, full-screen menu |

Rules:
- Gold is for action and brand only. Don't use it as a section ground or for body text.
- Each room sets `data-tone`; the header reads it and takes that room's `--bar` and `--bar-ink`, so the bar always matches the room under it. A new section needs a `data-tone`.
- Text on dark grounds is cream, dropped to 72–84% opacity for secondary copy (`rgb(251 244 230 / 0.84)`), never grey.
- Hairlines and borders are cream or pale at low alpha (`0.14`–`0.6`), not solid colors.
- Flat grounds carry the canvas grain: `url("/media/canvas.webp") 0 0 / 96px var(--bar)`.

## Type

| Role | Face | Setting |
| --- | --- | --- |
| Display | Barlow Condensed Bold (`--display`) | Hero title and the two giant `.beat` lines only. Uppercase, line-height 0.84–0.9, `-0.025em` |
| Headings | DM Sans 500 | `.head` `clamp(36px, 4.4vw, 76px)/1.02`, `-0.045em`, `text-wrap: balance` |
| Accent | Instrument Serif italic (`--accent`) | Exactly one word per heading, via `<Accent parts={[before, word, after]} />` |
| Body | DM Sans 400 | `clamp(17px, 1.2vw, 22px)/1.5` in rooms; `.lead` 500 at up to 34px |
| Labels | Space Mono (`--mono`) | `small`, `.pill`, countdown: 14px, uppercase |
| Pixel | Jersey 10 (`--pixel`) | Tiny decorative accents only |

Rules:
- Tight tracking everywhere (negative letter-spacing); the bigger the text, the tighter.
- Headings are weight 500, not bold. Bold weight belongs to the display face.
- Measure: `.text` max 34em, `.lead` max 21em.

## Logo

The monogram (`app/components/monogram.tsx`): a gold G on a rounded ink tile (`rx 10` on 40), shading pale → gold → deep, with a cream four-point spark at its open end and a 28%-gold hairline border. It carries its own tile, so it reads on every bar tone. Size: 32px in the header, 30px on phones. Beside it, "GrandHacks" in DM Sans 700 17px once the bar is compact; over the hero, a cycling pixel icon stands in for the word.

The older pixel `<G>` mark (`Mark` in `app/components/pixel.tsx`) remains on the name tag and in `app/icon.svg`.

## Layout

- Page margin: `--margin` = `clamp(20px, 4.445vw, 96px)`; content max width 1900px (`.wrap`).
- Column gap: `--gap` = `clamp(12px, 1.67vw, 28px)`; grids are 12 columns.
- Rooms: `padding-block: clamp(92px, 14.2svh, 140px) 64px`, full-bleed color, sized against the viewport (`svh`) so each reads as a scene.
- Header: fixed, 56px (48px on phones), transparent gradient over the hero, solid room color after.
- Breakpoints: `720px` (phone: hamburger menu, stacked hero title) and `900px` (header drops the wordmark).

## Components

- **Buttons:** fully rounded (`100px`). `.btn` 52px tall, `.barRegister` 36px, `.pill` 38px. Gold ground, ink text, DM Sans 600; hover goes to `--pale`, press nudges down 1px. No outlines or ghost variants for primary actions.
- **Text links:** `.textLink`, 600 weight, 2px underline at 5px offset, thickening to 3px on hover.
- **Cards:** cream at 95% on imagery, `16px` radius. Dialogs are fog with a near-square `2px` radius; the menu is a full-screen deep-sky sheet.
- **Close buttons:** 38px circles with a 1px border.
- **Countdown:** mono digits in pale on 76% ink, pale hairline, `3px` radius.

## Motion

- Dialogs rise in: `0.45s cubic-bezier(0.16, 1, 0.3, 1)` from 30px; close in `0.23s`.
- Color changes run 0.15–0.25s. Nothing bounces.
- Pixel icons build row by row with `steps()`, the only deliberately "digital" motion.
- `prefers-reduced-motion` turns off all animation and the hero video. Anything new must respect it.

## Imagery

The Golden Gate painting and film (`public/media/golden-gate*`) are the hero; bridge stills in fog, gold, and night set later moods. Illustrations (skyline, podium, medals) are drawn in code. The hero carries a warm brown scrim so cream type stays legible; keep that contrast if the image changes.

## Accessibility

- Focus: `3px solid currentColor`, 4px offset, on everything.
- Skip link, `aria-current` on the active nav item, labelled dialogs.
- Body text keeps at least 4.5:1 against its room; check new tones before using them.
