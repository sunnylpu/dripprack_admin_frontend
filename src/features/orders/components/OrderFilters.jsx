import React from 'react';
import {
  Search,
  Filter,
  CreditCard,
  DollarSign,
  Calendar,
  X,
  RotateCcw
} from 'lucide-react';
import { ORDER_STATUSES, PAYMENT_STATUSES, PAYMENT_METHODS } from '../orderValidation.js';

const STATUS_TABS = [
  { value: 'all', label: 'All Orders' },
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

export function OrderFilters({
  search,
  setSearch,
  orderStatus,
  setOrderStatus,
  paymentStatus,
  setPaymentStatus,
  paymentMethod,
  setPaymentMethod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onResetFilters,
  dateError
}) {
  const hasActiveFilters =
    search ||
    orderStatus !== 'all' ||
    paymentStatus !== 'all' ||
    paymentMethod !== 'all' ||
    startDate ||
    endDate;

  return (
    <div className="bg-surface-container-low p-4 rounded-xl shadow-sm flex flex-col gap-4 border border-outline-variant/30">
      {/* Top Search & Dropdown Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Input: Order reference & Recipient Name */}
        <div className="md:col-span-5 relative flex items-center">
          <Search className="w-4 h-4 text-outline absolute left-3 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order reference or recipient name..."
            className="w-full bg-surface-container-lowest text-on-surface font-mono text-xs placeholder:text-outline-variant pl-9 pr-8 py-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 text-outline hover:text-on-surface p-1"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Payment Status Dropdown */}
        <div className="md:col-span-2 flex items-center bg-surface-container-lowest rounded-lg px-3 py-2 border border-outline-variant/30 text-on-surface relative">
          <DollarSign className="w-4 h-4 text-outline mr-1.5 flex-shrink-0" />
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full bg-transparent font-mono text-xs text-on-surface focus:outline-none cursor-pointer appearance-none pr-5"
          >
            <option value="all" className="bg-surface-container-lowest">Payment: All</option>
            <option value="paid" className="bg-surface-container-lowest">Paid</option>
            <option value="cod_due" className="bg-surface-container-lowest">COD Due</option>
            <option value="pending" className="bg-surface-container-lowest">Pending</option>
            <option value="failed" className="bg-surface-container-lowest">Failed</option>
            <option value="refunded" className="bg-surface-container-lowest">Refunded</option>
          </select>
          <Filter className="w-3 h-3 text-outline absolute right-2.5 pointer-events-none" />
        </div>

        {/* Payment Method Dropdown */}
        <div className="md:col-span-2 flex items-center bg-surface-container-lowest rounded-lg px-3 py-2 border border-outline-variant/30 text-on-surface relative">
          <CreditCard className="w-4 h-4 text-outline mr-1.5 flex-shrink-0" />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full bg-transparent font-mono text-xs text-on-surface focus:outline-none cursor-pointer appearance-none pr-5"
          >
            <option value="all" className="bg-surface-container-lowest">Method: All</option>
            <option value="cod" className="bg-surface-container-lowest">Cash On Delivery (COD)</option>
            <option value="online" className="bg-surface-container-lowest">Online (Stripe)</option>
          </select>
          <Filter className="w-3 h-3 text-outline absolute right-2.5 pointer-events-none" />
        </div>

        {/* Date Range Picker */}
        <div className="md:col-span-3 flex items-center bg-surface-container-lowest rounded-lg px-2.5 py-1.5 border border-outline-variant/30 text-on-surface gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-outline flex-shrink-0" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent font-mono text-xs text-on-surface focus:outline-none w-full"
            title="Start date"
          />
          <span className="text-outline text-xs">&rarr;</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent font-mono text-xs text-on-surface focus:outline-none w-full"
            title="End date"
          />
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-outline hover:text-on-surface p-0.5"
              title="Clear date range"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {dateError && (
        <span className="font-mono text-xs text-error">{dateError}</span>
      )}

      {/* Status Filter Capsules Row */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-outline-variant/20 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap">
          {STATUS_TABS.map((tab) => {
            const isSelected = orderStatus === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setOrderStatus(tab.value)}
                className={`px-3 py-1 rounded-full font-mono text-xs transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-primary-container text-on-primary-container border-primary/50 font-bold shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border-outline-variant/30'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-outline hover:text-on-surface font-mono text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}

