# DripRack Admin Frontend — Tactical Control System (Phases 1, 2 & 3 Complete)

The administrative control interface for the **DripRack** streetwear e-commerce platform.

---

## Overview

The DripRack Admin interface is architected separately from the customer client frontend. It provides verified operators with administrative tooling, order management, inventory operations, and security audit logs, built strictly according to `DESIGN.md` and the tactical design tokens.

### Phase 1, 2 & 3 Implementations

- **Phase 1: Foundation, Admin Authentication & Protected Layout**
  - Modern React 18 single-page application bundled with Vite and Tailwind CSS.
  - Tactical dark-zinc surfaces, electric-blue accents, emerald indicators, and Space Grotesk / Geist / JetBrains Mono typography.
  - Authentication gateway (`/login`) with credential toggle, duplicate-submit suppression, and normalized error messaging.
  - In-memory access token architecture with zero persistent browser storage (`localStorage` / `sessionStorage`).
  - Silent session restoration via HttpOnly refresh cookie (`/api/v1/auth/refresh`) with a single-flight mutex.
  - Strict RBAC & account active status verification (`user.role === 'admin' && user.status === 'active'`).
  - Idempotency-aware 401 retry interceptor (only idempotent `GET`, `HEAD`, `OPTIONS` requests auto-replay).
- **Phase 2: Executive Dashboard (`/dashboard`)**
  - Direct integration with `GET /api/v1/admin/dashboard/summary`.
  - 4 Executive KPI cards (Recognized Revenue, Total Volume, Action Required, Critical Stock).
  - Order Pipeline Distribution composite ratio bar across all 6 supported statuses.
  - Recent Orders Snapshot data table with customer info and payment/fulfillment badges.
  - UI states: skeleton loading, empty state, and manual pulse refresh.
- **Phase 3: Products Catalog & Category Taxonomy (`/products` & `/categories`)**
  - **Centralized Pagination Normalization**: `normalizeApiResponse` preserves top-level `meta` (`page`, `limit`, `total`, `totalPages`, `hasNextPage`, `hasPrevPage`) alongside unwrapped `data`.
  - **Category Taxonomy Management (`/categories`)**:
    - Full list using `GET /api/v1/admin/categories` with server pagination and `includeInactive` filtering.
    - Category creation via `POST /api/v1/categories`.
    - Category editing via `PATCH /api/v1/categories/:id`.
    - Soft deactivation via `DELETE /api/v1/categories/:id` with confirmation modal explaining that `isActive: false` hides products from storefronts without destroying relations.
    - Reactivation via `PATCH /api/v1/categories/:id` with `{ isActive: true }`.
  - **Products Catalog Management (`/products`)**:
    - Listing via `GET /api/v1/admin/products` supporting `page`, `limit`, `q`, `category`, `status`, `inStock`, and `sortBy`.
    - Category selector dynamically populates active categories using `GET /api/v1/categories`.
    - Human monetary input converted to integer minor units without floating-point errors via `parseCurrencyToCents`.
    - URL-based image editor supporting up to 10 HTTPS asset links with previews.
    - Product creation via `POST /api/v1/products` and editing via `PATCH /api/v1/products/:id`.
    - Lifecycle status transition via `PATCH /api/v1/products/:id/status` (`draft`, `published`, `archived`), enforcing active category constraint.
    - Read-only inventory fields (`stock.physical`, `stock.reserved`, `stock.available`), preserving Phase 4 boundaries.

---

## Backend Data Semantics & Constraints

1. **Revenue Aggregation Caveat:** Backend aggregates `totalRevenueCents` by `paymentStatus: 'paid'` without excluding cancelled orders. Handled transparently by displaying authoritative backend figures with an explanatory footnote.
2. **Category Invariant:** Products cannot be published under an inactive category (HTTP 409 Conflict).
3. **Inventory Separation:** Products are created with 0 physical stock. Warehouse inventory receipts and mutations are isolated to Phase 4.

---

## Agreed Project Roadmap (Phases 1–7)

