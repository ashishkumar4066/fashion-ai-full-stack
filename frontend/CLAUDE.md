# Frontend — CLAUDE.md

Complete reference for the fashion-ai frontend. Read this before making any changes.

---

## Project Overview

AI Fashion Virtual Try-On web app. Users can:
1. Generate photorealistic model images from text prompts (Gemini 2.5 Flash via PiAPI)
2. Generate garment product images from text prompts
3. Run virtual try-on (dress a model in a garment) using Kling AI
4. Generate short fashion videos from try-on results
5. Browse all generated assets in a gallery

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.3.1 | UI framework |
| React Router DOM | 6.27.0 | Client-side routing |
| Material-UI (`@mui/material`) | 5.16.7 | Component library + theming |
| `@mui/icons-material` | 5.16.7 | Icon set |
| Emotion (`@emotion/react`, `@emotion/styled`) | latest | MUI's CSS-in-JS engine |
| Axios | 1.7.7 | HTTP client |
| Vite | 5.4.10 | Build tool + dev server |

---

## Dev Setup

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build
```

**Proxy:** All `/api` requests are proxied to `http://localhost:8000` (FastAPI backend). Configured in `vite.config.js`.

---

## Directory Structure

```
frontend/
├── index.html              # HTML entry point, loads Google Fonts (Inter)
├── package.json
├── vite.config.js          # Vite config: React plugin, port 5173, /api proxy
└── src/
    ├── main.jsx            # React root: BrowserRouter + ThemeProvider + CssBaseline
    ├── App.jsx             # Router, ambient orb background, page transitions
    ├── theme.js            # MUI theme + glass utilities + all animation keyframes
    ├── api/
    │   └── fashionApi.js   # All API calls (axios, error handling)
    ├── components/
    │   ├── Navbar.jsx      # Fixed top nav, mobile drawer
    │   └── ResultDisplay.jsx  # Image result with download/copy/open actions
    └── pages/
        ├── HomePage.jsx
        ├── GenerateModelPage.jsx
        ├── GenerateGarmentPage.jsx
        ├── TryOnPage.jsx
        ├── VideoPage.jsx
        └── GalleryPage.jsx
```

---

## Routing — `App.jsx`

Six routes, all rendered inside a shared layout:

| Path | Component |
|------|-----------|
| `/` | HomePage |
| `/generate-model` | GenerateModelPage |
| `/generate-garment` | GenerateGarmentPage |
| `/try-on` | TryOnPage |
| `/video` | VideoPage |
| `/gallery` | GalleryPage |

**Ambient background:** 5 gradient orbs rendered in a `position: fixed` Box behind all content (z-index 0). Each orb uses the `float` keyframe with staggered durations (18–26s) and delays (0–12s).

**Page transitions:** Routes wrapper has `key={location.pathname}` which remounts on navigation, triggering `animation: 'fadeInUp 0.35s ease both'`.

---

## Theming — `theme.js`

### Palette

```js
primary: { main: '#7C3AED', dark: '#5B21B6', light: '#A78BFA' }
background: { default: '#0a0a0a', paper: '#111111' }
text: { primary: '#ffffff', secondary: '#9e9e9e' }
```

### Exported Glass Utilities

Import and spread into `sx` props:

```js
import { glassCard, glassPanelSx, glassCardHover } from '../theme'

// Usage:
<Paper sx={{ p: 4, ...glassCard }}>
```

| Export | Background | Blur | Use case |
|--------|-----------|------|---------|
| `glassCard` | `rgba(255,255,255,0.04)` | `blur(16px)` | Input panels, feature cards |
| `glassPanelSx` | `rgba(255,255,255,0.03)` | `blur(20px)` | Step panels, step containers |
| `glassCardHover` | — | — | Spread onto any card that lifts on hover |

### Animation Keyframes

All defined in `MuiCssBaseline.styleOverrides` — available globally via `animation:` in any `sx` prop.

