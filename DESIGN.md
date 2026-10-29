# FitFaat - Design Language

FitFaat uses a **playful** visual style: bright colours, rounded
shapes, heavy dark outlines, and buttons and cards that look like
they can be pressed.

The style borrows the look of a game, not its mechanics.
Do not add XP, levels, streaks, badges, leaderboards, or friend
challenges. They are not in `docs/requirements/requirements.md`.

The Figma file is the source of truth for components.
This document explains how to use them.

## Figma

File: [FitFaat](https://www.figma.com/design/Hdg7b2cFmstlGmipSqjqB8/FitFaat)

| What | Where |
| --- | --- |
| Playful kit: colours, type, components, icons | [Style Guide → Playful kit](https://www.figma.com/design/Hdg7b2cFmstlGmipSqjqB8/FitFaat?node-id=29-103) |
| Reference screens: landing, login, sign-up | [Landing & Auth → Playful redesign](https://www.figma.com/design/Hdg7b2cFmstlGmipSqjqB8/FitFaat?node-id=30-523) |
| Feature screens | Member Features page, one section per member |

Rules for working in Figma:

- Design feature screens in this file, on the Member Features page.
  Copies in other files lose their link to the kit and will not
  receive updates.
- Use component instances and the `playful/*`, `brand/*`, `ink/*`,
  `text/*`, and `surface/*` variables. Do not type hex values or
  detach components.
- Use only the `Playful/*` text styles. The older Barlow Condensed
  and Inter styles belong to the first draft and are superseded.
- If a component is missing, add it to the Playful kit as a
  component and tell the team. Do not draw a one-off copy.
- Name frames `Feature — Device / State`, for example
  `Food diary — Desktop / Empty`.

## Colour

### Base

| Token | Hex | Use |
| --- | --- | --- |
| `playful/cream` | `#FBFDF6` | Page background |
| `surface/canvas` | `#FFFFFF` | Cards, fields, alternate sections |
| `playful/track` | `#EAF0E0` | Progress-bar tracks, quiet fills |
| `ink/900` | `#0E0F0C` | Outlines, headings, primary text |
| `text/body` | `#4A4D45` | Body copy |
| `text/muted` | `#7C8076` | Helper text and captions only |
| `playful/field-border` | `#CBD5BE` | Unselected input and chip borders |
| `brand/lime` | `#A3E957` | Primary buttons, selected chips |
| `brand/lime-pale` | `#E8F9D6` | Lime tiles, auth side panel |

### Feature colours

Each feature area has one colour. Use it for that area's tiles,
pills, icons, and empty-state illustrations, so users can tell
the areas apart.

| Feature area | Colour | Main | Ink (text and icons) | Pale (fills) |
| --- | --- | --- | --- | --- |
| Exercise library | Lime | `#A3E957` | `#3F7A0E` | `#E8F9D6` |
| Workout log | Orange | `#FF8A3D` | `#C2520F` | `#FFF1E6` |
| Workout plans, profile | Purple | `#8B6CF0` | `#5B3FC8` | `#F1ECFF` |
| Food diary, food photos | Blue | `#3AA0D8` | `#1A6A9E` | `#E3F3FC` |
| Recipes, meal planning | Yellow | `#FFC93C` | `#8A6400` | `#FFF6D6` |
| Measurements, progress | Pink | `#F06292` | `#B02A55` | `#FFE9EF` |

The dashboard combines all of them, with each card in the colour
of the feature it links to.

Purple is also the shared colour for focus and selection
(focused input border, selected goal option).

### Data and status

| Token | Hex | Use |
| --- | --- | --- |
| `data/protein` | `#38BDF8` | Protein in charts and macro bars |
| `data/carbs` | `#FFB547` | Carbohydrates |
| `data/fat` | `#F47CAB` | Fat |
| `status/success` | `#2EAD4B` | Saved, completed |
| `status/warning` | `#FFC21A` | Warnings |
| `status/error` | `#D93036` | Errors, destructive actions |
| `status/error-bg` | `#FDECEC` | Error banner background |

### Colour rules

- Put dark text (`ink/900`) on lime and the other bright colours.
  White text on lime has a 1.5:1 contrast ratio and is unreadable.
- Put coloured text only on its own pale fill, using the ink
  shade (for example, purple ink on purple pale).
- Never use colour as the only signal. Pair it with text or an icon.

## Typography

The only font is **Nunito** (Google Fonts), in the weights Medium 500,
Bold 700, ExtraBold 800, and Black 900.

| Style | Weight / size | Line height | Use |
| --- | --- | --- | --- |
| `Playful/Display L` | Black 64 | 105%, −1.5% tracking | Desktop landing hero |
| `Playful/Display M` | Black 48 | 108%, −1.5% | Mobile hero, big numbers |
| `Playful/Heading H1` | Black 36 | 115%, −1.5% | Page titles |
| `Playful/Heading H2` | Black 28 | 120% | Section titles |
| `Playful/Heading H3` | ExtraBold 20 | 125% | Card titles |
| `Playful/Title` | ExtraBold 16 | 130% | List items, small headings |
| `Playful/Body L` | Medium 18 | 155% | Intro paragraphs |
| `Playful/Body M` | Medium 16 | 150% | Default body text |
| `Playful/Body S` | Medium 14 | 145% | Secondary text |
| `Playful/Label` | ExtraBold 14 | 130% | Input labels |
| `Playful/Caption` | Bold 12 | 135% | Helper text, pills, units |
| `Playful/Button M` | ExtraBold 16 | 125% | Medium buttons |
| `Playful/Button S` | ExtraBold 14 | 125% | Small buttons |

Use sentence case everywhere. Do not set text in all capitals.

## Shape and Spacing

**The chunky border** is the signature of the style. Buttons, tiles,
cards, and goal options have an `ink/900` outline that is
**2px on the top and sides and 4px on the bottom**. Chips and day
toggles use 2px and 3px.

| Element | Corner radius |
| --- | --- |
| Buttons, input fields | 14 |
| Goal options | 18 |
| Feature tiles, cards | 20 |
| Chips, pills, day toggles | Fully rounded (999) |

Spacing uses a 4px scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.

| Layout | Desktop (1440) | Mobile (390) |
| --- | --- | --- |
| Page side padding | 80 | 20 |
| Section top and bottom padding | 96 | 48 |
| Gap between section title and content | 48 | 24 |
| Gap between cards in a grid | 24 | 16 |

Avoid drop shadows on playful components. The thick bottom border
already gives depth.

## Components

| Component | Variants | Notes |
| --- | --- | --- |
| Playful Button | Primary (lime), Secondary (white), Dark; sizes M (56px) and S (44px) | Use one Primary button per view. Dark is for use on lime or pale panels. |
| Playful Input | Default, Focus, Error | Label above, 54px field, optional helper text below. Focus uses a purple border; Error uses a red border with red helper text. |
| Feature Tile | Lime, Orange, Purple, Blue, Yellow, Pink | Icon, title, and description. Pick the colour for its feature area. |
| Goal Option | Selected, not selected | Large icon card for single-choice questions. |
| Choice Chip | Selected, not selected | Rounded pill for one or several short options. |
| Day Toggle | Selected, not selected | 44px circle for each day of the week. |
| Step Header | Steps 1–3 | Progress bar and "Step X of 3" for multi-step forms. |
| Pill | Purple, Orange, Lime | Small tag for labels such as "Example" or a status. |
| Playful Logo | Light, Dark | Light on cream or white, Dark on ink. |
| Auth Side Panel | — | Left half of the desktop login and sign-up screens. |

Icons are [Tabler Icons](https://tabler.io/icons), outline style,
2px stroke, in the `Icon/*` components. In code, use the same icon
names from the Tabler set.

## Screen Rules

These come from `docs/requirements/requirements.md` and apply to every
feature screen.

- **Design four states** for every data screen: loading, empty,
  error, and populated. Empty states explain what to do next and
  show a button that does it ("Log your first workout").
- **Design desktop (1440) and mobile (390)** versions of every screen.
- **Use realistic example data** in Figma that follows the shared data
  rules: kg, cm, g, and kcal, shown beside each value.
  Mark preview content as example data, as the landing page does.
- **Show only features in the requirements.** No social feeds, sharing,
  wearables, or chatbots.
- **No personal photos.** The only photo upload is the optional food
  photo on a food-diary entry, and its upload area must say it is for
  a food photo.
- **Show photo-based nutrition estimates as suggestions** that the
  user reviews and confirms before saving.
- **Forms** label every field, explain errors in plain words beside
  the field, and keep the main action as a Primary button.
- **Touch targets** are at least 44 × 44px.

## In Code

- Load Nunito from Google Fonts with weights 500, 700, 800, and 900.
- Define the colours above as CSS custom properties in
  `client/src/styles/`, using the Figma token names
  (`--playful-cream`, `--brand-lime`, `--ink-900`, and so on).
- Build the components above once in `client/src/components/` and
  reuse them in every feature.
- Give every interactive element a visible focus style. Use the
  purple ink colour (`#5B3FC8`) to match the Focus input.
- Press effect (optional): on `:active`, move the button 2px down
  and reduce the bottom border to 2px. Skip this movement when the
  user prefers reduced motion.

## Known Issues

These are open problems in the current kit. Fix them in Figma
before building the matching code.

- `text/muted` on cream is 3.9:1, below the 4.5:1 WCAG AA minimum
  for small text. Use `text/body` for anything the user must read.
- Orange ink on orange pale is 4.2:1, slightly below AA for
  12px pill text.
- The `playful/field-border` colour is 1.5:1 against white, below
  the 3:1 that WCAG asks for input borders.
- The signed-in app shell (navigation bar or sidebar) is not
  designed yet. Agree on it as a team before designing feature
  screens, so they all share the same layout.