- **Phase 1: Foundation, Admin Authentication & Protected Layout** *(Complete)*
- **Phase 2: Executive Dashboard** *(Complete)*
- **Phase 3: Products & Categories** *(Complete)*
- **Phase 4: Inventory & Stock Movements** (`/inventory` via `/api/v1/inventory/stock`, `/low-stock`, `/movements`, `/adjust`)
- **Phase 5: Orders & Fulfillment** (`/orders` via `/api/v1/admin/orders`, `/:reference`, `/:reference/status`, `/:reference/cancel`)
- **Phase 6: Security Audit Trail** (`/audit-logs` via `/api/v1/admin/audit-logs`)
- **Phase 7: Final Integration & QA** (End-to-end regression, session rotation verification, and deployment readiness)

---

## Project Structure

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
│   │   │   ├── AdminLayout.jsx  # Tactical shell with Sidebar & Topbar
│   │   │   ├── ProtectedRoute.jsx # RBAC & active status route guard
│   │   │   ├── Sidebar.jsx      # Navigation rail & neutral operator status
│   │   │   └── Topbar.jsx       # Context bar & neutral standby status
│   │   └── ui/
│   │       ├── Button.jsx       # Tactical button variants
│   │       ├── ErrorState.jsx   # Standardized error component
│   │       ├── Input.jsx        # Validated input with toggle
│   │       ├── LoadingState.jsx # Radar terminal loader
│   │       ├── PageHeader.jsx   # Shared page headers
│   │       └── Pagination.jsx   # Server metadata pagination component
│   ├── features/
│   │   ├── auth/
│   │   │   └── LoginView.jsx    # Authentication gateway
│   │   ├── dashboard/
│   │   │   ├── DashboardView.jsx # Live Executive Control Center
│   │   │   └── components/
│   │   │       ├── DashboardSkeleton.jsx
│   │   │       ├── KpiRibbon.jsx
│   │   │       ├── OrderPipelineDistribution.jsx
│   │   │       └── RecentOrdersTable.jsx
│   │   ├── products/
│   │   │   ├── ProductsView.jsx # Products catalog management screen
│   │   │   ├── productApi.js    # Product endpoints connector
│   │   │   ├── productValidation.js # Product input validation
│   │   │   └── components/
│   │   │       ├── ProductFormDrawer.jsx
│   │   │       ├── ProductStatusModal.jsx
│   │   │       └── ProductsTable.jsx
│   │   ├── categories/
│   │   │   ├── CategoriesView.jsx # Category taxonomy management screen
│   │   │   ├── categoryApi.js    # Category endpoints connector
│   │   │   ├── categoryValidation.js # Category input validation
│   │   │   └── components/
│   │   │       ├── CategoryFormModal.jsx
│   │   │       ├── CategoryDeactivateModal.jsx
│   │   │       └── CategoriesTable.jsx
│   │   └── placeholders/
│   │       ├── PhasePlaceholderView.jsx
│   │       ├── OrdersPlaceholder.jsx    # Phase 5
│   │       ├── InventoryPlaceholder.jsx # Phase 4
│   │       └── AuditLogsPlaceholder.jsx # Phase 6
│   ├── lib/
│   │   ├── apiClient.js         # Fetch client with pagination metadata preservation
│   │   ├── errors.js            # Standardized ApiError envelope
│   │   └── formatters.js        # Currency, price parser, numbers, and relative time helpers
│   ├── styles/
│   │   └── index.css            # Tailwind directives & theme scrollbars
│   └── main.jsx                 # Vite entry point
├── tests/
│   ├── auth.test.js             # In-memory token lifecycle tests
│   ├── categoryValidation.test.js # Category validation tests
│   ├── dashboard.test.js        # Dashboard data transformation tests
│   ├── errors.test.js           # Error normalization tests
│   ├── formatters.test.js       # Currency & date helper tests
│   ├── normalization.test.js    # Response envelope metadata preservation tests
│   ├── priceParser.test.js      # Decimal monetary input to cents parser tests
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

## Configuration & Environment

```bash
# .env (local development)
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_CURRENCY_CODE=USD
```

---

## Scripts & Verification

```bash
# Install dependencies
npm install

# Run unit tests (Node.js native test runner, 26 passing tests)
npm test

# Start development server (http://localhost:5173)
npm run dev

# Run production build
npm run build
```
