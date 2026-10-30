# DripRack Admin Frontend — Executive Control Center

The administrative control and operations platform for **DripRack**, a high-end streetwear and lifestyle e-commerce application.

Built with **React 18**, **Vite**, and **Tailwind CSS**, strictly engineered against `DESIGN.md` and dark tactical design tokens.

---

## Architecture & System Overview

The DripRack Admin application is deployed completely independently from the customer storefront (`client_frontend`). It interfaces with the production Express/MongoDB backend (`driprack-backend`) through authenticated REST API contracts.

### Core Security & In-Memory Authentication
1. **Zero Persistent Storage:** Access tokens and sensitive authentication state are held strictly in application memory (`tokenStorage.js` / `apiClient.js`). Neither `localStorage` nor `sessionStorage` is ever used for credentials or tokens.
2. **HttpOnly Refresh Cookie:** Session persistence across browser reloads is handled exclusively via secure HttpOnly cookie rotation (`POST /api/v1/auth/refresh`).
3. **Single-Flight Concurrency Mutex:** Simultaneous mounts or parallel 401 encounters share a single in-flight refresh promise, preventing race conditions or multiple refresh requests.
4. **Mutation Replay Safety:** Following a 401 Unauthorized response, only idempotent read requests (`GET`, `HEAD`, `OPTIONS`) automatically refresh tokens and replay once. Non-idempotent mutations (`POST`, `PATCH`, `DELETE`) are **never** auto-replayed, preventing duplicate order actions, accidental inventory adjustments, or duplicate entity creation.
5. **Strict RBAC & Status Verification:** Access requires both `user.role === 'admin'` and `user.status === 'active'`. Deactivated operators or customer roles are rejected and their session is revoked.

---

## Implemented Application Modules (Phases 1–7)

### 1. Authentication & Protected Shell (Phase 1)
- **Path:** `/login` & Root Protected Layout
- **Capabilities:** Secure administrative sign-in gateway with visible state toggling, duplicate-submit prevention, and normalized backend error messages.
- **Layout Shell:** Collapsible navigation sidebar, environment indicator, administrator profile card, and breadcrumb header. Accessible modal dialogs and drawers with keyboard escape listeners and backdrop controls.

### 2. Executive Dashboard (Phase 2)
- **Path:** `/dashboard`
- **Backend Endpoint:** `GET /api/v1/admin/dashboard/summary`
- **Capabilities:**
  - 4 Key Performance Indicators: Recognized Revenue, Total Volume, Orders Requiring Action, and Critical Stock Alerts.
  - Order Pipeline Distribution: 6-status ratio visualization (`awaiting_payment`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`).
  - Recent Orders stream with customer names, fulfillment statuses, and currency-formatted values.
  - Transparent data provenance note disclosing backend revenue aggregation semantics.

### 3. Products Catalog & Category Taxonomy (Phase 3)
- **Paths:** `/products`, `/categories`
- **Backend Endpoints:**
  - `GET /api/v1/admin/products`, `GET /api/v1/admin/products/:id`, `POST /api/v1/products`, `PATCH /api/v1/products/:id`, `PATCH /api/v1/products/:id/status`
  - `GET /api/v1/admin/categories`, `GET /api/v1/categories`, `POST /api/v1/categories`, `PATCH /api/v1/categories/:id`, `DELETE /api/v1/categories/:id`
- **Capabilities:**
  - Full server-side pagination with preservation of top-level `meta` envelope.
  - Strict integer cents monetary input parser preventing floating-point imprecision.
  - Product creation and editing drawers with HTTPS image URL preview and active category validation.
  - Category taxonomy management with soft deactivation (`isActive: false`) and product association integrity guards.

### 4. Inventory & Stock Movements (Phase 4)
- **Path:** `/inventory`
- **Backend Endpoints:** `GET /api/v1/inventory/stock`, `GET /api/v1/inventory/low-stock`, `GET /api/v1/inventory/movements`, `POST /api/v1/inventory/adjust`
- **Capabilities:**
  - Three operational views: Warehouse Stock Overview, Critical Low-Stock Replenishment, and Immutable Movement Ledger.
  - Multi-parameter filtering by search term (`q`), category, in-stock status, movement type, and ISO date ranges.
  - Atomic stock adjustment terminal with client-generated RFC 4122 v4 `Idempotency-Key` headers. Reused keys are preserved for identical retries, and new keys are generated on payload edits.
  - Dynamic cross-catalog product lookup supporting live searches across all warehouse SKUs.

### 5. Orders & Fulfillment (Phase 5)
- **Path:** `/orders`
- **Backend Endpoints:** `GET /api/v1/admin/orders`, `GET /api/v1/admin/orders/:reference`, `PATCH /api/v1/admin/orders/:reference/status`, `POST /api/v1/admin/orders/:reference/cancel`
- **Capabilities:**
  - Server-paginated order stream with filtering by status, payment method, payment status, and order date range.
  - Detailed Order Dossier drawer with itemized line items, delivery address, payment metadata, and audit timeline.
  - Sequential fulfillment workflow (`confirmed` → `processing` → `shipped` → `delivered`) requiring online payment verification prior to processing.
  - Dispatch modal requiring explicit shipping carrier input, tracking number, and HTTPS tracking URL (no fake prefilled carriers).
  - Explicit confirmation for Cash On Delivery (COD) payment collection upon delivery.
  - Administrative cancellation with stock release and non-refundable online payment guardrails.

### 6. Security & Administrative Audit Trail (Phase 6)
- **Path:** `/audit-logs`
- **Backend Endpoint:** `GET /api/v1/admin/audit-logs`
- **Capabilities:**
  - Read-only administrative audit log viewer supporting tabular and chronological vertical timeline representations.
  - Server-side filtering by actor ObjectId, uppercase action type, target resource type, resource ID, and ISO date boundaries.
  - Safe, recursive structuring for Mongoose `Mixed` event details supporting arbitrarily nested objects and arrays.
  - Deep inspection drawer with copyable identifiers and formatted raw JSON viewer.
  - Prominent UI disclosure outlining exact backend audit logging coverage.

### 7. Final Integration & Production Readiness (Phase 7)
- Full cross-module contract stabilization.
- Complete accessibility remediation: keyboard navigation on timeline cards (`role="button"`, `tabIndex={0}`, Enter/Space keys), ARIA dialog attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`), Escape key handlers, and backdrop dismissal.
- Removal of misleading real-time streaming language and artificial pulsing indicators.
- Pruned obsolete placeholder directories.

