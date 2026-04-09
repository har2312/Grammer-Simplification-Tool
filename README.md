# Grammar Simplification Tool

Interactive Next.js app for visualizing Context-Free Grammar (CFG) simplification with a premium dark glassmorphism UI.

## What This App Does

The app simplifies a grammar in this strict order:

1. Remove Useless Symbols
2. Eliminate Null Productions
3. Remove Unit Productions

The right panel shows results using tabs:

- `Original`
- `1. Useless`
- `2. Null`
- `3. Unit`
- `Final`

Only one stage is shown at a time to avoid UI congestion.

## Feature Highlights

- Dark-mode glassmorphism UI optimized for readability
- Split-screen workflow:
   - Left panel: grammar input + quick guide
   - Right panel: tabbed simplification results
- Auto-replace in input: typing `null` (case-insensitive) becomes `ε`
- Cursor-aware replacement: caret position is preserved while typing
- Strict simplification order with per-step details and warnings
- Handles undefined variable-like symbols as non-generating references

## Tech Stack

- Next.js (App Router)
- TypeScript
- React hooks (`useState`, `useLayoutEffect`)
- Pure CSS (no Tailwind / Bootstrap)

## Project Structure

- `src/app/page.tsx` - Main page and state wiring
- `src/components/InputSection.tsx` - Start symbol, productions input, actions
- `src/components/QuickGuide.tsx` - Input format helper card
- `src/components/TabbedTimeline.tsx` - Tab navigation and active result panel
- `src/components/TimelineCard.tsx` - Step card renderer
- `src/components/FinalGrammarCard.tsx` - Final grammar card
- `src/utils/grammarEngine.ts` - Parser and simplification algorithms
- `src/app/globals.css` - Dark glassmorphism styling

## Local Development

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm

### Setup

1. Install dependencies:

    ```bash
    npm install
    ```

2. Start development server:

    ```bash
    npm run dev
    ```

3. Open:

    ```
    http://localhost:3000
    ```

## Scripts

- Dev server:

   ```bash
   npm run dev
   ```

- Lint:

   ```bash
   npm run lint
   ```

- Type check:

   ```bash
   npm run typecheck
   ```

- Production build:

   ```bash
   npm run build
   ```

- Start production server:

   ```bash
   npm run start
   ```

## Input Format

Write one production per line:

```text
S -> A B | b
A -> a | ε
B -> C | b
C -> ε | c
```

Notes:

- Use spaces if you want explicit token separation (`A B c`).
- Epsilon tokens supported: `ε`, `ϵ`, `epsilon`, `eps`, `lambda`, `λ`.
- Typing `null` in the productions textarea auto-converts to `ε`.
- Start symbol is configurable in the UI.

## Algorithm Notes

### 1) Remove Useless Symbols

- Phase A: find generating variables via fixed-point iteration
- Phase B: find reachable variables from start symbol
- Rules containing undefined variable-like symbols (for example `B -> C` where `C` is never defined on LHS) are treated as non-generating and removed

### 2) Eliminate Null Productions

- Compute nullable variables
- If start symbol is nullable, introduce a fresh start symbol `S'`
- Expand nullable combinations and remove explicit null rules

### 3) Remove Unit Productions

- Build unit graph
- Compute full unit-closure pairs
- Replace unit chains with non-unit productions

## Deploy on Vercel

1. Push repository to GitHub
2. Import project in Vercel
3. Keep framework preset as Next.js
4. Deploy

No extra server configuration is required.

## Troubleshooting

### Dev server runtime chunk errors (example: missing `.next` module chunk)

If you see errors like `Cannot find module './213.js'` from `.next/server`:

1. Stop dev server
2. Remove `.next`
3. Remove `node_modules/.cache` if present
4. Restart with `npm run dev`

### `node` or `npm` not recognized on Windows

- Install Node.js from official installer
- Reopen terminal after install so PATH updates are applied
