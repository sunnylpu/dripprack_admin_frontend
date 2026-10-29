# DripRack Admin Frontend — Tactical Control System (Phase 1)

Phase 1 implementation of the administrative control interface for the **DripRack** streetwear e-commerce platform.

---

## Overview

The DripRack Admin interface is architected separately from the customer client frontend. It provides verified operators with administrative tooling, order management, inventory operations, and security audit logs, built strictly according to `DESIGN.md` and the tactical design tokens.

### Phase 1 Scope & Boundary

This phase strictly establishes:
- **Project Foundation:** Modern React 18 single-page application bundled with Vite.
- **Design System:** Tactical dark-zinc surfaces, electric-blue accents, emerald indicators, and Space Grotesk / Geist / JetBrains Mono typography.
- **Secure Authentication Gateway (`/login`):** Pixel-faithful implementation of the reference authentication gateway with email/password validation, credential toggle, duplicate-submit suppression, and normalized error messaging.
- **In-Memory Token Architecture:** Zero persistent storage (`localStorage` / `sessionStorage`) usage for access tokens or administrator credentials.
- **Silent Session Restoration:** Cookie-based HttpOnly refresh token rotation across browser refreshes via `/api/v1/auth/refresh`.
- **Strict Role & Status Verification:** Rejection and cookie invalidation for non-admin accounts or accounts with `status !== 'active'`.
- **Shared Tactical Layout:** Reusable `AdminLayout`, `Sidebar`, and `Topbar` with active route indicators and operator identity.
- **Honest Route Placeholders:** Clean, transparent placeholders for future phases (`/dashboard`, `/orders`, `/products`, `/categories`, `/inventory`, `/audit-logs`) with zero fabricated metrics or mock states.

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

- **Phase 1: Foundation, Admin Authentication & Protected Layout** *(Current — Code Complete)*
- **Phase 2: Executive Dashboard** (`/dashboard` via `/api/v1/admin/dashboard/summary` & `/api/v1/admin/orders`)
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
│   │   │   └── DashboardView.jsx # Admin control center landing page
│   │   └── placeholders/
│   │       ├── PhasePlaceholderView.jsx # Honest module placeholder
│   │       ├── OrdersPlaceholder.jsx    # Phase 5
│   │       ├── ProductsPlaceholder.jsx  # Phase 3
│   │       ├── CategoriesPlaceholder.jsx # Phase 3
│   │       ├── InventoryPlaceholder.jsx # Phase 4
│   │       └── AuditLogsPlaceholder.jsx # Phase 6
│   ├── lib/
│   │   ├── apiClient.js         # Fetch client with idempotency-safe interceptors
│   │   └── errors.js            # Standardized ApiError envelope
│   ├── styles/
│   │   └── index.css            # Tailwind directives & theme scrollbars
│   └── main.jsx                 # Vite entry point
├── tests/
│   ├── auth.test.js             # Unit tests for in-memory token lifecycle
│   └── errors.test.js           # Unit tests for error normalization
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

# Run unit tests (Node.js native test runner, zero extra dependencies)
npm test

# Start development server (http://localhost:5173)
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview
```

---

## Actual Backend Endpoints Mapped

| Module | Method | Route | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Operator login |
| | `POST` | `/api/v1/auth/refresh` | HttpOnly cookie refresh |
| | `POST` | `/api/v1/auth/logout` | Clear refresh session |
| | `GET` | `/api/v1/auth/me` | Fetch authenticated profile |
| **Dashboard (Phase 2)** | `GET` | `/api/v1/admin/dashboard/summary` | Executive KPI aggregations |
| **Products (Phase 3)** | `GET` | `/api/v1/admin/products` | Admin listing (all statuses) |
| | `GET` | `/api/v1/admin/products/:id` | Admin product detail |
| | `POST` | `/api/v1/products` | Create product (admin) |
| | `PATCH` | `/api/v1/products/:id` | Update product catalog fields |
| | `PATCH` | `/api/v1/products/:id/status` | Update status (draft/published/archived) |
| **Categories (Phase 3)**| `GET` | `/api/v1/admin/categories` | Admin category listing |
| | `POST` | `/api/v1/categories` | Create category (admin) |
| | `PATCH` | `/api/v1/categories/:id` | Update category (admin) |
| | `DELETE`| `/api/v1/categories/:id` | Soft deactivation (admin) |
| **Inventory (Phase 4)** | `GET` | `/api/v1/inventory/stock` | Stock overview |
| | `GET` | `/api/v1/inventory/low-stock` | Low-stock queries |
| | `GET` | `/api/v1/inventory/movements` | Immutable movements log |
| | `POST` | `/api/v1/inventory/adjust` | Atomic stock adjustments |
| **Orders (Phase 5)** | `GET` | `/api/v1/admin/orders` | Admin orders list |
| | `GET` | `/api/v1/admin/orders/:reference` | Order detail by reference |
| | `PATCH` | `/api/v1/admin/orders/:reference/status` | State transition & tracking |
| | `POST` | `/api/v1/admin/orders/:reference/cancel` | Admin cancellation & stock return |
| **Audit (Phase 6)** | `GET` | `/api/v1/admin/audit-logs` | Admin audit log stream |
