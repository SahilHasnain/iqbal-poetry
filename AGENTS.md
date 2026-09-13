# AGENTS.md

Guidance for AI agents working in this repository.

## Project

Expo SDK 57 (React Native 0.86) app: an Iqbal Poetry reader with content in two languages
(Urdu + Roman/transliteration), seeded from a bundled SQLite database.

## Commands

- `npm start` — start Expo dev server
- `npm run android` / `npm run ios` / `npm run web` — run on a platform
- `npm run lint` — ESLint (`expo lint`)
- typecheck: `npx tsc --noEmit`

Always run lint + typecheck after making code changes.

## Architecture

- **Routing**: expo-router, file-based. Bottom tabs in `app/(tabs)/` (`index` = kalam
  list for current book, `search`, `favorites`); `app/kalam/[id]` is the full-screen
  reader. There is no separate books screen: the kalam-list tab defaults to
  `bal-e-jibreel` (or the saved book), and `components/BookSwitcher.tsx`
  (bottom-sheet) switches books in place.
- **Database**: expo-sqlite. The bundled DB `assets/iqbal-poetry.db` is seeded via
  `SQLiteProvider` → `assetSource={{ assetId: require('../assets/iqbal-poetry.db'), forceOverwrite: false }}`.
  Do NOT write your own copy-to-filesystem logic.
- **All SQL lives in `lib/db.ts`.** Screens use `useSQLiteContext()` and call helpers from there.
- **Content language**: `lib/lang.tsx` provides `lang` (`"urdu" | "roman"`) via context.
  Titles and body always come from the current language.
- **Persistence**: `lib/storage.ts` wraps AsyncStorage. Keys are namespaced
  (`iqbal.lang`, `iqbal.lastBook`). `LangProvider` hydrates `lang` on mount and writes on change;
  the kalam-list tab opens the last saved book (default `bal-e-jibreel`) and saves it on switch.
  Favorites live in SQLite: a `favorites` table (`kalam_id`) is ensured via
  `SQLiteProvider` `onInit` → `ensureFavoritesTable`; SQL is in `lib/db.ts`
  (`getFavorites`, `isFavorite`, `toggleFavorite`).
- **Styling**: NativeWind (Tailwind). Use NativeWind classes everywhere possible.
  **Never hardcode colors.** All colors are semantic tokens defined in `lib/theme.js`
  (`background`, `surface`, `primary`, `accent`, `ink`, `ink-muted`, `border`, …),
  consumed by `tailwind.config.js` and available to code via `@/lib/theme`.

## Data model (from `assets/iqbal-poetry.db`)

- `books`: `id`, `slug`, `title`, `author`, `language`, `kalam_count` (3 books).
- `kalams`: `id`, `book_id`, `position`, `slug`, `title_urdu`, `title_roman`, `url`,
  `urdu`, `transliteration`, `tashreeh`, `english`, `roman` (189 kalams).

Facts:
- `urdu` and `transliteration` are always populated and (for 185/189 kalams) line-parallel.
- `tashreeh`, `english`, `roman` are empty for all rows — never build UI depending on them.

## Content language rules

- Row → display mapping: book title = `title` (or slug form), kalam title = `title_urdu`/`title_roman`,
  body = `urdu`/`transliteration`.
- Urdu is RTL (`text-right`), Roman is LTR (`text-left`).
- Search must match BOTH languages.
- The 4 kalams with misaligned line counts must render stacked (never pair wrong lines).

## Conventions

- TypeScript strict; use `@/*` path alias (`@/lib/db`, `@/components/LanguageToggle`, …).
- No comments in code unless asked.
- Keep components small; reusable pieces go in `components/`, logic in `lib/`.