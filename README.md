# Daily Scripture Studio

A free, account-free Christian creative space built with Next.js 16.4 (the latest stable release available when implemented), React 19, TypeScript, and Tailwind CSS 4. Deploys on Vercel without a database or environment secrets.

## Run

```sh
npm ci
npm run dev
```

Production validation:

```sh
npm run lint
npm run typecheck
npm run build
npm run start
npm test
```

Browser tests use Chromium at `/usr/bin/chromium` by default in this workspace. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to your Chromium executable on another machine. Set `BASE_URL` to run against a deployed application. Tests cover the local data lifecycle, canvas export, all four aspect ratios, uploads, backups, mobile navigation, and service worker offline reloads.

## Features

- Scenic editorial welcome and daily scripture dashboard with date-stable rotation, original reflections/prayers, gratitude prompts, and daily activity.
- Canvas studio with six templates, bundled photos, color/gradient backgrounds, local uploads, scripture library, font/text/layout controls, decorations, undo/redo, and tap positioning.
- 1080px/1920px PNG exports using the exact preview renderer; native file sharing when supported and PNG download fallback. Very long passages auto-fit rather than clip.
- IndexedDB designs, favorite verses, saved templates, immediate journal autosave, preferences, and challenge progress.
- Journal CRUD, search, and type filters. Editable collection, duplicate/delete, and exported-design filter.
- Three seven-day challenges; at most one completion per challenge per local date.
- Validated JSON backup export/import, destructive-action confirmations, and storage error feedback.
- Installable PWA, custom any/maskable icons, local assets, and offline shell caching. No external assets are requested during app usage.
- Keyboard focus trapping and Escape dismissal for dialogs; reduced-motion support and mobile bottom navigation.

## Privacy and storage

Journal text and user photos are never uploaded. Everything stays in this browser's IndexedDB. Clearing site storage, private browsing, browser eviction, or moving to another browser/device can remove or hide your data. Export backups regularly; importing replaces local data after confirmation. Browser storage protection can be requested in Settings but is not a backup guarantee. Local storage is not encrypted against other users with access to the same browser profile. Use one editing tab at a time; automatic cross-device or cross-tab synchronization is outside this release.

## Scripture and assets

World English Bible (classic WEB), public domain, verified against the eBible.org chapter sources listed in `docs/scripture-sources.md`. Original devotional content is explicitly separate from scripture. The welcome preview labels its shortened Psalm 46:10 as an excerpt. Photography is bundled from Unsplash under the Unsplash License. Cormorant Garamond is bundled under the SIL Open Font License. Full credits are in `public/credits.txt` and the font license in `public/fonts/OFL.txt`.

## PWA

The service worker precaches the HTML, its referenced Next.js scripts/styles, images, font, and icons. Navigation is network-first with the cached shell as an offline fallback; local assets are cache-first. All views share the app shell and use hash navigation, so the cached application can access every local feature. Bump `CACHE` in `public/sw.js` when changing bundled assets. Installation needs HTTPS (or localhost). iOS installation uses Safari's Share → Add to Home Screen; Chromium may offer an install prompt. Actual OS installation and native share sheets require a physical device and are not covered by automated Chromium tests.
