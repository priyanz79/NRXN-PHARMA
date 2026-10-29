# NRXN Pharmaceuticals

Legal company name: **NRXN Pharmaceutical Pvt. Ltd.**  
Office: **NRXN Pharmaceuticals Private Limited, Bareilly, Uttar Pradesh**  
Phone: **7417299189**

Android and iOS app source, built from scratch with React Native, Expo, and TypeScript. A browser preview uses the same components.

**Live web app:** [https://nrxn-mobile-app.vercel.app](https://nrxn-mobile-app.vercel.app)

## Current status

**Functional connected prototype, not a production deployment.** The visitor, MR, manager, and administrator workspaces are implemented. The official logo, legal name, Bareilly office, and phone number are included. The public company profile, leadership, values, 13-product catalogue, and images were imported from [NRXN’s website](https://nrxn-pharma.vercel.app/). Firebase email/password authentication is connected to project `nrxn-pharmaceuticals-in`, and the reserved administrator account is provisioned. Workflow data is still persisted on a single device. No messages are sent, and no APK/IPA has been signed or published.

Passwords are handled by Firebase Authentication and are not stored in the app source. Employee IDs are converted internally to Firebase account identifiers. New employee sign-ups receive the MR role; the reserved administrator ID is `MrBerzerk69`. Remote data access still needs server-enforced role rules before real confidential company data is stored. Local workflow storage is unencrypted.

## Run

Use Node.js 22.13 or later and npm.

```sh
npm ci
npm start
```

Open with a compatible Expo Go app on Android or iOS. This project uses Expo SDK 57; if your Expo Go version does not support it, use a compatible development build. The computer and phone need to reach the same development server.

```sh
npm run web        # browser preview
npm run typecheck  # strict TypeScript checks
npm test           # workflow tests
npm run export:web # static browser build in dist/
```

An iOS simulator requires macOS and Xcode. Android requires an emulator/device or Expo Go. Actual native device execution remains unverified in this workspace.

## Firebase authentication setup

The working project already contains its ignored `.env` connection settings. When setting up a fresh checkout, copy `.env.example` to `.env` and fill it with the Firebase web-app configuration:

```sh
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Firebase Authentication's Email/Password provider is enabled. Employee sign-up is available from **Employee login**. Administrator sign-up is intentionally disabled; the reserved account has been provisioned centrally. Native sessions persist with AsyncStorage, and browser sessions use Firebase's web persistence.

## Try the end-to-end flow

1. As a visitor, explore the catalogue and save a demo enquiry.
2. Sign in as MR. Today's sample plan is already approved.
3. Open Daily Calls and choose **Demo check-in** for Dr. Aditi Shah. The fictitious coordinates are intentionally not your current location.
4. Sample balances start at zero because the website does not publish internal allocations. Sign in as administrator, open Products, and add sample stock before testing distribution.
5. Submit today's expense claim. The seeded policy gives INR 150 + 12 km × INR 4 = INR 198.
6. Request a deviation for another planned visit with a reason. Add an internal order price as administrator before testing POB; the public website does not publish prices. Enter an RCPA observation.
7. Open Tour Plan, select Next month, apply weekly templates, review date assignments and coverage, and submit the month.
8. Sign out and sign in as manager. Approve/reject the plan, deviation, and expense. Rejected plans require feedback. Review Analytics and record joint-working feedback.
9. Sign in as administrator to edit contacts, coordinates, visit frequencies, products, material URLs, and expense rates. Settings contains visitor enquiries and activity history.
10. Reload the app and sign in again to confirm the saved state persists.

## Feature coverage

| Requirement | Implemented in this build | Remaining for production |
|---|---|---|
| Visitor section | Website company profile, hero, leadership, values, searchable 13-product catalogue with local images, validated local enquiries | Published contact details and remote enquiry delivery |
| Employee/admin login | Firebase sign-in, employee sign-up, persistent sessions, reserved administrator account | Project provisioning, password reset, invitations, manager provisioning, server-enforced roles |
| Monthly/weekly TP | Interactive calendar, route contacts, station, km, saved weekday templates | Holidays, multi-MR assignment, versioned approved snapshots |
| Frequency matrix | Planned/required doctor counts with under/over warnings | Company-specific prioritization policies |
| Plan approvals | Submit, approve, reject with reason, revise | Notifications, escalation, immutable backend audit |
| Deviations | Mandatory reason categories/details, manager review | Approved replacement routes and plan versions |
| DCR | Approved daily route, one active visit, outcomes and completed history | Sync queue, conflict resolution, attachment support |
| Offline support | Local plans, records, samples, claims retained on native device | Encrypted storage, server sync and recovery; browser cold-start offline shell |
| Geo verification | Foreground GPS request, 200 m clinic radius, accuracy <=100 m | Native testing, configurable policy, mock-location risk handling, server checks |
| E-detailing | Administrator-configured HTTPS PDF/video links opened externally | Embedded viewer, downloaded offline decks, approved version control and viewing logs |
| Inventory | Administrator-entered balances, visit-linked issues, history | Real allocations, batch/expiry tracking, transfers, returns and reconciliation |
| POB | Chemist/stockist orders after an administrator supplies internal prices; unit quantities and price snapshots | Official price list, multi-line orders, fulfilment, tax/discount rules, ERP integration |
| Expenses | Approved station and km allowance, duplicate prevention, approval | Actual distance adjustments, receipts, payroll/export, policy effective dates |
| Joint working | Today's planned contacts with manager coaching notes | Co-presence verification and multi-MR assignment |
| TP vs actual / MIS | Coverage, call average, adherence, orders, samples, GPS counts | Region hierarchy, filtering, historical snapshot reporting and exports |
| Master database | Editable contact kind, specialty, class, frequency, coordinates | Central database, import, duplicate management and permissions |
| RCPA | Chemist, doctor, rival brand and unit observations | Period normalization and comparative territory reporting |

### Workflow rules

- Approved/submitted plans cannot be edited directly. Revising an approved month changes it to Draft and pauses new check-ins until reapproved. Current implementation has no retained approved version; do not revise a month just to skip a call—use a deviation.
- Templates populate **unplanned future dates** only, preserving existing planned days. Tap a date after applying templates to load it into the editor. Removing all selected contacts and saving removes that planned day.
- Demo check-ins are labelled and excluded from GPS-verified counts. GPS is only requested when the user presses GPS check-in; there is no background/live tracking.
- Samples can be issued only during an active doctor visit, within available stock. POB does not consume the MR's sample inventory.
- Claims require an approved plan and at least one completed visit. Rates and totals are snapshotted when submitted.
- Adherence uses due planned calls, excluding future days. Call averages use days with completed calls. Order bookings are not invoiced sales.
- Orders/audits use ISO timestamps; monthly order/audit filtering is currently UTC-based. Production reporting should use the company reporting timezone consistently.

## Structure

- `App.tsx`: responsive navigation and role workspaces.
- `src/Public.tsx`: visitor content, enquiry, Firebase login and employee sign-up.
- `src/firebase.ts` / `src/auth.ts`: cross-platform Firebase initialization, authentication and role mapping.
- `src/nrxnContent.ts`: website-derived company, leadership, values and local image map.
- `src/Planning.tsx`: calendar, route builder, templates and frequency matrix.
- `src/Fieldwork.tsx`: DCR, inventory, orders, expenses and RCPA.
- `src/Management.tsx`: approvals, joint working, analytics, masters and policy.
- `src/domain.ts`: state model, validation, workflow transitions and sample data.
- `src/store.tsx`: versioned local persistence with serialized writes.
- `tests/domain.test.ts`: business workflow tests.
- `PRODUCTION-PLAN.md`: backend, release requirements and acceptance checklist.

## Verification

- Strict TypeScript check passed.
- Eleven automated business workflow tests passed.
- Android, iOS and browser production exports passed with the Firebase SDK included.
- See `VERIFICATION.md` for final native export and browser verification results.

## Website content imported

- Official NRXN logo, app icon, legal company name, office address, and phone number.
- Company introduction and science/technology statement.
- Leadership profiles for Gaurav Kumar Varshney and Neha Varshney.
- Patient First, Innovation, and Integrity core values.
- RABISTOCK-DSR, CALSTOCK, HEAL-XT, CALSTOCK D3, AMIBUZZ-M, AMIBUZZ-G 300, ACHGUARD SP, Lcbuzz-M, TAMSHOT-D, DEFOBEST, LINOSTOCK-600, AMINOMIN, and TAKEME.
- Hero, leadership, and all product images are bundled locally for Android and iOS.

The address and phone number were supplied directly by NRXN. A company email address, product pricing, inventory allocations, and downloadable e-detailing files have not been supplied. Those fields remain administrator-managed.

The Expo template dependency tree reported ten moderate npm audit findings propagated from `uuid` through `xcode` and Expo tooling. No forced Expo downgrade was applied. Review/upgrade this toolchain before production release.

## Build and release

`eas.json` includes an internal Android APK profile and production profile. No build service account is linked. Before a signed build, set the final application identifiers in `app.json`, provide an approved icon/splash, connect a build account, and configure signing. The current identifiers are proposed values, not verified store registrations. iOS device distribution requires Apple's signing setup.

The web app is linked to Vercel project `nrxn-mobile-app`. `vercel.json` exports Expo web to `dist/` and provides SPA route fallback. Firebase public configuration is set for Vercel Production, Preview, and Development environments. Deploy future changes with:

```sh
npx vercel --prod
```

Documentation: [Expo SDK](https://docs.expo.dev/versions/latest/), [Location](https://docs.expo.dev/versions/latest/sdk/location/), [Local storage](https://docs.expo.dev/develop/user-interface/store-data/).
