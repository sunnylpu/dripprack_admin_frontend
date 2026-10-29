import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard data">
      {/* Banner Skeleton */}
      <div className="h-12 bg-surface-container-lowest rounded-lg border border-outline-variant/20" />

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-40 bg-surface-container-low rounded-xl border border-outline-variant/30 p-5 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-28 bg-surface-container-high rounded" />
              <div className="h-4 w-12 bg-surface-container-high rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-36 bg-surface-container-high rounded" />
              <div className="h-3 w-24 bg-surface-container-high rounded" />
            </div>
            <div className="h-3 w-32 bg-surface-container-high rounded" />
          </div>
        ))}
      </div>

      {/* Distribution Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-surface-container-low rounded-xl border border-outline-variant/30 p-6 h-72 flex flex-col justify-between">
          <div className="h-5 w-48 bg-surface-container-high rounded" />
          <div className="h-6 w-full bg-surface-container-high rounded" />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j} className="h-16 bg-surface-container rounded-lg" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 bg-surface-container-low rounded-xl border border-outline-variant/30 p-6 h-72 flex flex-col justify-between">
          <div className="h-5 w-36 bg-surface-container-high rounded" />
          <div className="space-y-3">
            <div className="h-14 bg-surface-container rounded-lg" />
            <div className="h-14 bg-surface-container rounded-lg" />
          </div>
          <div className="h-6 bg-surface-container-lowest rounded" />
        </div>
      </div>

      {/* Recent Orders Table Skeleton */}
      <div className="bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
          <div className="h-6 w-44 bg-surface-container-high rounded" />
          <div className="h-8 w-48 bg-surface-container-high rounded" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((k) => (
            <div key={k} className="h-10 bg-surface-container-high/40 rounded flex items-center px-4 justify-between">
              <div className="h-4 w-28 bg-surface-container-high rounded" />
              <div className="h-4 w-36 bg-surface-container-high rounded" />
              <div className="h-4 w-16 bg-surface-container-high rounded" />
              <div className="h-4 w-20 bg-surface-container-high rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

