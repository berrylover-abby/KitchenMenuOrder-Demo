# Kitchen Menu Order Demo — Project Summary

Last updated: November 2, 2026

UI refinement: customer ordering now uses the supplied reference's cream/olive palette, serif headings, sunrise brand mark, photo menu cards, rounded cart, and styled confirmation. Responsive layouts stack on narrow screens. Photos are stored locally under `apps/web/public/images`; image URLs remain backend menu metadata and images have a visual fallback. Styling is isolated in `theme.css`. The reference is a visual direction; photos and decorative details differ. Frontend build passes; narrow-screen browser rendering was inspected.

Repository: https://github.com/berrylover-abby/KitchenMenuOrder-Demo

## Purpose and phases

Build a Kitchen Management System incrementally, starting with QuickBite Lite: a local restaurant pickup-ordering demo.

- **Phase 1 — Mock interview:** Deliver the PRD's required end-to-end flow within a 45–60 minute exercise. Prioritize working functionality, clear explanations, and reliable validation.
- **Phase 2 — Future expansion:** Extend the demo with additional kitchen-management features. Feature scope and priorities have not yet been defined.

Source brief: `QuickBite_60min_Mock_Interview_PRD.md` (provided separately). This summary records the agreed scope and implementation approach; it does not expand the interview requirements.

## Phase 1 scope

Customer flow: **Browse menu → Add to cart → Enter name → Submit order → Receive order ID.**

Staff flow: **Open staff page → View submitted orders and their details.**

### Required

- Backend-provided menu with at least six dishes across at least two categories. Each dish has an ID, name, short description, CAD price, and category.
- Cart supporting adding dishes, increasing/decreasing quantities, removal, and an updated subtotal.
- Customer name required before submission; blank names and empty carts rejected with clear feedback.
- Backend validation of item IDs and quantities. The backend calculates the authoritative subtotal from its own menu prices.
- Successful submission returns an order ID and displays confirmation.
- Separate `/staff` page showing order ID, customer name, dishes and quantities, subtotal, and submission time.
- Refreshing the staff page retrieves orders created while the backend process remains running.
- Clear loading, success, empty, and error states; readable desktop and mobile layouts.
- Local startup and a brief explanation of architecture, AI usage, limitations, and incomplete work.

### Optional

- Mark orders Completed and display New/Completed status, only after all required features work.

### Outside Phase 1

Authentication, real staff access control, payments, refunds, taxes, tips, delivery, maps, live tracking, customer accounts, loyalty programs, recommendations, POS integrations, production deployment, and persistence across backend restarts.

PostgreSQL is unnecessary for this exercise; in-memory order storage meets the requirement.

## Architecture and maintainability decisions

- **Stack:** Vue 3 with Vue Router and Vite; Node.js with Express; REST API; npm workspaces.
- **Independent apps:** `apps/web` and `apps/api` have separate dependencies and startup commands. The frontend does not import backend implementation code.
- **Frontend boundaries:** Pages/components → composables → feature API adapters → shared HTTP client. Adapters translate and validate API responses so UI code does not handle transport details.
- **Backend boundaries:** API routes → services → repositories. Routes handle HTTP; services hold business rules; repositories handle data access. Dependencies are composed in `app.js`.
- **Feature organization:** Menu, cart, and orders have separate feature areas. Cart rules are framework-independent and reusable.
- **Data source:** The frontend fetches the menu from the API. Sample menu data lives only on the backend; no frontend mock or fallback menu is used.
- **Configuration:** `VITE_API_BASE_URL` selects the frontend's API address. Local development uses a same-origin `/api` proxy. Separate cross-origin hosting will require backend CORS configuration.
- **Money:** Store and calculate CAD amounts in integer cents. Frontend subtotals are estimates; the backend independently prices orders.
- **Storage:** Use an in-memory order repository initially. Keep services independent of storage so a database can be added behind repository methods later.
- **Verification:** Test important business rules and API behavior, and verify the frontend build. Keep the design small enough for the interview timebox.

## Build order and current status

| Step | Work | Completion criterion | Status |
| --- | --- | --- | --- |
| 1 | Workspace and application setup | Vue and Express apps configured, dependencies installed, local commands documented | Done |
| 2 | Menu vertical slice | Backend menu repository, service, and route connected to the customer page | Implemented; API checks and frontend build pass |
| 3 | Cart | Connect cart state and UI to reusable rules; add quantity controls and subtotal | Implemented; cart rules/state checks and frontend build pass; manual testing completed by the user |
| 4 | Order backend | Add order service, in-memory repository, POST `/api/orders`, validation, server pricing, and order ID | Implemented; service and HTTP integration checks pass |
| 5 | Customer checkout | Add name input, submission feedback, and confirmation; clear cart after success | Implemented; tests/build pass; user confirmed it works as expected |
| 6 | Staff orders | Add GET `/api/orders` and connect `/staff` to the API | Implemented; repeated API reads and staff state/adapter tests pass; manual testing completed by the user |
| 7 | Acceptance verification | Demonstrate the full flow and reject malformed direct API requests | Completed; user tested each step and automated validation checks pass |
| 8 | Optional improvements | Completed status and small UI refinements | P1 status implemented; automated tests/build pass; manual testing completed by the user |

The local Git repository has its `origin` set to the GitHub repository above. The completed demo was committed and pushed to master (initial commit 9d29e09). Implementation-stage verification notes below record what was checked at each milestone; the user has now confirmed the demo is finished. Final automated checks: all 18 tests pass and the frontend build succeeds.

## API and data plan