---

## Backend API Integration Reference

| Area | HTTP Method & Relative Endpoint | Description | Query / Body Parameters |
|---|---|---|---|
| **Auth** | `POST /auth/login` | Operator credentials sign-in | `body: { email, password }` |
| **Auth** | `POST /auth/refresh` | Refresh access token via HttpOnly cookie | *(HttpOnly cookie credentials)* |
| **Auth** | `POST /auth/logout` | Revoke session and clear cookies | *(HttpOnly cookie credentials)* |
| **Auth** | `GET /auth/me` | Fetch authenticated profile & role | Bearer token |
| **Dashboard** | `GET /admin/dashboard/summary` | Executive metrics summary | None |
| **Products** | `GET /admin/products` | Paginated catalog list | `page`, `limit`, `q`, `category`, `status`, `inStock`, `sortBy` |
| **Products** | `GET /admin/products/:id` | Single product details | None |
| **Products** | `POST /products` | Create product (admin) | `body: { sku, name, slug, category, price, ... }` |
| **Products** | `PATCH /products/:id` | Update product (admin) | `body: Partial<Product>` |
| **Products** | `PATCH /products/:id/status` | Transition lifecycle status | `body: { status: 'draft'\|'published'\|'archived' }` |
| **Categories** | `GET /admin/categories` | Admin category listing | `page`, `limit`, `includeInactive`, `sortBy` |
| **Categories** | `GET /categories` | Active categories (public/dropdown) | `page`, `limit` |
| **Categories** | `POST /categories` | Create category | `body: { name, slug, description, isActive }` |
| **Categories** | `PATCH /categories/:id` | Update category | `body: Partial<Category>` |
| **Categories** | `DELETE /categories/:id` | Soft deactivation (`isActive: false`)| None |
| **Inventory** | `GET /inventory/stock` | Warehouse stock listing | `page`, `limit`, `q`, `category`, `lowStockOnly`, `inStock`, `sortBy` |
| **Inventory** | `GET /inventory/low-stock` | Critical low-stock report | `page`, `limit`, `q`, `category`, `sortBy` |
| **Inventory** | `GET /inventory/movements` | Stock movement audit trail | `page`, `limit`, `productId`, `movementType`, `actor`, `startDate`, `endDate`, `sortBy` |
| **Inventory** | `POST /inventory/adjust` | Atomic stock delta adjustment | `headers: { 'idempotency-key' }`, `body: { productId, quantityDelta, reason }` |
| **Orders** | `GET /admin/orders` | Paginated orders listing | `page`, `limit`, `status`, `paymentMethod`, `paymentStatus`, `startDate`, `endDate` |
| **Orders** | `GET /admin/orders/:reference` | Full order dossier & logs | None |
| **Orders** | `PATCH /admin/orders/:reference/status`| Advance fulfillment status | `body: { status, tracking?, codPaymentCollected? }` |
| **Orders** | `POST /admin/orders/:reference/cancel` | Cancel order & release stock | `body: { reason }` |
| **Audit Logs** | `GET /admin/audit-logs` | Administrative audit trail | `page`, `limit`, `actor`, `action`, `resourceType`, `resourceId`, `startDate`, `endDate` |

