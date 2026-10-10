# Release validation

Validated October 10, 2026 against the production Next.js build using real headless Chromium.

- Production build, ESLint, and strict TypeScript checks pass.
- Seven browser scenarios pass: desktop daily flow and CRUD; backup/import, uploads, saved templates and aspect ratios; offline reload and saved-design export; mobile navigation; browser-process restart persistence; tablet/draft navigation/storage-failure handling; native sharing error/download fallback.
- PNG bytes are compared directly against the editor canvas; export dimensions verified at 1080 × 1350. All four ratio dimensions are checked in the live canvas.
- Daily verse stays unchanged after reload. Journal create/edit/search/delete, collection save/reopen/duplicate/delete, favorites, and challenge progress are exercised.
- Saved designs and journal entries survive closing Chromium and reopening the same persistent browser profile.
- Service worker control, standalone manifest, and three icon declarations checked. Offline page reload loads the app, journal, daily verse, saved design, editor and a downloadable PNG.
- Desktop, 390px phone, and 820px tablet layouts checked; mobile/tablet document widths do not overflow.
- No browser runtime exceptions in the main end-to-end scenario.
- Storage failures are surfaced and do not produce a false saved confirmation. Invalid backups are rejected.

Physical device installation, Safari-specific behavior, and actual native OS share sheets cannot be verified in headless Chromium. The browser-specific guidance and download fallbacks are implemented. Multi-tab and cross-device synchronization are outside this local-only release.

## Production verification

Production URL: https://scripturestudio-livid.vercel.app

The same seven browser scenarios pass against the public HTTPS deployment, including real offline reload/export and browser-process restart. Vercel's runtime error query reports no errors in the release window. The dependency audit reports zero vulnerabilities after removing the unpatched, development-only Next.js ESLint glob dependency chain; ESLint 10 with TypeScript and React Hooks rules remains enabled.
