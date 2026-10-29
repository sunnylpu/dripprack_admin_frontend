import React from 'react';
import { useAuth } from '../../app/providers/AuthProvider.jsx';
import { Menu, Search, Cloud, Shield, LogOut } from 'lucide-react';

export function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 fixed top-0 right-0 left-0 lg:left-64 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md lg:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (Planned for future phase) */}
        <div className="relative hidden sm:flex items-center w-64 md:w-80">
          <Search className="w-4 h-4 text-outline/60 absolute left-3 pointer-events-none" />
          <input
            type="text"
            disabled
            placeholder="Global search (Planned for future phase)..."
            className="w-full h-9 pl-9 pr-12 rounded bg-surface-container-low border border-outline-variant/30 text-xs font-body text-outline/60 placeholder:text-outline/50 cursor-not-allowed select-none"
          />
          <div className="absolute right-2.5 flex items-center gap-0.5 pointer-events-none text-[10px] font-mono text-outline/60 bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/30">
            <span>PLANNED</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Connection Status Badge (Honest Standby Indicator) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container border border-outline-variant/30 text-outline text-xs font-mono">
          <Cloud className="w-3.5 h-3.5 text-outline" />
          <span className="hidden xs:inline uppercase tracking-wider text-[11px]">
            STANDBY
          </span>
        </div>

        {/* Role Security Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container border border-outline-variant/30 text-on-surface-variant text-xs font-mono">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] uppercase tracking-wide">
            RBAC: {user?.role || 'ADMIN'}
          </span>
        </div>

        {/* Quick Sign Out Action */}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-body text-outline hover:text-error hover:bg-error-container/20 border border-transparent hover:border-error/30 rounded transition-colors"
          title="Sign out of admin session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