| Keyframe | Duration (typical) | Effect | Used in |
|----------|--------------------|--------|---------|
| `fadeInUp` | 0.35–0.6s | opacity 0→1 + translateY(24px)→0 | Page transitions, section entrances |
| `shimmer` | — | backgroundPosition sweep (loading skeleton) | — |
| `pulse-glow` | 1.2s | opacity/scale pulse | Pulsing dots in loaders |
| `float` | 18–26s | translateY(-20px) + rotate(1deg) loop | Ambient orbs, empty state icons |
| `morphGradient` | 2–3s | backgroundPosition 0%→100%→0% | Gradient text/bars |
| `slideInRight` | 0.4s | translateX(32px)→0 + opacity | — |
| `scaleIn` | 0.2–0.25s | scale(0.7)→1 + opacity | Checkmark badges, selection badges |
| `glowPulse` | 1–3s | box-shadow purple intensity pulse | Active stepper circles, TextField focus |
| `borderRotate` | 1.4–3s | rotate(0→360deg) | Triple-ring concentric loader |
| `revealUp` | 0.5s | translateY(16px)+blur(4px)→clear | Result panel reveal after generation |
| `shimmerText` | 4s | backgroundPosition sweep on gradient text | Logo, "Instantly." headline |
| `countUp` | 0.4s | translateY(8px)→0 + opacity | Stats entrance |
| `gradientBorderSweep` | 2s | backgroundPosition on active nav underline | Active nav link |
| `particleBurst` | 0.7s | scale(0)→1 + opacity fade | Upload success particles |

### Component Overrides

| Component | Key overrides |
|-----------|--------------|
| `MuiAppBar` | `rgba(10,10,10,0.6)` bg, `blur(24px)`, bottom border `rgba(255,255,255,0.06)` |
| `MuiButton` (containedPrimary) | Gradient `#7C3AED→#5B21B6`, glow shadow, `translateY(-2px)` on hover |
| `MuiButton` (outlinedPrimary) | `rgba(124,58,237,0.5)` border, lift on hover |
| `MuiPaper` | `#111111` bg, `willChange: 'transform'`, smooth transitions |
| `MuiTextField` | Purple focus border + `glowPulse` animation on focused fieldset |
| `MuiLinearProgress` | Animated gradient bar (`morphGradient 2s`) |
| `MuiTabs` indicator | Gradient `#7C3AED→#A78BFA`, purple glow shadow |
| `MuiToggleButton` (selected) | Glass-gradient background + `#7C3AED` border |

---

## Pages

### `HomePage.jsx`

Static marketing page. No API calls.

**Sections:**
1. **Hero** — badge (glowPulse), gradient headline with shimmerText on "Instantly.", subtitle, two CTA buttons
2. **Stats row** — 3 glass chips (< 2 min, 3 types, 10+ ratios) with `countUp` staggered entrance
3. **Features** — 3 `Paper` cards (glassmorphism), `translateY(-10px)` + border glow on hover
4. **How it works** — 4 steps in glass pill wrappers, staggered `fadeInUp`
5. **CTA** — "Launch Try-On Studio" button

**Key animation props:**
```js
animation: 'fadeInUp 0.6s ease both'          // hero elements
animation: 'glowPulse 3s ease-in-out infinite' // badge
animation: 'shimmerText 4s linear infinite'    // "Instantly."
animation: `countUp 0.4s ease ${0.5 + i*0.1}s both` // stats
```

---

### `GenerateModelPage.jsx`

**State:** `prompt`, `aspectRatio` (default `2:3`), `status` (idle|generating|done|error), `result`, `error`, `elapsed`

**Layout:** 2-column Grid (left: input, right: result)

**Left panel** — `glassCard` Paper:
- `TextField` (multiline, 4 rows, 500 char max)
- 4 example prompt `Chip`s (click to fill)
- Aspect ratio chips (8 options: `2:3 1:1 9:16 16:9 4:5 3:4 3:2 4:3`) — selected = gradient fill + glow
- Generate button (disabled if `prompt.length < 3` or generating)

**Right panel states:**
- `idle` — floating icon placeholder (`float` animation)
- `generating` — triple concentric ring loader + animated gradient label + 3 pulsing dots
- `done` — `ResultDisplay` + "Use in Try-On" / "Generate Again" buttons (wrapped in `revealUp`)

**"Use in Try-On"** saves to `sessionStorage.generatedModel` and navigates to `/try-on`.

**Aspect ratios:** `['2:3', '1:1', '9:16', '16:9', '4:5', '3:4', '3:2', '4:3']`

---

### `GenerateGarmentPage.jsx`

Identical pattern to `GenerateModelPage`. Differences:
- Aspect ratios: `['1:1', '2:3', '3:4', '4:3', '3:2', '4:5', '5:4', '9:16']`
- Default aspect ratio: `1:1`
- Example prompts: denim jacket, linen shirt, trousers, summer dress
- Saves to `sessionStorage.generatedGarment` on "Use in Try-On"
- API: `generateGarment(prompt, aspectRatio)`

---

### `TryOnPage.jsx`

**State:** `activeStep` (0–2), model state (id/imageUrl/name/items/loading/error), garment state, result state

**Custom Components (defined inside file):**

