# Verification record

## Passed

- `npm run typecheck`: strict TypeScript compilation.
- `npm test`: 11 automated tests, all passed.
  - Plan submit/reject/revise/approve and reviewer role restrictions.
  - Check-in, stock deduction, visit completion and expense approval.
  - GPS distance and accuracy validation.
  - Duplicate and concurrent active-visit prevention.
  - Required deviation reason, review and rejected-request recovery.
  - Order outlet/quantity validation and stock independence.
  - Visitor enquiry validation and role separation.
  - Template deduplication and doctor coverage calculation.
  - Revision blocks new check-ins until renewed approval.
  - Expense amount snapshots survive policy changes.
  - Version 1 local data migrates to the 13-product website catalogue while retaining supported business records.
- Expo web production JavaScript bundle export.
- Expo Android JavaScript bundle export.
- Expo iOS JavaScript bundle export.
- All 16 website images, the supplied official logo, and both 1024px app-icon layouts resolved during Android, iOS, and web exports.
- Expo public configuration resolved the iOS icon, Android adaptive icon, splash screen, favicon, application identifiers, and location permissions.

Native export used `--no-bytecode` to validate JavaScript module compatibility without invoking the platform-specific Hermes compiler. This does **not** constitute a signed native build or device test.

## Not verified

- Browser rendering, visual quality, keyboard interaction and UI walkthrough: attempted with agent-browser, but Windows denied browser process communication. A second launch also failed. Browser verification did not pass.
- Physical Android/iOS installation, GPS permissions on actual devices, native offline restart and app-store builds.
- Firebase Authentication code, the live project, email/password provider, administrator account, and cross-platform bundles are implemented. A live administrator sign-in was verified. Multi-device data sync, backend permissions, remote enquiries, and native app-store distribution are not implemented in this prototype.
- Vercel production deployment `nrxn-mobile-app` is READY at `https://nrxn-mobile-app.vercel.app`. The live HTML and JavaScript bundle returned HTTP 200, the title resolved to NRXN Pharmaceuticals, and the bundle contains the configured Firebase project ID.

## Dependency check

The installed Expo SDK 57 dependency tree reports 10 moderate npm audit findings. These are propagated from a uuid advisory through xcode and Expo build tooling. No forced framework downgrade was made. Review before a release.

## Manual follow-up

Run the workflow in README on a phone, then repeat in a desktop browser. Check a narrow 360 px viewport, larger text accessibility settings, decimal/negative coordinate entry, loss of connectivity after loading, denied GPS, persistence after restart, and all three demo roles.
