# QuickBite Lite

A local pickup-ordering demo built with Vue 3 and Express. The app provides a backend menu, customer menu and cart, checkout, order creation/listing APIs, and a connected staff order page. The complete customer-to-staff flow is implemented; the user has completed manual testing after each step.

See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for the agreed scope, architecture decisions, build order, and progress.

## Run locally

Requires Node.js 22 or newer (Node 24 recommended) and npm.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. The API runs at http://127.0.0.1:3001. Vite proxies `/api` requests to Express. Keep port 3001 available; when changing the API port, update the Vite proxy as well.

```sh
npm test
npm run build
```

`npm start` starts only the API. The frontend build is checked separately; production hosting is outside the interview scope.

## Structure and boundaries

```text
apps/
  api/src/
    app.js                     Dependency composition; separate from the listener
    server.js                  Process startup and graceful shutdown
    features/menu/
      menu.routes.js           HTTP handling
      menu.service.js          Application/business logic
      menu.repository.js       Data access
      menu.data.js             Server-owned interview seed data
    middleware/                Shared HTTP error handling
    features/orders/           Order routes, business validation/pricing, memory storage
    shared/                    Domain validation error
  web/src/
    features/menu/             Menu API adapter and page
    features/cart/             Pure cart rules, shared Vue state, and cart panel
    features/orders/           Checkout, staff orders, composables, and API adapters
    shared/api/                Shared HTTP client
    shared/money.js            CAD display formatting
```

Routes delegate to services; services depend on injected repositories and never import Express. Replacing in-memory storage should preserve repository methods. Order storage is created once per application instance and survives requests until the backend restarts.

The frontend fetches menu data from `GET /api/menu`. There is no frontend mock menu or fallback dataset. Failed requests show an error and retry action. The server's sample menu is the prototype's source of truth.

The apps have independent dependencies, builds, and startup commands. Vue pages consume composables, feature API adapters translate and validate REST responses, and the shared HTTP client handles transport. The frontend never imports backend code. Set `VITE_API_BASE_URL` when building for a different API address (see `apps/web/.env.example`). The default same-origin `/api` proxy avoids needing CORS for local development; a separate cross-origin deployment requires server CORS configuration.

Money is represented as integer CAD cents (`priceCents`). Cart totals are display estimates; order services validate IDs and positive integer quantities and calculate authoritative totals from backend prices.

The cart supports repeated adds, quantity controls, removal, line totals, and subtotal. It holds snapshots of backend-provided menu items without depending on HTTP. State survives Vue route navigation and resets on a full browser reload. Decreasing quantity to zero removes the item. The panel stacks below the menu on narrow screens.

## Current API

- `GET /api/health` → `{ "status": "ok" }`
- `GET /api/menu` → `{ "currency": "CAD", "items": [...] }`
- `POST /api/orders` → HTTP 201 with the saved order; HTTP 400 with `INVALID_ORDER` for business validation failures.
- `GET /api/orders` → `{ "orders": [...] }`, newest submission time first, with caching disabled.
- `PATCH /api/orders/:id/status` with `{ "status": "Completed" }` → updated order; invalid status returns 400, unknown order returns 404. Repeating completion is safe.
- `GET /api/orders/:id/status` → `{ "id": "...", "status": "New" }` (or Completed), caching disabled; unknown orders return 404.
- Errors → `{ "error": { "code": "...", "message": "..." } }`

### Create an order

```json
{
  "customerName": "Abby",
  "items": [
    { "itemId": "burger", "quantity": 2 },
    { "itemId": "fries", "quantity": 1 }
  ]
}
```

Response fields: `id` (UUID), trimmed `customerName`, `currency` (`CAD`), `submittedAt` (UTC ISO timestamp), `subtotalCents` (2950 for this example), and `items`. Each saved item contains `itemId`, backend-provided `name` and `priceCents`, `quantity`, and `lineTotalCents`.

Names must contain non-whitespace text and be at most 100 characters after trimming. Items must be a nonempty array with known string IDs and positive safe integer quantities. Repeated IDs are combined; quantities and totals that exceed safe integer arithmetic are rejected. Client prices and totals are ignored. Validation completes before anything is saved. Saved item details are snapshots, and repository reads/writes return copies so consumers cannot mutate stored orders.

Customer checkout sends only the name, item IDs, and quantities through the order API adapter. It rejects empty carts and blank/overlong names, disables submission and cart edits while sending, and shows the returned order ID and server subtotal on success. Only successful confirmation clears the cart and name. The checkout composable shares pending state across route navigation. The cart panel accepts checkout through a slot and does not depend on order code.

Errors preserve the cart and name. If a network or server failure leaves the result uncertain, the UI asks the customer to check with the restaurant before retrying. Repeated POST requests create separate orders; backend retry deduplication is not implemented.

### Staff orders

Open `/staff` to load saved orders. Each card displays the order ID, customer name, items and quantities, line totals, CAD subtotal, and submission time in the browser's local timezone. Use **Refresh orders** or reload the page to retrieve new orders; there is no automatic polling. Loading, empty, and retry states are provided. A failed refresh retains the previous list and labels it as potentially out of date. Backend restarts reset the in-memory list.

Orders start with status **New**. Use **Mark as Completed** on a staff card to save status **Completed**. The UI waits for confirmation, prevents overlapping updates/refreshes, and shows an error without changing the displayed status if the request fails. Completed orders remain visible after refresh. Reopening completed orders is outside the current scope. Status follows the same in-memory lifetime as orders; backend restarts clear both.

## Customer status extension

After checkout, choose **View order status** to open `/orders/:id`. Customers can save this link and use **Refresh status** to retrieve New/Completed from the backend after staff updates. Refreshing or reopening the URL works while the backend still holds the order. This is manual refresh, not live polling. The status endpoint exposes only ID/status. Loading, missing-order, and retry states are included; failed network refreshes label retained status as potentially stale. Orders still disappear after backend restart. This extension is beyond the original interview requirements.

## Verification completed

- [x] Required acceptance flow tested by the user after each implementation step.
- [x] Staff completion and customer status refresh tested by the user.
- [x] All 18 automated tests pass and the frontend production build succeeds.

No authentication, payments, database, or deployment is included. Orders will only need to survive while the API process is running.