---

## Known Backend Coverage & Data Semantics

1. **Recognized Revenue Calculation:** The backend aggregates revenue in `admin.service.js` by matching `paymentStatus: 'paid'`. It currently does not exclude cancelled orders that were previously marked paid. The frontend displays authoritative backend figures and includes an explanatory note.
2. **Administrative Audit Coverage:** The backend `audit_logs` collection currently records administrative order operations (`ORDER_STATUS_CHANGED`, `ORDER_CANCELLED`, `COD_PAYMENT_COLLECTED`). Catalog mutations (products and categories) and authentication events are not logged to this collection. Inventory modifications are recorded in the dedicated, append-only `inventory_movements` collection.

---

## Repository Structure

```text
admin_frontend/
├── public/
│   └── favicon.svg              # Brand icon
├── src/
│   ├── app/
│   │   ├── providers/
│   │   │   └── AuthProvider.jsx # In-memory auth context & session lifecycle
│   │   ├── App.jsx              # Application root
│   │   └── router.jsx           # Protected & public routes
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.jsx  # Layout shell with Sidebar & Topbar
│   │   │   ├── ProtectedRoute.jsx # RBAC & account active status guard
│   │   │   ├── Sidebar.jsx      # Navigation rail
│   │   │   └── Topbar.jsx       # Context bar & sign out
│   │   └── ui/
│   │       ├── Button.jsx       # Tactical button variants
│   │       ├── ErrorState.jsx   # Standardized error component
│   │       ├── Input.jsx        # Accessible validated inputs
│   │       ├── LoadingState.jsx # Terminal radar loader
│   │       ├── PageHeader.jsx   # Shared page headers
│   │       └── Pagination.jsx   # Server metadata pagination component
│   ├── features/
│   │   ├── auditLogs/
│   │   │   ├── AuditLogsView.jsx # Security audit trail screen
│   │   │   ├── auditLogApi.js    # Audit log endpoints connector
│   │   │   ├── auditLogValidation.js # Filter & details format validation
│   │   │   └── components/
│   │   │       ├── AuditLogDetailsDrawer.jsx
│   │   │       ├── AuditLogFilters.jsx
│   │   │       ├── AuditLogSummary.jsx
│   │   │       ├── AuditLogTable.jsx
│   │   │       └── AuditLogTimeline.jsx
│   │   ├── auth/
│   │   │   └── LoginView.jsx    # Authentication gateway
│   │   ├── categories/
│   │   │   ├── CategoriesView.jsx # Category taxonomy management
│   │   │   ├── categoryApi.js    # Category endpoints connector
│   │   │   ├── categoryValidation.js # Category schema validation
│   │   │   └── components/
│   │   │       ├── CategoriesTable.jsx
│   │   │       ├── CategoryDeactivateModal.jsx
│   │   │       └── CategoryFormModal.jsx
│   │   ├── dashboard/
│   │   │   ├── DashboardView.jsx # Executive Control Center
│   │   │   └── components/
│   │   │       ├── DashboardSkeleton.jsx
│   │   │       ├── KpiRibbon.jsx
│   │   │       ├── OrderPipelineDistribution.jsx
│   │   │       └── RecentOrdersTable.jsx
│   │   ├── inventory/
│   │   │   ├── InventoryView.jsx # Warehouse stock & movements
│   │   │   ├── inventoryApi.js    # Inventory endpoints connector
│   │   │   ├── inventoryValidation.js # Adjustment & filter validation
│   │   │   └── components/
│   │   │       ├── InventoryKpis.jsx
│   │   │       ├── LowStockTable.jsx
│   │   │       ├── MovementHistoryTable.jsx
│   │   │       ├── StockAdjustmentModal.jsx
│   │   │       └── StockOverviewTable.jsx
│   │   ├── orders/
│   │   │   ├── OrdersView.jsx   # Orders & fulfillment management
│   │   │   ├── orderApi.js      # Order endpoints connector
│   │   │   ├── orderValidation.js # Transition & tracking validation
│   │   │   └── components/
│   │   │       ├── OrderCancelModal.jsx
│   │   │       ├── OrderDetailsDrawer.jsx
│   │   │       ├── OrderFilters.jsx
│   │   │       ├── OrderStatusModal.jsx
│   │   │       ├── OrderTimeline.jsx
│   │   │       └── OrdersTable.jsx
│   │   └── products/
│   │       ├── ProductsView.jsx # Products catalog management
│   │       ├── productApi.js    # Product endpoints connector
│   │       ├── productValidation.js # Product schema validation
│   │       └── components/
│   │           ├── ProductFormDrawer.jsx
│   │           ├── ProductStatusModal.jsx
│   │           └── ProductsTable.jsx
│   ├── lib/
│   │   ├── apiClient.js         # Fetch client with metadata preservation & refresh
│   │   ├── errors.js            # Normalized ApiError envelope
│   │   └── formatters.js        # Currency, price parser, and date helpers
│   ├── styles/
│   │   └── index.css            # Tailwind directives & dark theme
│   └── main.jsx                 # Application entry point
├── tests/
│   ├── auditLogApi.test.js      # Audit log query builder tests
│   ├── auditLogValidation.test.js # Audit log ObjectId and date tests
│   ├── auth.test.js             # In-memory token lifecycle tests
│   ├── categoryValidation.test.js # Category validation tests
│   ├── dashboard.test.js        # Dashboard aggregation tests
│   ├── errors.test.js           # Error normalization tests
│   ├── formatters.test.js       # Minor-unit currency & relative time tests
│   ├── inventoryApi.test.js     # Inventory endpoint builder tests
│   ├── inventoryValidation.test.js # Stock adjustment delta & idempotency tests
│   ├── normalization.test.js    # Response envelope metadata tests
│   ├── orderApi.test.js         # Order endpoint builder tests
│   ├── orderValidation.test.js  # Order transition & tracking tests
│   ├── priceParser.test.js      # Monetary input parser tests
│   └── productValidation.test.js # Product schema validation tests
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## Local Development & Setup

### 1. Prerequisites
- **Node.js**: v20.0.0 or higher
- **Backend Service**: `driprack-backend` running on port 5000 (or configured remote URL)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure configuration keys match your local or test environment:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_CURRENCY_CODE=USD
```
*(Notice: Never commit private backend secrets to frontend `.env` files. Values prefixed with `VITE_` are public assets baked at build time.)*

