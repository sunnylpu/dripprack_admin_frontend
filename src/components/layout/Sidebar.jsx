import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider.jsx';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  FolderTree,
  Boxes,
  ShieldCheck,
  LogOut,
  X
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
  { path: '/products', label: 'Products Catalog', icon: Layers },
  { path: '/categories', label: 'Category Taxonomy', icon: FolderTree },
  { path: '/inventory', label: 'Inventory & Movements', icon: Boxes },
  { path: '/audit-logs', label: 'Security Audit Trail', icon: ShieldCheck }
];

export function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Rail */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant/30 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-4 border-b border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center border border-outline-variant/30">
                <span className="font-headline font-bold text-primary text-base">DR</span>
              </div>
              <span className="font-headline text-base text-on-surface tracking-wider uppercase font-bold">
                DRIPRACK
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] bg-surface-container px-1.5 py-0.5 rounded text-outline border border-outline-variant/40">
                v2.4
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-outline hover:text-on-surface lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Node Status Strip */}
          <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/40 select-none">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-outline">
                ENVIRONMENT
              </span>
              <span className="font-mono text-[11px] text-outline bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/30">
                ADMIN CONSOLE
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-block h-2 w-2 rounded-full bg-outline-variant"></span>
              <span className="font-mono text-xs text-outline">
                API STATUS UNCHECKED
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 transition-all rounded-md text-sm font-headline tracking-wide ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Identity & Logout Action Footer */}
        <div className="p-3 border-t border-outline-variant/30 bg-surface-container-lowest">
          <div className="flex items-center justify-between p-2 rounded bg-surface-container-low border border-outline-variant/30">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-mono text-xs text-primary font-bold shrink-0 border border-outline-variant/40">
                {user?.firstName?.[0] || 'A'}
                {user?.lastName?.[0] || 'D'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-body text-xs text-on-surface truncate font-medium">
                  {user ? `${user.firstName} ${user.lastName}` : 'Administrator'}
                </span>
                <span className="font-mono text-[11px] text-primary uppercase tracking-tight">
                  {user?.role === 'admin' ? 'Superadmin' : user?.role || 'Operator'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-outline hover:text-error hover:bg-error-container/20 rounded transition-colors"
              title="Sign Out of Session"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

