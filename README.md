# DripRack Admin Frontend — Tactical Control System (Phases 1 & 2 Complete)

The administrative control interface for the **DripRack** streetwear e-commerce platform.

---

## Overview

The DripRack Admin interface is architected separately from the customer client frontend. It provides verified operators with administrative tooling, order management, inventory operations, and security audit logs, built strictly according to `DESIGN.md` and the tactical design tokens.

### Phase 1 & 2 Implementations

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
  - 4 Executive KPI cards:
    - **Recognized Revenue**: integer-cents conversion via `Intl.NumberFormat`, `revenue.currency`, and paid orders count.
    - **Total Order Volume**: overall order counts across all lifecycles.
    - **Action Required**: orders awaiting fulfillment action (`confirmed` + `processing`).
    - **Critical Stock Alerts**: count of active SKUs where available stock is at or below threshold.
  - **Order Pipeline Distribution**: composite ratio bar and breakdown for all 6 supported statuses (`awaiting_payment`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`) with zero-division safety.
  - **Recent Orders Stream**: bounded table of up to 10 latest orders with customer info, relative timestamps, payment state badges, fulfillment badges, and client-side filtering.
  - **Tactical UI States**: skeleton loading, empty state, and manual pulse refresh with non-destructive error handling.

---

## Backend Data Semantics Caveat

> **Important Caveat (Backend Order Revenue Aggregation):**
> As verified in `backend/src/modules/admin/admin.service.js`, the backend aggregates `totalRevenueCents` by matching `paymentStatus: 'paid'` without explicitly excluding orders whose `orderStatus === 'cancelled'`. The frontend displays authoritative backend figures without fabricating client-side recalculations, and surfaces this note transparently in the dashboard interface.

---

## Security Architecture

```
                    ┌─────────────────────────┐
                    │    Browser User Agent    │
                    └────────────┬────────────┘
                                 │
     1. POST /auth/login         │  2. Response:
     (email, password)           │     - Access Token -> In-Memory State
                                 │     - Refresh Token -> HttpOnly Cookie (path: /api/v1/auth)
                                 ▼
                    ┌─────────────────────────┐
                    │  DripRack Auth Backend  │
                    └─────────────────────────┘
                                 ▲
     3. Browser Reload           │  4. In-flight API Requests:
     POST /auth/refresh          │     - Authorization: Bearer <inMemoryToken>
     (HttpOnly Cookie auto-sent) │     - Auto-refresh on 401 for idempotent requests
```

1. **Zero Browser Storage Policy:** Access tokens, refresh tokens, and passwords are never written to `localStorage` or `sessionStorage`, eliminating standard token exfiltration vectors via cross-site scripting (XSS).
2. **HttpOnly Refresh Cookies:** Refresh tokens are managed exclusively by the browser in HttpOnly, SameSite cookies scoped to `/api/v1/auth`.
3. **Single-Flight Refresh Mutex:** When a token expires, pending concurrent API calls queue behind a single silent refresh operation rather than bombarding the server with duplicate rotation requests.
4. **Idempotency Guard on 401:** Automatically retries idempotent read methods (`GET`, `HEAD`, `OPTIONS`) after token refresh; mutating methods (`POST`, `PATCH`, `DELETE`) are never silently auto-replayed to prevent accidental duplicate actions.
5. **Strict Role & Account Status Verification:** Accounts with non-admin roles or inactive accounts (`status !== 'active'`) are immediately barred, their refresh cookie is revoked via `/api/v1/auth/logout`, and in-memory state is cleared.

---

## Agreed Project Roadmap (Phases 1–7)

- **Phase 1: Foundation, Admin Authentication & Protected Layout** *(Complete)*
- **Phase 2: Executive Dashboard** *(Complete)*
- **Phase 3: Products & Categories** (`/products` & `/categories` via `/api/v1/admin/products`, `/api/v1/admin/categories`, `/api/v1/products`)
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
│   │       └── PageHeader.jsx   # Shared page headers
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
│   │   └── placeholders/
│   │       ├── PhasePlaceholderView.jsx # Honest module placeholder
│   │       ├── OrdersPlaceholder.jsx    # Phase 5
│   │       ├── ProductsPlaceholder.jsx  # Phase 3
│   │       ├── CategoriesPlaceholder.jsx # Phase 3
│   │       ├── InventoryPlaceholder.jsx # Phase 4
│   │       └── AuditLogsPlaceholder.jsx # Phase 6
│   ├── lib/
│   │   ├── apiClient.js         # Fetch client with idempotency-safe interceptors
│   │   ├── errors.js            # Standardized ApiError envelope
│   │   └── formatters.js        # Currency, numbers, and relative time helpers
│   ├── styles/
│   │   └── index.css            # Tailwind directives & theme scrollbars
│   └── main.jsx                 # Vite entry point
├── tests/
│   ├── auth.test.js             # Unit tests for in-memory token lifecycle
│   ├── dashboard.test.js        # Unit tests for dashboard data transformation
│   ├── errors.test.js           # Unit tests for error normalization
│   └── formatters.test.js       # Unit tests for currency & date helpers
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

The application reads its backend base URL from the `VITE_API_BASE_URL` environment variable:

```bash
# .env (local development)
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

A template is provided in `.env.example`:
```ini
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

> **Note on CORS:** The backend CORS configuration allowlists `http://localhost:5173` and `http://localhost:3000`. The Vite development server is configured to run on port `5173`.

---

## Scripts & Verification

```bash
# Install dependencies
npm install

# Run unit tests (Node.js native test runner, 16 passing tests)
npm test

# Start development server (http://localhost:5173)
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview
```
