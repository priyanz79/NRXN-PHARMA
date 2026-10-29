# Production implementation plan

## Information NRXN needs to provide

1. Confirmation that the imported website copy and images are approved for the mobile app, plus a company-domain email address and enquiry destination. The supplied logo, legal name, Bareilly office address, and phone number are already applied.
2. Employee roster, manager/reporting structure, territory hierarchy, and doctor/chemist/stockist masters.
3. Class A/B/C visit frequencies, holidays, travel policies, allowed deviation reasons, and approval chain.
4. Approved scientific PDF/video materials, version dates, and public versus employee-only visibility.
5. Order pricing, tax, discount, fulfilment and existing sales/accounting integrations.
6. Backend/cloud account and Android/Apple developer accounts for deployment.

## Backend design to implement

Firebase Authentication project `nrxn-pharmaceuticals-in` is provisioned for employee sign-up, login, session persistence and the reserved administrator identity. Use an authenticated API backed by a relational database for operational data; PostgreSQL suits the reporting and approval relationships. The API must derive identity and permissions from verified Firebase tokens and server-managed claims, never from client-provided role fields.

Core entities:

| Entity | Ownership and key relationships |
|---|---|
| organizations, regions, territories | Company hierarchy; territory belongs to region |
| employees, role_assignments | User identity, company, territory, assigned manager |
| contacts, contact_assignments | Kind, specialty, coordinates, grade, frequency; assigned MRs |
| products, approved_assets | Product catalogue; versioned public/professional materials |
| tour_plans, plan_versions, planned_days, planned_visits | MR and period; retained approval versions |
| route_templates, template_visits | MR or territory reusable weekly program |
| visits, visit_events | Approved planned visit, GPS evidence, start/end, outcomes |
| deviations | Original visit, reason, replacement proposal, reviewer and decision |
| inventory_allocations, inventory_movements | Employee, product, batch, expiry, immutable issues/returns |
| orders, order_lines | Outlet, MR, multiple products, unit price snapshot, fulfilment state |
| expense_policies, claims, claim_lines | Effective policy, route version, actual/allowed km, receipts |
| rcpa_audits, rcpa_lines | Chemist, doctor, period, rival product and observed quantity |
| joint_visits | Manager, MR, contact, coaching notes and confirmation |
| enquiries | Visitor submission and administrator follow-up state |
| audit_events, sync_operations | Append-only decisions and client operation idempotency |

## Access model

- Visitors: read only published profile/catalogue; submit rate-limited enquiries. No employee data access.
- MRs: assigned contact data and their own plans, visits, samples, orders, claims and audits.
- Managers: assigned reporting team only, approvals, joint-working notes and scoped reports.
- Administrators: company-scoped master/policy management, employee provisioning and reports. Audit all role changes.
- Enforce every scope on the server and with database policies where supported. UI navigation alone provides no security.

## Offline synchronization

Persist pending operations with client-generated UUIDs, actor, device, entity version and creation time. Retry with exponential backoff. Deduplicate by operation ID. Use database transactions for sample issues and orders. Reject overspending stock or modifying a superseded approved plan; show a recoverable conflict to the MR. Preserve both planned and actual versions for variance reporting. Restrict stored data to the assigned territory and use encryption for sensitive records and secure token storage.

## Delivery stages

1. Confirm imported website content, add missing contact/price/material information, provision the Firebase project and administrator, add employee hierarchy, master imports, server-managed claims, and backend authorization tests.
2. Move TP/DCR/approvals/stock to the API. Add approved plan versions, offline outbox, conflict handling and sync status.
3. Finish offline e-detailing, multi-line POB, expense receipts, notifications and regional reporting.
4. Run a pilot with a small field team. Verify actual Android/iOS permissions, poor GPS, denied location, no signal, app restarts, repeated taps, and concurrent stock updates.
5. Review release dependencies, configure signing, produce internal APK/TestFlight builds, resolve pilot findings, and publish through NRXN-owned developer accounts.

## Release acceptance

- An MR cannot view another MR's data or approve their own plan, including direct API requests.
- A manager cannot access unassigned territories; all administrator changes are audited.
- An approved plan remains available while a revision awaits approval.
- Offline DCR operations survive restart and sync exactly once.
- Failed GPS, denied permission and poor accuracy have clear recovery flows; sample data cannot be marked as genuine GPS verification.
- Sample balances remain correct under retries/concurrent submissions and never become negative.
- Expenses use policy effective dates, saved approved-route versions and reproducible calculations.
- Published visitor content is approved; enquiries reach the central team and survive device changes.
- Android and iOS native device tests, accessibility checks, release builds and restore/backup checks pass.
