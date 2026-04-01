# Imposto Real — Copilot Instructions

## Project overview

Single-file web app (`index.html`) that shows an alternative perspective on Brazilian tax burden. No frameworks, no dependencies. All HTML, CSS, and JavaScript live in one file.

## Stack constraints

- Vanilla HTML + CSS + JavaScript (ES5-compatible) only
- Everything in a single `index.html` — no separate files, no build step
- No external libraries, CDNs, package managers, or imports
- SVG icons must be inline (outline style, `stroke-width: 2`, thin, modern)

## Concept & tone

The app presents a **mathematical alternative**, not a critique of the nota fiscal.

- ✅ Use: "outra forma de calcular", "outra perspectiva", "nem sempre fica claro"
- ❌ Avoid: "erro", "fraude", "mentira", "governo esconde", "imposto escondido"

## Core formulas

```
valor_real = total - imposto
perc_real  = (imposto / valor_real) * 100   ← primary highlighted result
perc_nota  = user-provided OR (imposto / total) * 100
```

## Design system

### Colors

| Token              | Light     | Dark                   |
| ------------------ | --------- | ---------------------- |
| `--bg`             | `#FAFAFA` | `#0A0A0A`              |
| `--card-bg`        | `#FFFFFF` | `#111111`              |
| `--text`           | `#0B0B0B` | `#F5F5F5`              |
| `--text-secondary` | `#6B6B6B` | `#A1A1A1`              |
| `--accent`         | `#FF3B30` | `#FF453A`              |
| `--accent-soft`    | `#FFE5E3` | `rgba(255,69,58,0.15)` |
| `--divider`        | `#EFEFEF` | `#1E1E1E`              |
| `--button-bg`      | `#0B0B0B` | `#F5F5F5`              |

### Typography

- Font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- Hero number (main result): `80px / 800 weight / letter-spacing: -4px / color: var(--accent)`
- Card section title: `13px / uppercase / letter-spacing: 0.8px / color: var(--text-secondary)`

### Components

- **Cards**: `border-radius: 16px`, box-shadow, padding `28px 24px`
- **Inputs**: `17px` font, `border-radius: 12px`, focus ring `0 0 0 3px rgba(accent, 0.12)`
- **Primary button**: full-width, `border-radius: 12px`, `padding: 16px`, `font-size: 17px`
- **Max width**: `600px` centered

### Dark mode

- Automatic via `prefers-color-scheme` — **no manual toggle**
- Set `data-theme="dark"` on `<html>`, listen with `matchMedia` change event
- No `localStorage` persistence

## UI structure

1. **Header** — logo (inline `%` SVG icon in accent color + "Imposto Real" text)
2. **Hero** — h1 + subtitle
3. **Input card** — total, imposto, percentual (optional). Each label has an inline SVG icon
4. **Results** (fade-in on calculate):
   - Result hero card: badge pill "OUTRA PERSPECTIVA" + giant `perc_real` in accent + sub-label
   - Secondary stat: valor real do produto
   - Comparison bars: nota fiscal (muted) vs alternativo (accent), animated
5. **Explanation card** — static educational text, neutral tone
6. **Share card** — copy link only

## Behaviour rules

- Currency mask: pt-BR format (`1.234,56`), applied on `input` event
- Validation: inline error messages under each field, no `alert()`
- URL state: `?total=X&tax=Y` — read on load, write on calculate via `history.replaceState`
- Animate count-up on all numbers (cubic-ease-out, ~900ms)
- Animate bars (CSS transition `width`, triggered via double `requestAnimationFrame`)
- Toast: fixed bottom, slides up, auto-dismisses after 2.2s

## Accessibility

- Every `<input>` has a `<label for="...">`
- All decorative SVGs: `aria-hidden="true"`
- Toast: `role="status" aria-live="polite"`
- Error containers: `role="alert"`
- Keyboard nav: `:focus-visible` outline in `var(--accent)`

## Mobile (480px breakpoint)

- Hero number reduces to `64px`
- Share button is full-width
- Toast becomes full-width (`calc(100% - 32px)`)
- Card padding reduces to `20px 16px`
