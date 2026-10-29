import React from 'react';
import { useAuth } from '../../app/providers/AuthProvider.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Server,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardView() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        subtitle={`Authenticated operator: ${user?.firstName || 'Admin'} ${user?.lastName || ''} (${user?.email || 'session'})`}
        badge="PHASE 1 IMPLEMENTED"
      />

      {/* Security & Client Foundation Architecture Banner */}
      <div className="p-6 rounded-lg bg-surface-container-lowest border border-outline-variant/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider">
                Phase 1 Architecture Complete // Awaiting Runtime QA
              </span>
            </div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              Welcome, {user?.firstName || 'Administrator'}
            </h2>
            <p className="text-sm font-body text-outline max-w-2xl leading-relaxed">
              Phase 1 establishes the client application foundation, in-memory token management, HttpOnly refresh session restoration, RBAC route shielding, and the tactical layout. Business operational metrics will populate in Phase 2.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-secondary shrink-0" />
              <div className="text-xs">
                <span className="text-outline block font-mono text-[10px]">SESSION ROLE</span>
                <span className="font-mono font-bold text-on-surface uppercase">{user?.role || 'ADMIN'}</span>
              </div>
            </div>

            <div className="px-3 py-2 rounded bg-surface-container border border-outline-variant/40 flex items-center gap-3">
              <Server className="w-4 h-4 text-primary shrink-0" />
              <div className="text-xs">
                <span className="text-outline block font-mono text-[10px]">TOKEN STORAGE</span>
                <span className="font-mono font-bold text-on-surface">IN-MEMORY ONLY</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Implementation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-primary mb-3 border border-outline-variant/30">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-sm text-on-surface mb-1">
              Zero LocalStorage Exposure
            </h3>
            <p className="font-body text-xs text-outline leading-relaxed">
              No JWT access tokens, refresh tokens, or administrative credentials are saved to localStorage or sessionStorage, completely mitigating XSS token harvesting.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center text-[11px] font-mono text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            IMPLEMENTED IN CLIENT SOURCE
          </div>
        </div>

        <div className="p-5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-secondary mb-3 border border-outline-variant/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-sm text-on-surface mb-1">
              HttpOnly Refresh Flow
            </h3>
            <p className="font-body text-xs text-outline leading-relaxed">
              Session recovery across browser reloads calls <code>/api/v1/auth/refresh</code> using the backend's HttpOnly cookie, guarded by a single-flight mutex.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center text-[11px] font-mono text-outline">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-secondary" />
            CONFIGURED IN CLIENT SERVICE
          </div>
        </div>

        <div className="p-5 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded bg-surface-container flex items-center justify-center text-primary mb-3 border border-outline-variant/30">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-headline font-bold text-sm text-on-surface mb-1">
              Design System Tokens
            </h3>
            <p className="font-body text-xs text-outline leading-relaxed">
              Tactical streetwear tokens from DESIGN.md configured in Tailwind: dark-zinc surfaces, electric-blue accents, and Space Grotesk / Geist / JetBrains Mono typography.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center text-[11px] font-mono text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            DESIGN TOKENS CONFIGURED
          </div>
        </div>
      </div>

      {/* Agreed 7-Phase Implementation Roadmap */}
      <div className="p-6 rounded-lg bg-surface-container-lowest border border-outline-variant/30">
        <h3 className="font-headline font-bold text-base text-on-surface mb-1">
          Implementation Roadmap (Phases 1–7)
        </h3>
        <p className="font-body text-xs text-outline mb-6">
          Phase 1 boundary preserved. Modules below are mapped to existing backend controllers according to the agreed project schedule:
        </p>

        <div className="space-y-3">
          {[
            {
              phase: 'Phase 1',
              title: 'Foundation, Admin Authentication & Protected Layout',
              desc: 'Admin login gateway, in-memory tokens, HttpOnly refresh restoration, RBAC route shielding, and tactical admin layout.',
              status: 'Implemented',
              active: true,
              path: '/dashboard'
            },
            {
              phase: 'Phase 2',
              title: 'Executive Dashboard',
              desc: 'Executive KPI metrics (/api/v1/admin/dashboard/summary) and recent orders stream (/api/v1/admin/orders) with currency formatting and status badges.',
              status: 'Next Target (Phase 2)',
              active: false,
              path: '/dashboard'
            },
            {
              phase: 'Phase 3',
              title: 'Products & Categories',
              desc: 'Product catalog CRUD (/api/v1/admin/products, /api/v1/products/:id/status) and category taxonomy management (/api/v1/admin/categories, /api/v1/categories).',
              status: 'Scheduled (Phase 3)',
              active: false,
              path: '/products'
            },
            {
              phase: 'Phase 4',
              title: 'Inventory & Stock Movements',
              desc: 'Atomic stock adjustments (/api/v1/inventory/adjust), stock overview (/api/v1/inventory/stock), low-stock queries, and movements audit log.',
              status: 'Scheduled (Phase 4)',
              active: false,
              path: '/inventory'
            },
            {
              phase: 'Phase 5',
              title: 'Orders & Fulfillment',
              desc: 'Order lifecycle management (/api/v1/admin/orders), reference lookup, status transitions with tracking numbers, and cancellation with inventory release.',
              status: 'Scheduled (Phase 5)',
              active: false,
              path: '/orders'
            },
            {
              phase: 'Phase 6',
              title: 'Security Audit Trail',
              desc: 'Administrative audit trail (/api/v1/admin/audit-logs) with actor tracking, event filtering, and entity modification logs.',
              status: 'Scheduled (Phase 6)',
              active: false,
              path: '/audit-logs'
            },
            {
              phase: 'Phase 7',
              title: 'Final Integration & QA',
              desc: 'End-to-end integration testing, error boundary edge cases, session rotation verification, and deployment readiness.',
              status: 'Scheduled (Phase 7)',
              active: false,
              path: '/dashboard'
            }
          ].map((item) => (
            <div
              key={item.phase + item.title}
              className={`p-4 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                item.active
                  ? 'bg-surface-container-low border-primary/30'
                  : 'bg-surface-container-lowest border-outline-variant/20 hover:border-outline-variant/40'
              }`}
            >
              <div className="flex items-start gap-3">
                {item.active ? (
                  <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-outline mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
                      {item.phase}
                    </span>
                    <span className="text-outline text-xs">•</span>
                    <span className="font-headline font-bold text-sm text-on-surface">
                      {item.title}
                    </span>
                  </div>
                  <p className="font-body text-xs text-outline mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span
                  className={`font-mono text-xs px-2.5 py-1 rounded border ${
                    item.active
                      ? 'bg-secondary/10 border-secondary/30 text-secondary'
                      : 'bg-surface-container border-outline-variant/30 text-outline'
                  }`}
                >
                  {item.status}
                </span>

                <Link
                  to={item.path}
                  className="p-1.5 text-outline hover:text-on-surface rounded hover:bg-surface-container"
                  title={`Inspect ${item.title}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