| Endpoint | Purpose | Status |
| --- | --- | --- |
| GET `/api/health` | API health check | Implemented |
| GET `/api/menu` | Return currency and menu items | Implemented |
| POST `/api/orders` | Validate and create a pickup order | Implemented |
| GET `/api/orders` | Return submitted orders for staff | Implemented; `{ orders: [...] }`, newest submission time first |
| PATCH `/api/orders/:id/status` | Mark an order Completed | Implemented; only `{ "status": "Completed" }` accepted; repeat completion is safe |
| GET `/api/orders/:id/status` | Retrieve customer-visible order status | Implemented; returns only ID/status, disables caching, 404 if missing |

- Menu item: `id`, `name`, `description`, `priceCents`, `category`.
- Order request: `customerName` plus `items`, each containing `itemId` and `quantity`. Client-provided prices and totals are ignored.
- Stored order: `id` (UUID), trimmed `customerName`, item snapshots including names/prices/quantities/line totals, `subtotalCents`, `currency`, and `submittedAt` (UTC ISO timestamp).
- Error response convention: `{ "error": { "code": "...", "message": "..." } }`.
- Order services must reject unknown items and quantities that are not positive integers, in addition to blank names and empty carts.
- Implemented validation also caps trimmed names at 100 characters, combines repeated item IDs, and rejects unsafe integer quantities/totals. Invalid orders are never partially saved. HTTP 201 indicates successful creation; business validation failures return HTTP 400 with `INVALID_ORDER`.

## Suggested interview timebox

| Time | Focus |
| --- | --- |
| 0–5 min | Confirm scope, data shapes, and API contract |
| 5–20 min | Set up apps and build backend menu/order behavior |
| 20–40 min | Build customer menu, cart, and checkout |
| 40–50 min | Connect staff order view |
| 50–60 min | Run acceptance checks, fix issues, prepare explanation |

For a 45-minute exercise, aim to complete the customer-to-staff flow by minute 35 and reserve the final 10 minutes for verification. Reach the full flow before visual polish or optional features.

## Acceptance checklist

Completed based on the user's confirmation that testing was performed after each step, together with the passing automated API and frontend checks. Recorded November 2, 2026.

- [x] Menu displays at least six dishes loaded from the backend.
- [x] Add two different dishes, change quantity, remove an item, and verify subtotal.
- [x] Blank customer name and empty cart produce clear validation feedback.
- [x] Valid submission returns an order ID and confirmation.
- [x] Staff page displays the order with correct details and server-calculated subtotal, including after refresh.
- [x] Direct malformed requests with invalid IDs or quantities are rejected by the backend.
- [x] Customer and staff views are readable at mobile and desktop widths.

## Local commands and verification

From the repository root, in Windows PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://127.0.0.1:5173 and keep the terminal running. The API uses http://127.0.0.1:3001. Using `npm.cmd` avoids the PowerShell script execution-policy issue encountered with `npm.ps1`.

```powershell
npm.cmd test
npm.cmd run build
```

After Step 6, all 14 tests pass: four API/service tests and ten frontend cart/checkout/staff tests. Order checks cover server pricing despite tampered client prices, repeated IDs, trimmed names, timestamps, unique IDs, malformed orders, quantity/total overflow, storage isolation, no partial writes, and repeated order-list reads. Checkout checks cover name/cart validation, blocking concurrent submissions, ID/quantity-only payloads, server confirmation totals, clearing only after success, retaining state on failure, and invalid responses. Staff checks cover refresh, failure recovery, preserving previous results, and response validation. The frontend production build also passes. The user confirmed that the cart and checkout work as expected; the user confirmed manual testing was completed after each step. See [README.md](README.md) for the source layout and additional startup details.

Staff orders load on page entry and on manual refresh. Cards show saved order IDs, customer names, quantities/items, subtotal, submission time in English using the browser's local timezone, and New/Completed status. Loading, empty, and error states are implemented. Failed refreshes retain the previous list with a stale-data warning. There is no automatic polling.

P1 implementation: orders are created as New. Staff can mark them Completed, with the status saved in the backend repository and returned by subsequent refreshes. Completion is idempotent, unsupported statuses are rejected with HTTP 400, and unknown orders return HTTP 404. UI updates wait for server confirmation and prevent overlapping refresh/update requests; failures preserve the previous displayed status and offer recovery guidance. Reopening completed orders is outside the current scope.

After P1, all 15 tests pass and the frontend build succeeds. Added checks cover default New status, successful/repeated completion, rejecting invalid transitions and missing IDs, status persistence across API refreshes, frontend request shape, pending-action guards, and failure recovery. P1 manual testing was completed by the user.

### Customer status extension (authorized after P1)

Implemented `/orders/:id`, linked as **View order status** from checkout confirmation. Customers can save/reopen the link and manually refresh to see backend New/Completed status. No automatic polling is included. The status API returns only ID/status, and its service/repository/route boundaries follow the existing architecture. Unknown orders show a clear message, including the in-memory restart limitation; network errors preserve the last known status with a stale-data notice. Late results from a previous order cannot overwrite the current route's status.

Verification after this extension: all 18 tests pass and the frontend build succeeds. Added coverage includes customer status before/after staff completion, missing orders, no-cache behavior, frontend refresh/recovery, API response validation, and navigation race handling. Customer status manual testing was completed by the user.

Checkout disables menu Add actions, cart edits, and repeat submissions while sending. Success displays the returned order ID, customer name, and authoritative subtotal, then clears the cart/name. Errors preserve both. Pending state is shared across route navigation. Network failures can leave the server outcome uncertain, so the UI advises checking before retrying; automatic retries and backend request deduplication are not included.

Cart state survives navigation between routes within the running frontend but resets on a full page reload. This is sufficient for the current demo; browser persistence is not part of Step 3. Checkout uses the cart's item IDs and quantities, with all prices validated independently by the order backend.
