import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body antialiased selection:bg-primary/20 selection:text-primary">
      {/* Tactical Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top Application Context Bar */}
      <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 pt-16 flex-1 flex flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

