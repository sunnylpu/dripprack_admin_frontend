import React, { useState, useEffect, useCallback, useRef } from 'react';
import { orderApi } from './orderApi.js';
import { OrderFilters } from './components/OrderFilters.jsx';
import { OrdersTable } from './components/OrdersTable.jsx';
import { OrderDetailsDrawer } from './components/OrderDetailsDrawer.jsx';
import { OrderStatusModal } from './components/OrderStatusModal.jsx';
import { OrderCancelModal } from './components/OrderCancelModal.jsx';
import { validateOrderDateRange } from './orderValidation.js';
import {
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X
} from 'lucide-react';

export function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');

  // Drawer (Order Details) State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerData, setDrawerData] = useState(null);

  // Modals State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [statusModalTarget, setStatusModalTarget] = useState(null);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  /**
   * Fetch paginated orders from server
   */
  const loadOrders = useCallback(
    async (targetPage = 1, isManual = false) => {
      // Validate date range
      if (startDate && endDate) {
        const check = validateOrderDateRange({ startDate, endDate });
        if (!check.isValid) {
          setDateError(check.error || 'Invalid date range');
          return;
        }
      }
      setDateError('');

      if (isManual) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setGeneralError(null);

      try {
        const startIso = startDate ? new Date(startDate).toISOString() : undefined;
        const endIso = endDate ? new Date(`${endDate}T23:59:59.999Z`).toISOString() : undefined;

        const res = await orderApi.getAdminOrders({
          page: targetPage,
          limit: 10,
          orderStatus: orderStatus !== 'all' ? orderStatus : undefined,
          paymentStatus: paymentStatus !== 'all' ? paymentStatus : undefined,
          paymentMethod: paymentMethod !== 'all' ? paymentMethod : undefined,
          startDate: startIso,
          endDate: endIso,
          search: search.trim() || undefined
        });

        if (isMountedRef.current) {
          setOrders(res?.orders || []);
          setMeta(res?.meta || null);
          setPage(targetPage);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setGeneralError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [search, orderStatus, paymentStatus, paymentMethod, startDate, endDate]
  );

  // Debounced search / filter reload
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders(1, false);
    }, 250);
    return () => clearTimeout(timer);
  }, [loadOrders]);

  /**
   * Reset all filters to default
   */
  const handleResetFilters = () => {
    setSearch('');
    setOrderStatus('all');
    setPaymentStatus('all');
    setPaymentMethod('all');
    setStartDate('');
    setEndDate('');
    setDateError('');
  };

  /**
   * Open details drawer for an order and fetch complete details
   */
  const handleInspectOrder = async (order) => {
    setIsDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerData({ order, payment: null, auditLogs: [] });

    try {
      const details = await orderApi.getOrderByReference(order.orderReference);
      if (isMountedRef.current) {
        setDrawerData(details);
      }
    } catch (err) {
      if (isMountedRef.current) {
        showToast(err.message || 'Failed to fetch complete order details', true);
      }
    } finally {
      if (isMountedRef.current) {
        setDrawerLoading(false);
      }
    }
  };

  /**
   * Open status advance modal
   */
  const handleOpenStatusModal = (order, targetStatus) => {
    setStatusModalOrder(order);
    setStatusModalTarget(targetStatus);
    setIsStatusModalOpen(true);
  };

  /**
   * Execute status transition
   */
  const handleConfirmStatus = async (reference, payload) => {
    setIsSubmittingStatus(true);
    try {
      const res = await orderApi.updateOrderStatus(reference, payload);
      showToast(
        res?.isNoop
          ? `Order is already in ${payload.status} status.`
          : `Order ${reference} successfully transitioned to ${payload.status}.`
      );

      setIsStatusModalOpen(false);
      setStatusModalOrder(null);
      setStatusModalTarget(null);

      // Refresh listing
      loadOrders(page, true);

      // Refresh drawer if open on this order
      if (drawerData?.order?.orderReference === reference) {
        const refreshed = await orderApi.getOrderByReference(reference);
        if (isMountedRef.current) {
          setDrawerData(refreshed);
        }
      }
    } catch (err) {
      throw err; // let modal show error
    } finally {
      if (isMountedRef.current) {
        setIsSubmittingStatus(false);
      }
    }
  };

  /**
   * Open cancel confirmation modal
   */
  const handleOpenCancelModal = (order) => {
    setCancelModalOrder(order);
    setIsCancelModalOpen(true);
  };

  /**
   * Execute order cancellation
   */
  const handleConfirmCancel = async (reference, { reason } = {}) => {
    setIsSubmittingCancel(true);
    try {
      await orderApi.cancelOrder(reference, { reason });
      showToast(`Order ${reference} cancelled and reserved stock restored.`);

      setIsCancelModalOpen(false);
      setCancelModalOrder(null);

      // Refresh listing
      loadOrders(page, true);

      // Refresh drawer if open
      if (drawerData?.order?.orderReference === reference) {
        const refreshed = await orderApi.getOrderByReference(reference);
        if (isMountedRef.current) {
          setDrawerData(refreshed);
        }
      }
    } catch (err) {
      throw err; // let modal show error
    } finally {
      if (isMountedRef.current) {
        setIsSubmittingCancel(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Breadcrumbs & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-on-primary font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
              PIPELINE NODE // ORD-EXEC
            </span>
            <span className="font-mono text-xs text-outline">
              ORDER FULFILLMENT &amp; LOGISTICS
            </span>
          </div>
          <h1 className="font-headline font-bold text-2xl text-on-surface uppercase tracking-tight">
            Orders &amp; Fulfillment
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            State-enforced order progression, shipping tracking verification, and administrative audit history.
          </p>
        </div>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 flex items-center justify-between text-xs font-mono text-error">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generalError.message || 'An error occurred while loading orders.'}</span>
          </div>
          <button
            type="button"
            onClick={() => setGeneralError(null)}
            className="text-error hover:opacity-80 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters Deck */}
      <OrderFilters
        search={search}
        setSearch={setSearch}
        orderStatus={orderStatus}
        setOrderStatus={setOrderStatus}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onResetFilters={handleResetFilters}
        dateError={dateError}
      />

      {/* Orders Data Workbench Table */}
      <OrdersTable
        orders={orders}
        meta={meta}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onPageChange={(p) => loadOrders(p, false)}
        onInspectOrder={handleInspectOrder}
        onAdvanceStatus={handleOpenStatusModal}
        onCancelOrder={handleOpenCancelModal}
        onRefresh={() => loadOrders(page, true)}
      />

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        orderDetail={drawerData}
        isLoading={drawerLoading}
        onAdvanceStatus={handleOpenStatusModal}
        onCancelOrder={handleOpenCancelModal}
      />

      {/* Order Status Advance Modal */}
      <OrderStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        order={statusModalOrder}
        targetStatus={statusModalTarget}
        onConfirm={handleConfirmStatus}
        isSubmitting={isSubmittingStatus}
      />

      {/* Order Cancellation Modal */}
      <OrderCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        order={cancelModalOrder}
        onConfirm={handleConfirmCancel}
        isSubmitting={isSubmittingCancel}
      />

      {/* Floating Notification Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 transition-all duration-300 font-mono text-xs border ${
            toast.isError
              ? 'bg-error-container text-on-error-container border-error/40'
              : 'bg-surface-container-highest text-on-surface border-outline-variant/30'
          }`}
        >
          {toast.isError ? (
            <XCircle className="w-5 h-5 text-error flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

