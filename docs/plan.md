# Iqbal Poetry — App Plan

## Overview

A mobile app (Expo / React Native) presenting the Urdu poetry of **Allama Muhammad Iqbal** from the bundled SQLite database (`assets/iqbal-poetry.db`).

The core idea: content ships in **two languages** — Urdu (original) and **Roman/transliteration** — and the user can switch content language anywhere, without any UI translation.

## Data model (from `assets/iqbal-poetry.db`)

| Table | Rows | Columns |
|---|---|---|
| `books` | 3 | `id`, `slug`, `title` (Urdu+Roman mixed), `author`, `language`, `kalam_count` |
| `kalams` | 189 | `id`, `book_id`, `position`, `slug`, `title_urdu`, `title_roman`, `url`, `urdu`, `transliteration`, `tashreeh`, `english`, `roman` |

Books:

| id | slug | Title | Kalams |
|---|---|---|---|
| 1 | `bal-e-jibreel` | Bal-e-Jibreel | 121 |
| 2 | `zarb-e-kaleem` | Zarb-e-Kaleem | 25 |
| 3 | `armaghan-e-hijaz` | Armaghan-e-Hijaz | 43 |

**Data quality facts**
- `urdu` and `transliteration` are **100% populated** and **line-parallel** for 185/189 kalams. The 4 mismatches must render gracefully (stacked, unpaired).
- `tashreeh`, `english`, `roman` are empty for all kalams. **Do not build UI around them.**

## Content language model

| Concept | **Urdu** | **Roman** |
|---|---|---|
| Book title | `title` (Urdu portion) | `slug` → display form |
| Kalam title | `title_urdu` | `title_roman` minus parenthetical English translation |
| Kalam body | `urdu` | `transliteration` |
| Direction | RTL (`text-right`) | LTR (`text-left`) |

- `lang` state: `"urdu" | "roman"`, default `"urdu"`.
- Provided app-wide via a React context (`lib/lang.tsx`).
- Titles AND body flip together when the toggle is used. Search always matches **both** languages.

## Tech stack

- Expo SDK 57 · expo-router (file-based routing) · expo-sqlite (bundled-DB seed via `SQLiteProvider` `assetSource`) · expo-asset
- NativeWind v4 (Tailwind v3) for styling — **no hardcoded colors anywhere**; all colors come from `lib/theme.js` tokens
- TypeScript (strict)

## Theme tokens (`lib/theme.js`)

Semantic tokens only — screens/components reference these as NativeWind classes.
Palette: **dark royal Islamic** — midnight navy base, emerald green + royal gold accents:

| Token | Class example | Value | Use |
|---|---|---|---|
| `background` | `bg-background` | `#0B0E14` midnight navy | screen background |
| `surface` | `bg-surface` | `#141A24` | cards |
| `surface-muted` | `bg-surface-muted` | `#1D2532` | active toggle / muted fills |
| `border` | `border-border` | `#2A3547` | hairline separators |
| `primary` | `bg-primary` | `#17A673` jade green | accents, active states |
| `primary-muted` | `bg-primary-muted` | `#0C2B21` | soft accents |
| `accent` | `bg-accent` | `#D4AF37` royal gold | highlights, brand marks |
| `ink` | `text-ink` | `#EFF3F7` | primary text |
| `ink-muted` | `text-ink-muted` | `#9AA7B9` | secondary text |
| `ink-soft` | `text-ink-soft` | `#667388` | placeholders |

App-level config (`app.json`) uses the same base: `userInterfaceStyle: "dark"`,
splash + adaptive-icon backgrounds `#0B0E14`.

Rule: colors are defined **only** in the Tailwind theme. No `#hex` in components.

## Screens (MVP)

| Screen | Route | Behavior |
|---|---|---|
| Kalam list (tab) | `app/(tabs)/index.tsx` | FlatList of kalams for the current book (default `bal-e-jibreel`, or saved book); book switcher (bottom-sheet), language toggle |
| Search (tab) | `app/(tabs)/search.tsx` | One input; matches across `urdu` + `transliteration` + both titles |
| Favorites (tab) | `app/(tabs)/favorites.tsx` | List of favorited kalams (most recent first); empty state; language toggle |
| Reader | `app/kalam/[id].tsx` | Title + body in current lang; RTL/LTR; stanza breaks; prev/next kalam; favorite toggle (♥); language toggle |

Tabs live in `app/(tabs)/_layout.tsx` (Home ⌂ / Search ⌕ / Favorites ♥). The reader
is a full-screen route outside the tabs. There is no separate "books/Home library"
screen — the kalam-list tab is the root.

Shared:
- `components/LanguageToggle.tsx` — segmented Urdu/Roman control
- `components/BookSwitcher.tsx` — bottom-sheet book picker (in-place switch)
- `components/ScreenHeader.tsx` — back/title/subtitle header (tab screens pass `hideBack`)
- `lib/db.ts` — all SQL queries
- `lib/lang.tsx` — content language context + helpers
- `lib/storage.ts` — AsyncStorage persistence (`lang`, `lastBook`)

## Persistence

- `iqbal.lang` (AsyncStorage) — content language survives app restarts; hydrated on launch.
- `iqbal.lastBook` (AsyncStorage) — current book (`{ slug, bookId }`). The kalam-list tab
  opens the saved book, falling back to `bal-e-jibreel` by default; switching happens
  in place via the **book switcher**.
- **Favorites** (SQLite `favorites` table, `kalam_id` PK) — created at startup via
  `SQLiteProvider` `onInit` → `ensureFavoritesTable`. Toggled from the reader (♥);
  listed on the Favorites tab.

## DB layer (`lib/db.ts`)

- Seed: `SQLiteProvider` with `databaseName="iqbal-poetry.db"` and `assetSource={{ assetId: require('../assets/iqbal-poetry.db'), forceOverwrite: false }}`. Requires `.db` added to metro `assetExts` (already done in `metro.config.js`).
- Queries: `getBooks`, `getBookBySlug`, `getKalams(bookId)`, `getKalam(id)`, `getAdjacent(bookId, position)` (prev/next by position), `searchKalams(q)` (`LIKE` over urdu/transliteration/title_urdu/title_roman).
- Favorites: `ensureFavoritesTable`, `getFavorites` (joined + recent-first), `isFavorite`, `toggleFavorite`.

## Kalam list (tab) detail

- App header: "Allama Iqbal Poetry".
- Opens the saved book (`iqbal.lastBook`), defaulting to `bal-e-jibreel`.
- Toolbar row: book switcher (shows current book, bottom-sheet to change books)
  + language toggle.
- FlatList of kalams (titles in current lang).

## Fonts

- Urdu text uses bundled **Noto Nastaliq Urdu** (`@expo-google-fonts/noto-nastaliq-urdu`,
  loaded in `app/_layout.tsx` via `useFonts`; regular + bold). Apply via `langFont` /
  `langFontBold` from `lib/lang.tsx` (no-ops for Roman so Latin text keeps the system font).

## Known limitations to document

- Roman/English text keeps the system font (Noto Nastaliq is not applied to Latin script).
- Search `TextInput` placeholder and key hints still use the system fallback for Urdu glyphs.
- 4 kalams with non-parallel line counts render as two stacked blocks when toggling to Roman.

## Later phases (explicitly out of MVP)

- Urdu–Roman paired / side-by-side view
- Favorites + reading history (local tables)
- Font-size control, reading themes, share/copy
- `tashreeh` / English content (needs the data to be added to the DB)
- Nastaliq font bundling