#### `GlassStepper({ steps, activeStep })`
Replaces MUI `<Stepper>`. Horizontal flex container with `glassPanelSx`.
- Completed steps: gradient-filled circle + `CheckCircleIcon`
- Active step: `glowPulse` animation on circle + `rgba(124,58,237,0.15)` bg
- Connector lines: gradient fill when completed, dim when pending

#### `GarmentTypePill({ types, value, onChange })`
Replaces `ToggleButtonGroup`. Vertical glass container.
- 3 options: Upper Body, Lower Body, Full Outfit
- Selected: `rgba(124,58,237,0.15)` bg + purple border
- Each option shows label + description

#### `ItemCard({ item, selected, onSelect })`
Selectable image card (aspectRatio `3/4`).
- Selected: `scale(1.03)` + purple glow + animated checkmark (`scaleIn` bounce)
- Hover: `scale(1.04)` + border glow
- Overlay label at bottom (hidden until hover intent via opacity)

#### `ItemGrid({ items, loading, error, selectedId, onSelect, ... })`
Grid of `ItemCard`s. Handles loading/error/empty states.
- Empty state: glass container with floating icon + CTA button
- Grid: `repeat(auto-fill, minmax(120px, 1fr))`, max-height 360px with overflow-y scroll

**Step flow:**
- Step 0 (Select Model): loads models on mount, shows `ItemGrid` + optional pre-selected preview
- Step 1 (Select Garment): lazy-loads garments on step enter, shows `ItemGrid` + `GarmentTypePill`
- Step 2 (Result): triple-ring loader during `runTryOn`, then `ResultDisplay` + action buttons

---

### `VideoPage.jsx`

**State:** `activeStep` (0–1), `tryonId`, `tryonImageUrl`, `tryons[]`, `prompt`, `duration` (5|10), `aspectRatio` (9:16|16:9|1:1), `status`, `videoUrl`, `error`, `elapsed`

**Step 0 — Settings:**
- Try-on selector grid (small `TryOnCard` subcomponent, 3/4 aspect)
- Optional motion prompt (`TextField`, 500 char)
- Duration toggle: `ToggleButtonGroup` (5s / 10s)
- Aspect ratio toggle: `ToggleButtonGroup` (9:16 / 16:9 / 1:1)
- Pre-selects from `sessionStorage.generatedTryOn` on mount

**Step 1 — Result:**
- Loading: spinner + elapsed timer
- Done: `<video>` player with `controls`, `loop`, `autoPlay`, Download MP4 button
- Action buttons: Generate Another, Try Different Look, Start Over, View Gallery

**API:** `generateVideo(tryonId, prompt || null, duration, aspectRatio)` — 310s timeout

---

### `GalleryPage.jsx`

**State:** `tab` (0–3), plus loading/error/data state for each of 4 tabs

**Shared card style:** `galleryCardSx` const (defined at file level):
```js
const galleryCardSx = {
  overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%',
  transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', willChange: 'transform',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 0 0 1px rgba(124,58,237,0.5), 0 20px 60px rgba(124,58,237,0.2)',
    borderColor: 'rgba(124,58,237,0.4)',
  },
  '&:hover .gallery-overlay': { opacity: 1, transform: 'translateY(0)' },
}
```

**Cards:**
| Card | Aspect | Content |
|------|--------|---------|
| `ModelCard` | 3/4 | Image, name, prompt excerpt, ID + copy, aspect ratio chip, date, "Use in Try-On" |
| `GarmentCard` | 1/1 | Same as ModelCard |
| `TryOnCard` | 3/4 | Result image, garment type chip, model ID + garment ID with copy buttons, date |
| `VideoCard` | video | `<video>` player, aspect ratio + duration chips, try-on ID, Download MP4 |

All cards except VideoCard have a `.gallery-overlay` div (opacity 0 by default, reveals on parent hover) containing download button.

**Overlay pattern:**
```jsx
<Box className="gallery-overlay" sx={{
  opacity: 0,
  transform: 'translateY(8px)',
  transition: 'opacity 0.3s ease, transform 0.3s ease',
}}>
```

**EmptyState:** Glass container + floating icon (`float` animation) + CTA button

**Tabs container:** Glass background `rgba(255,255,255,0.02)` + `blur(12px)` + rounded top corners

---

## Components

### `Navbar.jsx`

- **Fixed** AppBar: `rgba(10,10,10,0.6)` + `blur(24px)` + subtle bottom border
- **Logo:** "FashionAI" with `shimmerText` gradient animation; AutoAwesome icon with `glowPulse`
- **Desktop nav links:** `::after` underline — width 0%→60% on hover, width 60% + `gradientBorderSweep` when active
- **Active detection:** `useLocation()` — exact match for `/`, `startsWith` for all others
- **Mobile (< md):** Hamburger → right Drawer (`width: 280`, `blur(24px)` glass)
  - Active item: `rgba(124,58,237,0.12)` bg + purple border + small dot indicator

