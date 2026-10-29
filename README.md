# DripRack Admin Frontend — Tactical Control System (Phase 1)

Phase 1 implementation of the administrative control interface for the **DripRack** streetwear e-commerce platform.

---

## Overview

The DripRack Admin interface is architected separately from the customer client frontend. It provides verified operators with administrative tooling, order management, inventory operations, and security audit logs, built strictly according to `DESIGN.md` and the tactical design tokens.

### Phase 1 Scope & Boundary

This phase strictly establishes:
- **Project Foundation:** Modern React 18 single-page application bundled with Vite.
- **Design System:** Tactical dark-zinc surfaces, electric-blue accents, emerald indicators, and Space Grotesk / Geist / JetBrains Mono typography.
- **Secure Authentication Gateway (`/login`):** Pixel-faithful implementation of the reference authentication gateway with email/password validation, credential toggle, duplicate-submit suppression, and generic error messaging.
- **In-Memory Token Architecture:** Zero persistent storage (`localStorage` / `sessionStorage`) usage for access tokens or administrator credentials.
- **Silent Session Restoration:** Cookie-based HttpOnly refresh token rotation across browser refreshes via `/api/v1/auth/refresh`.
- **Strict Role-Based Access Control:** Rejection and cookie invalidation for non-admin accounts.
- **Shared Tactical Layout:** Reusable `AdminLayout`, `Sidebar`, and `Topbar` with active route indicators and user identity.
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
     (HttpOnly Cookie auto-sent) │     - Auto-refresh on 401 with request queuing
```

1. **Zero Browser Storage Policy:** Access tokens, refresh tokens, and passwords are never written to `localStorage` or `sessionStorage`, eliminating standard token exfiltration vectors via cross-site scripting (XSS).
2. **HttpOnly Refresh Cookies:** Refresh tokens are managed exclusively by the browser in HttpOnly, SameSite cookies scoped to `/api/v1/auth`.
3. **Single-Flight Refresh Mutex:** When a token expires, pending concurrent API calls queue behind a single silent refresh operation rather than bombarding the server with duplicate rotation requests.
4. **Role Enforcement:** Accounts logging in with customer roles are immediately barred, their refresh cookie is revoked via `/api/v1/auth/logout`, and in-memory state is flushed.

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
│   │   │   ├── ProtectedRoute.jsx # RBAC route guard
│   │   │   ├── Sidebar.jsx      # Navigation rail & operator status
│   │   │   └── Topbar.jsx       # Context bar & quick actions
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
│   │       ├── OrdersPlaceholder.jsx
│   │       ├── ProductsPlaceholder.jsx
│   │       ├── CategoriesPlaceholder.jsx
│   │       ├── InventoryPlaceholder.jsx
│   │       └── AuditLogsPlaceholder.jsx
│   ├── lib/
│   │   ├── apiClient.js         # Fetch client with interceptors
│   │   └── errors.js            # Standardized ApiError envelope
│   ├── styles/
│   │   └── index.css            # Tailwind directives & theme scrollbars
│   └── main.jsx                 # Vite entry point
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

## Scripts & Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview
```

---

## Verified Backend Endpoints

| Endpoint | Method | Purpose | Credentials / Headers |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | `POST` | Authenticate operator | `email`, `password` |
| `/api/v1/auth/refresh` | `POST` | Silent token renewal | `credentials: 'include'` (HttpOnly cookie) |
| `/api/v1/auth/logout` | `POST` | Invalidate refresh token | `credentials: 'include'` |
| `/api/v1/auth/me` | `GET` | Fetch authenticated profile | `Authorization: Bearer <accessToken>` |

