# PulseGlobus

Interactive terminal for prediction markets. Renders live [Polymarket](https://polymarket.com) events on a 3D globe, links each market to the world news driving it, and offers a physics-based bubble view ranked by trading volume.

Built with React 18, TypeScript, Vite, Redux Toolkit (RTK Query), mapbox-gl and d3-force.

---

## Features

**Globe view** — an auto-rotating mapbox globe with market and news markers placed by geographic relevance. Markers are colour-coded by type, hover shows a summary popup, click opens a detail card and draws dashed connection lines to related items. Light and dark map themes.

**Market ↔ news linking** — `linkMarketsToNews` scores each market/article pair by shared keywords and geographic context, and links pairs above a relevance threshold. Selecting a market surfaces the news behind it; selecting an article surfaces the markets it moves.

**Bubble view** — every event as a circle sized by volume, packed with a spiral algorithm and kept alive by a d3-force collision simulation. Bubbles drift, can be flung with pointer drag, and open a detail card with outcome odds.

**Breaking news panel** — a GDELT feed of market-relevant global news, de-duplicated and diversified by source country, filterable by 1h / 6h / 24h.

**Search** — debounced search across markets, events and news, with category chips.

**Filtering** — seven categories (Politics, Sports, Crypto, Finance, Geopolitics, Tech, Culture) plus All Markets, and 1h / 6h / 24h time windows, applied to both views.

**Wallet layer** — wagmi + viem + Web3Modal for wallet connection, and an ERC-20 token gate (`TokenGate`) that unlocks the terminal on a minimum `$PULSE` balance. Built and working, but not mounted in `App` yet — see [Token gating](#token-gating).

Responsive down to mobile, where the globe pauses by default and marker cards anchor to their marker with a connector line.

---

## Quick start

Requires Node 18+ (developed on Node 22).

```bash
git clone https://github.com/k-jdev/PulseGlobus.git
cd PulseGlobus
npm install
npm run dev
```

The app runs at `http://localhost:5173`. It works out of the box — the API tokens have committed defaults.

### Environment variables

All optional; each falls back to a committed default so local dev needs no `.env`. Copy `.env.example` to `.env` to override:

| Variable | Purpose |
|---|---|
| `VITE_MAPBOX_ACCESS_TOKEN` | Mapbox GL public token (`pk.*`) |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect / Web3Modal project id |
| `VITE_POLYMARKET_BUILDER_API_KEY` | Polymarket `X-Builder-Api-Key` header |

> These are publishable, client-side tokens. Restrict them by domain (Mapbox URL restrictions, WalletConnect allowed origins) before deploying.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck, then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint, fails on any warning |
| `npm run lint:fix` | ESLint with `--fix` (also sorts imports) |
| `npm run format` | Prettier write over `src/` |
| `npm run format:check` | Prettier check, for CI |

---

## Architecture

Three state boundaries, kept strictly separate:

| Concern | Owner |
|---|---|
| Server state (markets, events, news) | **RTK Query** — `store/services/` |
| Client and UI state (theme, view mode, filters, open panels) | **Redux slice** — `store/slices/uiSlice.ts` |
| Imperative instance handles (map `changeTheme`, `toggleSpin`) | **React context** — `lib/map/context.ts` |

React Query is present only because wagmi requires it as a peer; no application query uses it.

The last row matters: mapbox exposes an imperative API whose handles are functions, so they cannot be serialised into Redux. The map registers them into a context on mount and the navigation bar consumes them from there.

```
src/
├─ App.tsx              composition root — reads viewMode, renders one of two views
├─ main.tsx             provider chain: wagmi → react-query → redux
├─ types/               shared domain types (Category, TimeFilter, ViewMode, Theme)
├─ store/
│  ├─ index.ts          store wiring
│  ├─ hooks.ts          typed useAppSelector / useAppDispatch
│  ├─ slices/           uiSlice — client + UI state, selectors
│  └─ services/         polymarketApi, gdeltApi (RTK Query), polymarketWebSocket, browserAI
├─ lib/
│  ├─ web3/             wagmi config, ERC-20 ABI, useWalletConnection, useTokenGate
│  └─ map/              MapControlProvider + useMapControls
├─ features/
│  ├─ map/              globe: useMapbox, marker hooks, popups, geo mappers
│  ├─ bubbles/          bubble view: packing layout + d3-force physics
│  ├─ navigation/       sub-navigation bar (view toggle, filters, panels)
│  ├─ navbar/           top bar, mobile menu
│  ├─ news/             breaking news panel
│  ├─ trades/           live trades panel
│  ├─ search/           market + news search
│  ├─ wallet/           ConnectWallet button
│  └─ wallet-gate/      TokenGate overlay
├─ components/ui/       presentational primitives (Button)
└─ utils/               format, cn, categoryResolver
```

### Map rendering

`features/map/hooks/useMapbox.ts` owns the mapbox instance. Sources, layers and marker data are installed on the **`style.load`** event rather than `load`, because `style.load` fires both on first load and after every `setStyle()` — so switching theme swaps the style in place instead of tearing down and rebuilding the map.

Markers stream in through `useProgressiveMarkers`, which appends them in batches on a timer so the first paint is not blocked by the full set.

### Data flow

```
Polymarket Gamma API ─┐
                      ├─ RTK Query ─→ marketMappers ─→ linkMarketsToNews ─→ GeoJSON ─→ mapbox layer
GDELT DOC API ────────┘                    │
                                           └─→ bubble data ─→ packing layout ─→ d3-force
```

---

## Data sources

**Polymarket Gamma API** (`gamma-api.polymarket.com`) — markets, events and outcome prices. Proxied to avoid CORS: `/api/polymarket/*` is rewritten by the Vite dev server locally and by `vercel.json` in production.

**GDELT** (`api.gdeltproject.org`) — global news. Articles are de-duplicated by normalised title and diversified by source country so no single region dominates the globe.

> GDELT sends no CORS headers, so requests currently route through public proxies (`corsproxy.io`, `codetabs.com`) with a direct-fetch fallback. This means third parties see all news traffic and the feed depends on their uptime — replacing it with a first-party proxy route is a known follow-up.

**Polymarket live-data WebSocket** (`ws-live-data.polymarket.com`) — trade stream for the Live Trades panel. The panel is wired but ships behind `SHOW_LIVE_FEED = false` in `features/trades/index.tsx`; while disabled it renders a placeholder and opens no socket.

---

## Token gating

`features/wallet-gate` implements a full ERC-20 balance gate: it reads `balanceOf` and `decimals` via wagmi, renders a blocking overlay until the connected wallet holds the required amount, and shows the shortfall when it does not.

It is **not mounted** — `App.tsx` renders the terminal ungated. To enable it, wrap the tree:

```tsx
<TokenGate
  tokenAddress="0xF9877901a3D8c8D26078703004E748E66A4009b5"
  requiredAmount={1000}
  tokenSymbol="$PULSE"
>
  {/* app */}
</TokenGate>
```

`ConnectWallet` is likewise ready but not rendered — `Navbar` currently shows a static `$PULSE` button in its place.

---

## Deployment

Configured for Vercel. `vercel.json` handles the Polymarket API rewrite and the SPA fallback; no other setup is needed beyond adding the `VITE_*` environment variables.

Any static host works, provided you reproduce the `/api/polymarket/*` → `https://gamma-api.polymarket.com/*` rewrite and the SPA fallback to `index.html`.

---

## Code standards

- TypeScript `strict`, plus `noUnusedLocals` / `noUnusedParameters`. No `any` in `src/`.
- ESLint runs with `--max-warnings 0`. Imports are ordered external → `@/` internal → relative, alphabetised, and enforced by `eslint-plugin-import`.
- Prettier, 80 columns, double quotes, trailing commas.
- Conventions: hooks `useX`, selectors `selectX`, actions past-tense (`themeChanged`), constants `SCREAMING_SNAKE`, types `PascalCase` with no prefix.
- Comments explain *why*, not *what*. Self-documenting names are preferred over a comment.

Before opening a PR:

```bash
npm run typecheck && npm run lint && npm run format:check && npm run build
```

---

## Known limitations

- **No test suite.** Best first targets: `uiSlice` reducers, `useMapMarkers` filtering, `utils/format`, `categoryResolver`, `linkMarketsToNews`.
- **No error boundaries.** A mapbox init failure (bad token, no WebGL) or a wallet provider throw blanks the app.
- **Bundle is ~4.6 MB (1.37 MB gzipped)** in one chunk. `mapbox-gl` and the wallet stack should be code-split — the wallet layer loads on every page view even though `ConnectWallet` is not mounted.
- **Accessibility gaps**: icon-only buttons lack labels, overlays have no focus trap, markers have no keyboard path.
- Marker geography is keyword-inferred, not authoritative — a market is placed at a plausible city for its subject, not a verified location.

---

## Links

- [Pulse Terminal](https://pulseterminal.io/)
- [Documentation](https://docs.pulseterminal.io/)