---

### `ResultDisplay.jsx`

**Props:** `imageUrl` (string), `title` (string, default `"Result"`)

Renders a Paper with:
- Image (100% width, `object-fit: cover`, gradient overlay at bottom)
- Action row: Open in New Tab, Copy Link (with "Copied!" Snackbar), Download Image
- Download filename: `fashionai-result-{timestamp}.jpg`

---

## API Layer — `api/fashionApi.js`

**Base config:**
```js
baseURL: '/api/v1'
timeout: 30000  // overridden per call for long operations
```

**Error handler:** `parseError(error)` returns readable string for: 422 (validation), 504 (timeout), 502 (external AI), 400, generic.

**All functions return:** `{ data, error }` — never throw.

| Function | Method | Path | Timeout |
|----------|--------|------|---------|
| `generateModel(prompt, aspectRatio)` | POST | `/generate-model` | 310s |
| `generateGarment(prompt, aspectRatio)` | POST | `/generate-garment` | 310s |
| `runTryOn(modelId, garmentId, garmentType)` | POST | `/try-on` | 310s |
| `generateVideo(tryonId, prompt, duration, aspectRatio)` | POST | `/generate-video` | 310s |
| `getModels()` | GET | `/models` | 30s |
| `getModel(id)` | GET | `/models/{id}` | 30s |
| `getGarments()` | GET | `/garments` | 30s |
| `getGarment(id)` | GET | `/garments/{id}` | 30s |
| `getTryOns()` | GET | `/try-ons` | 30s |
| `getTryOn(id)` | GET | `/try-ons/{id}` | 30s |
| `getVideos()` | GET | `/videos` | 30s |
| `getVideo(id)` | GET | `/videos/{id}` | 30s |

**Usage pattern:**
```js
const { data, error } = await generateModel(prompt, aspectRatio)
if (error) { setError(error); return }
setResult(data)
```

---

## Cross-Page State (sessionStorage)

| Key | Set by | Consumed by | Contains |
|-----|--------|-------------|---------|
| `generatedModel` | GenerateModelPage ("Use in Try-On") | TryOnPage (on mount) | `{ id, name, image_url }` |
| `generatedGarment` | GenerateGarmentPage ("Use in Try-On"), GalleryPage | TryOnPage (on mount) | `{ id, name, image_url }` |
| `generatedTryOn` | TryOnPage ("Generate Video") | VideoPage (on mount) | `{ id, result_url }` |

All three are **removed immediately after reading** (`sessionStorage.removeItem(...)`).

---

## Common Patterns

### Glassmorphism

```jsx
import { glassCard, glassPanelSx } from '../theme'

// Input panel
<Paper sx={{ p: 4, ...glassCard, animation: 'fadeInUp 0.5s ease both' }}>

// Step container
<Paper sx={{ p: 4, ...glassPanelSx, animation: 'fadeInUp 0.4s ease both' }}>
```

### Triple Concentric Ring Loader

Used on Generate and TryOn pages during AI processing:
```jsx
<Box sx={{ position: 'relative', width: 80, height: 80 }}>
  {/* Outer: borderRotate 3s */}
  {/* Middle: borderRotate 1.4s reverse, purple glow */}
  {/* Inner dot: glowPulse 1s */}
</Box>
```

### Elapsed Timer Pattern

```js
const timer = setInterval(() => setElapsed((e) => e + 1), 1000)
const { data, error } = await someApiCall(...)
clearInterval(timer)
```

Dynamic label based on elapsed:
```js
const label = elapsed < 20 ? 'Initializing…' : elapsed < 60 ? 'Generating…' : 'Almost ready…'
```

### Aspect Ratio Chip (selected state)

```jsx
sx={{
  background: selected ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' : 'transparent',
  borderColor: selected ? 'transparent' : '#2a2a2a',
  color: selected ? '#fff' : 'text.secondary',
  fontWeight: selected ? 700 : 400,
  boxShadow: selected ? '0 4px 15px rgba(124,58,237,0.4)' : 'none',
  transform: selected ? 'scale(1.05)' : 'scale(1)',
  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
}}
```

### Result Reveal

Wrap result content in:
```jsx
<Box sx={{ animation: 'revealUp 0.5s cubic-bezier(0.4,0,0.2,1) both' }}>
```

### Staggered Entrance

```jsx
{items.map((item, i) => (
  <Box key={item.id} sx={{ animation: `fadeInUp 0.5s ease ${i * 0.1}s both` }}>
```