### 3. Installation
```bash
npm ci
```

### 4. Running the Development Server
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

---

## Verification & Testing

The project uses the Node.js native test runner (`node --test`), requiring zero external test harness overhead.

### Run Unit & Contract Tests
```bash
npm test
```
*Current test suite: 65 passing unit and integration tests across all modules.*

### Run Production Build
```bash
npm run build
```
Generates production assets in `dist/`.

---

## Production Deployment Readiness

### 1. Separate Deployment Architecture
The frontend is a static Single Page Application (SPA). It should be deployed to a static host or CDN (e.g., Cloudflare Pages, Vercel, Netlify, AWS S3/CloudFront, or Nginx).

### 2. SPA Fallback Routing
Because React Router handles routing in the browser, your web server or hosting provider must rewrite all unknown routes to `/index.html`:
- **Nginx:** `try_files $uri $uri/ /index.html;`
- **Netlify:** `/* /index.html 200` in `_redirects`
- **Vercel:** `rewrites: [{ "source": "/(.*)", "destination": "/index.html" }]` in `vercel.json`

### 3. Cross-Origin Resource Sharing (CORS) & Cookies
Because the frontend and backend are hosted on separate domains/ports:
1. **Backend CORS Allowlist:** The backend `CORS_ORIGIN` must explicitly match the production frontend origin (e.g. `https://admin.driprack.example.com`). Wildcards (`*`) are disallowed when using credentials.
2. **HttpOnly Cookie Settings:** The backend must set `SameSite=None` and `Secure=true` (or host frontend and backend under the same parent domain with `SameSite=Lax`).
3. **HTTPS Requirement:** Modern browsers reject cross-site `SameSite=None` cookies unless served strictly over HTTPS.
