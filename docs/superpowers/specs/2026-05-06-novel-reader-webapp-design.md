# Novel Reader Webapp Design

## Summary

Build a new responsive webapp inspired by Mihon, not a direct fork of Mihon's Android codebase. The app is a privacy-first, single-device novel reader that imports novels from source websites, stores personal data locally in the browser, and uses a lightweight backend only for fetching and parsing source pages.

## Goals

- Provide a mobile-prioritized responsive novel reader that also works on desktop.
- Support user-managed sources with built-in adapters for selected default websites.
- Let users import novels by URL, read online, and download/cache chapters for offline reading.
- Keep personal data local to the browser for v1.
- Preserve flexibility for future source search, sync, or account features without building them now.

## Non-goals for v1

- Directly converting or maintaining Mihon's Android/Kotlin codebase.
- User accounts, cloud sync, or cross-device server storage.
- Full site-wide source search.
- Recommendations, comments, social features, or hosted public service behavior.

## Architecture

Use a React + Vite frontend and a small Node.js/Fastify backend.

The frontend owns the user experience and stores private user data in IndexedDB. Data stored locally includes:

- configured sources
- library entries
- reading progress
- categories/statuses
- title aliases
- reader settings
- downloaded chapter content
- backup/export metadata

The backend is stateless for personal data. It handles:

- fetching source pages for the browser to avoid CORS limitations
- running built-in source adapters
- attempting generic parsing for unsupported sources
- returning structured import/refresh results
- applying conservative request limits and clear fetch/parse errors

The backend does not keep a central database of the user's library or reading activity.

## First-run setup

On first launch, show a setup choice screen:

1. **Use default sources**: add built-in source entries for:
   - NovelTrust: https://noveltrust.com/
   - NovelHi: https://novelhi.com/
   - Novel Updates: https://www.novelupdates.com/
   - Empire Novel: https://www.empirenovel.com/
2. **Start empty**: create no sources until the user adds them manually.

The user can later add, remove, enable, or disable sources from the Sources screen.

## Source model

Sources are website/base URL entries. v1 supports a hybrid source strategy:

- Supported websites use explicit built-in adapters.
- Unsupported or custom URLs use a generic parser fallback.
- The app warns users before generic parsing that results may fail, be incomplete, or import messy chapters.

Each source has a visible health/status indicator:

- Working
- Partial
- Broken
- Generic
- Disabled

Each source detail screen shows adapter capability transparency, such as:

- import by URL: yes/no
- site search: no for v1
- cover extraction: yes/partial/no
- alias extraction: yes/partial/no
- chapter download: yes/partial/no

When adding sources, show a legality/ethics notice: users are responsible for using sources they have permission to access and respecting source website terms.

## Import flow

V1 focuses on import by novel URL.

1. User opens Sources.
2. User selects a built-in source or adds a custom website/base URL.
3. User pastes a novel URL.
4. Backend fetches the page.
5. If a built-in adapter matches, it extracts structured metadata.
6. If no adapter matches, the app warns and attempts generic parsing.
7. User reviews metadata before saving.
8. Saved novels appear in Library with a selected category/status.

Adapters should extract when available:

- primary title
- alternative titles/aliases
- cover URL
- synopsis
- chapter list in correct order
- chapter URLs
- readable chapter text

If the main title cannot be found, warn the user and suggest using or entering an alternative title before saving. Users can manually edit title, aliases, cover URL, synopsis, and library status after import.

Failed import recovery should show what was found and offer clear actions:

- retry
- edit title manually
- save partial metadata
- cancel

## Refresh and chapter handling

Refreshing a novel checks for chapter updates through its source adapter or generic parser. Refresh should diff chapters and add only new chapters, avoiding duplicate entries.

Downloaded chapters are stored locally for offline reading. Download behavior should use conservative backend request limits to avoid hammering source websites.

## Library experience

The Library screen uses Mihon-like organization with novel-focused refinements.

Required v1 library features:

- categories/status filters: Reading, Plan to Read, Completed
- title and alias search
- grid/list display option
- continue-reading progress card
- manual metadata correction
- sorting by recent read, title, and update time where data exists

## Main navigation

Use bottom navigation on mobile and an equivalent responsive layout on larger screens.

Primary tabs:

- **Library**: user's novels, progress, categories, and search.
- **Sources**: default/custom sources, source health, source configuration, import by URL.
- **Downloads**: downloaded chapters and offline storage management.
- **Settings**: theme, reader mode, backup/export, privacy controls, and app preferences.

## Reader experience

The UI direction is 75% Mihon-like Material and 25% calm novel reader.

Mihon-like traits:

- dark-first app feel
- bottom navigation
- category chips
- dense source/admin screens
- compact controls
- library grid/list patterns

Calm novel reader traits:

- warmer reading palette
- comfortable typography
- progress cards
- reduced clutter while reading
- readable max text width on desktop

Theme defaults to auto-follow system, with manual light/dark override available.

The reader supports both modes with a setting:

- scrolling mode
- paginated mode

Default reader settings should be comfortable and safe for long reading sessions: reasonable font size, line height, spacing, and max text width.

## Privacy and storage

V1 is single-device and privacy-first.

- No login.
- No cloud sync.
- No central server database of personal reading data.
- Personal data stays in browser storage.
- Backend only processes active fetch/parse requests.

Settings should make this clear to users. Include export/import backup using a readable JSON format so users are not locked in and can protect against browser data loss. Include a backup reminder because browser-local storage can be cleared by the user or browser.

## Offline behavior

Offline support includes:

- reading downloaded chapters
- browsing saved library metadata
- preserving reading progress/settings locally

Online/backend access is required for:

- importing new novels
- refreshing chapter lists
- downloading chapters not already cached
- generic parser attempts

## Testing and success criteria

V1 is successful when:

- First launch offers Use default sources and Start empty.
- Default sources are added only when chosen.
- Sources can be enabled, disabled, removed, and inspected for adapter capabilities.
- Import by novel URL works for each supported default source adapter.
- Unsupported/custom sources show a generic parser warning.
- If title extraction fails, the app warns and lets the user use or enter an alternative title.
- Primary title and aliases are searchable in the library.
- Users can manually correct metadata after import.
- Chapter refresh adds new chapters without duplicating existing chapters.
- Library categories work: Reading, Plan to Read, Completed.
- Reader switches between scrolling and paginated modes.
- Downloaded chapters open offline.
- Export/import backup works with a readable JSON file.
- UI is mobile-prioritized and remains usable on desktop.
- Backend avoids persisting personal reading data.

## Future v2 candidates

- Full site-wide search per source.
- Optional cross-device sync.
- Optional user accounts.
- More advanced adapter tooling.
- Source update scheduling.
- Recommendations or discovery features.
