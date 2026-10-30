import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { inventoryApi } from './inventoryApi.js';
import { categoryApi } from '../categories/categoryApi.js';
import { InventoryKpis } from './components/InventoryKpis.jsx';
import { StockOverviewTable } from './components/StockOverviewTable.jsx';
import { LowStockTable } from './components/LowStockTable.jsx';
import { MovementHistoryTable } from './components/MovementHistoryTable.jsx';
import { StockAdjustmentModal } from './components/StockAdjustmentModal.jsx';
import { validateMovementDateRange } from './inventoryValidation.js';
import {
  Boxes,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X
} from 'lucide-react';

export function InventoryView() {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'low-stock' | 'movements'

  // Categories list for dropdown filters
  const [categories, setCategories] = useState([]);

  // Telemetry KPIs state
  const [kpiLoading, setKpiLoading] = useState(true);
  const [lowStockTotalCount, setLowStockTotalCount] = useState(0);

  // Tab 1: Stock Overview State
  const [stockList, setStockList] = useState([]);
  const [stockMeta, setStockMeta] = useState(null);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockRefreshing, setStockRefreshing] = useState(false);
  const [stockPage, setStockPage] = useState(1);
  const [stockSearch, setStockSearch] = useState('');
  const [stockCategory, setStockCategory] = useState('all');
  const [stockLowOnly, setStockLowOnly] = useState(false);
  const [stockInStock, setStockInStock] = useState('all');
  const [stockSort, setStockSort] = useState('createdAt:desc');

  // Tab 2: Low Stock Alerts State
  const [lowStockList, setLowStockList] = useState([]);
  const [lowStockMeta, setLowStockMeta] = useState(null);
  const [lowStockLoading, setLowStockLoading] = useState(false);
  const [lowStockRefreshing, setLowStockRefreshing] = useState(false);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [lowStockSearch, setLowStockSearch] = useState('');
  const [lowStockCategory, setLowStockCategory] = useState('all');
  const [lowStockSort, setLowStockSort] = useState('available:asc');

  // Tab 3: Movements State
  const [movementsList, setMovementsList] = useState([]);
  const [movementsMeta, setMovementsMeta] = useState(null);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementsRefreshing, setMovementsRefreshing] = useState(false);
  const [movementsPage, setMovementsPage] = useState(1);
  const [movementType, setMovementType] = useState('all');
  const [movementStartDate, setMovementStartDate] = useState('');
  const [movementEndDate, setMovementEndDate] = useState('');
  const [movementSort, setMovementSort] = useState('createdAt:desc');
  const [dateError, setDateError] = useState('');

  // Modals & Feedback State
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedProductForAdjustment, setSelectedProductForAdjustment] = useState(null);
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);
  const [toast, setToast] = useState(null);
  const [generalError, setGeneralError] = useState(null);

  const isMountedRef = useRef(true);

  // Load active categories and initial low-stock count
  useEffect(() => {
    isMountedRef.current = true;

    categoryApi
      .getActiveCategories()
      .then((cats) => {
        if (isMountedRef.current) setCategories(cats || []);
      })
      .catch(() => {});

    // Fetch initial low-stock count for KPI badge
    inventoryApi
      .getLowStock({ page: 1, limit: 1 })
      .then((res) => {
        if (isMountedRef.current && res?.meta?.total !== undefined) {
          setLowStockTotalCount(res.meta.total);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMountedRef.current) setKpiLoading(false);
      });

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Show toast helper
  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  /**
   * Load Stock Listing (Tab 1)
   */
  const loadStock = useCallback(
    async (targetPage = 1, isManual = false) => {
      if (isManual) {
        setStockRefreshing(true);
      } else {
        setStockLoading(true);
      }
      setGeneralError(null);

      try {
        const res = await inventoryApi.getStockList({
          page: targetPage,
          limit: 20,
          q: stockSearch,
          category: stockCategory,
          lowStockOnly: stockLowOnly,
          inStock: stockInStock,
          sortBy: stockSort
        });

        if (isMountedRef.current) {
          setStockList(res?.stock || []);
          setStockMeta(res?.meta || null);
          setStockPage(targetPage);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setGeneralError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setStockLoading(false);
          setStockRefreshing(false);
        }
      }
    },
    [stockSearch, stockCategory, stockLowOnly, stockInStock, stockSort]
  );

  /**
   * Load Low-Stock Report (Tab 2)
   */
  const loadLowStock = useCallback(
    async (targetPage = 1, isManual = false) => {
      if (isManual) {
        setLowStockRefreshing(true);
      } else {
        setLowStockLoading(true);
      }
      setGeneralError(null);

      try {
        const res = await inventoryApi.getLowStock({
          page: targetPage,
          limit: 20,
          q: lowStockSearch,
          category: lowStockCategory,
          sortBy: lowStockSort
        });

        if (isMountedRef.current) {
          setLowStockList(res?.products || []);
          setLowStockMeta(res?.meta || null);
          setLowStockPage(targetPage);
          if (res?.meta?.total !== undefined) {
            setLowStockTotalCount(res.meta.total);
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setGeneralError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setLowStockLoading(false);
          setLowStockRefreshing(false);
        }
      }
    },
    [lowStockSearch, lowStockCategory, lowStockSort]
  );

  /**
   * Load Movements Audit History (Tab 3)
   */
  const loadMovements = useCallback(
    async (targetPage = 1, isManual = false) => {
      // Validate date range if both provided
      if (movementStartDate && movementEndDate) {
        const check = validateMovementDateRange({
          startDate: movementStartDate,
          endDate: movementEndDate
        });
        if (!check.isValid) {
          setDateError(check.error || 'Invalid date range');
          return;
        }
      }
      setDateError('');

      if (isManual) {
        setMovementsRefreshing(true);
      } else {
        setMovementsLoading(true);
      }
      setGeneralError(null);

      try {
        // Ensure ISO format for dates if present
        const startIso = movementStartDate ? new Date(movementStartDate).toISOString() : undefined;
        const endIso = movementEndDate ? new Date(`${movementEndDate}T23:59:59.999Z`).toISOString() : undefined;

        const res = await inventoryApi.getMovements({
          page: targetPage,
          limit: 20,
          movementType,
          startDate: startIso,
          endDate: endIso,
          sortBy: movementSort
        });

        if (isMountedRef.current) {
          setMovementsList(res?.movements || []);
          setMovementsMeta(res?.meta || null);
          setMovementsPage(targetPage);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setGeneralError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setMovementsLoading(false);
          setMovementsRefreshing(false);
        }
      }
    },
    [movementType, movementStartDate, movementEndDate, movementSort]
  );

  // Trigger search debouncing for Tab 1
  useEffect(() => {
    const timer = setTimeout(() => {
      loadStock(1, false);
    }, 250);
    return () => clearTimeout(timer);
  }, [loadStock]);

  // Trigger search debouncing for Tab 2
  useEffect(() => {
    if (activeTab === 'low-stock') {
      const timer = setTimeout(() => {
        loadLowStock(1, false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [activeTab, loadLowStock]);

  // Trigger movements fetch when Tab 3 active or filters change
  useEffect(() => {
    if (activeTab === 'movements') {
      loadMovements(1, false);
    }
  }, [activeTab, loadMovements]);

  // Compute live telemetry aggregates from current stock list
  const kpiTotals = useMemo(() => {
    let physical = 0;
    let reserved = 0;
    let available = 0;

    stockList.forEach((item) => {
      physical += item.stock?.physical || 0;
      reserved += item.stock?.reserved || 0;
      available += item.stock?.available || 0;
    });

    return { physical, reserved, available };
  }, [stockList]);

  // Open adjustment modal for a specific product
  const handleOpenAdjustment = (product = null) => {
    setSelectedProductForAdjustment(product);
    setIsAdjustmentModalOpen(true);
  };

  // Close adjustment modal
  const handleCloseAdjustment = () => {
    setIsAdjustmentModalOpen(false);
    setSelectedProductForAdjustment(null);
  };

  // Commit stock adjustment
  const handleCommitAdjustment = async (payload, idempotencyKey) => {
    setIsSubmittingAdjustment(true);
    try {
      const res = await inventoryApi.adjustStock(payload, idempotencyKey);
      const updatedProduct = res?.product;
      const sku = updatedProduct?.sku || selectedProductForAdjustment?.sku || 'Product';
      const deltaSign = payload.quantityDelta > 0 ? `+${payload.quantityDelta}` : payload.quantityDelta;

      showToast(`Committed ${deltaSign} units to ${sku}. Ledger synchronized.`);
      handleCloseAdjustment();

      // Refresh data across active tabs and KPI totals
      loadStock(stockPage, true);
      loadLowStock(lowStockPage, true);
      if (activeTab === 'movements') {
        loadMovements(1, true);
      }
    } catch (err) {
      throw err; // let modal display specific server error message
    } finally {
      if (isMountedRef.current) {
        setIsSubmittingAdjustment(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-outline">
            <span>SUPPLY CHAIN</span>
            <span>/</span>
            <span className="text-secondary font-semibold">ALLOCATION MATRIX</span>
          </div>
          <h1 className="font-headline font-bold text-2xl text-on-surface uppercase tracking-tight">
            Inventory &amp; Movements
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Manually refreshed server ledger of warehouse shelf units, cart reservations, and operational adjustments.
          </p>
        </div>

        {/* Header Action: Quick Adjustment Modal */}
        <button
          type="button"
          onClick={() => handleOpenAdjustment(null)}
          className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-headline text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm self-start md:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Adjust Stock Level</span>
        </button>
      </div>

      {/* KPI Telemetry Ribbon */}
      <InventoryKpis
        physicalUnits={kpiTotals.physical}
        reservedUnits={kpiTotals.reserved}
        availableUnits={kpiTotals.available}
        lowStockCount={lowStockTotalCount}
        isLoading={kpiLoading && stockLoading}
      />

      {/* General Error Banner */}
      {generalError && (
        <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 flex items-center justify-between text-xs font-mono text-error">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generalError.message || 'An error occurred while loading inventory data.'}</span>
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

      {/* Tab Navigation Switcher */}
      <div className="inline-flex p-1 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
        {/* Tab 1: Warehouse Stock */}
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline text-xs font-semibold transition-all ${
            activeTab === 'stock'
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Active Warehouse Stock</span>
          {stockMeta?.total !== undefined && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-on-primary-container/20">
              {stockMeta.total}
            </span>
          )}
        </button>

        {/* Tab 2: Critical Low Stock */}
        <button
          type="button"
          onClick={() => setActiveTab('low-stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline text-xs font-semibold transition-all ${
            activeTab === 'low-stock'
              ? 'bg-error-container text-on-error-container shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-error" />
          <span>Critical Low Stock</span>
          {lowStockTotalCount > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-error text-on-error font-bold animate-pulse">
              {lowStockTotalCount}
            </span>
          )}
        </button>

        {/* Tab 3: Movement Audit Trail */}
        <button
          type="button"
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline text-xs font-semibold transition-all ${
            activeTab === 'movements'
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Movements &amp; Audit Trail</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-secondary font-bold">
            APPEND-ONLY
          </span>
        </button>
      </div>

      {/* Main Tab View Content */}
      {activeTab === 'stock' && (
        <StockOverviewTable
          stock={stockList}
          meta={stockMeta}
          isLoading={stockLoading}
          isRefreshing={stockRefreshing}
          onPageChange={(p) => loadStock(p, false)}
          onAdjustStock={(p) => handleOpenAdjustment(p)}
          onRefresh={() => loadStock(stockPage, true)}
          searchQuery={stockSearch}
          setSearchQuery={setStockSearch}
          selectedCategory={stockCategory}
          setSelectedCategory={setStockCategory}
          categories={categories}
          lowStockOnly={stockLowOnly}
          setLowStockOnly={setStockLowOnly}
          inStock={stockInStock}
          setInStock={setStockInStock}
          selectedSort={stockSort}
          setSelectedSort={setStockSort}
        />
      )}

      {activeTab === 'low-stock' && (
        <LowStockTable
          products={lowStockList}
          meta={lowStockMeta}
          isLoading={lowStockLoading}
          isRefreshing={lowStockRefreshing}
          onPageChange={(p) => loadLowStock(p, false)}
          onAdjustStock={(p) => handleOpenAdjustment(p)}
          onRefresh={() => loadLowStock(lowStockPage, true)}
          searchQuery={lowStockSearch}
          setSearchQuery={setLowStockSearch}
          selectedCategory={lowStockCategory}
          setSelectedCategory={setLowStockCategory}
          categories={categories}
          selectedSort={lowStockSort}
          setSelectedSort={setLowStockSort}
        />
      )}

      {activeTab === 'movements' && (
        <MovementHistoryTable
          movements={movementsList}
          meta={movementsMeta}
          isLoading={movementsLoading}
          isRefreshing={movementsRefreshing}
          onPageChange={(p) => loadMovements(p, false)}
          onRefresh={() => loadMovements(movementsPage, true)}
          selectedType={movementType}
          setSelectedType={setMovementType}
          startDate={movementStartDate}
          setStartDate={setMovementStartDate}
          endDate={movementEndDate}
          setEndDate={setMovementEndDate}
          selectedSort={movementSort}
          setSelectedSort={setMovementSort}
          dateError={dateError}
        />
      )}

      {/* Interactive Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={handleCloseAdjustment}
        product={selectedProductForAdjustment}
        availableProducts={stockList}
        onSubmit={handleCommitAdjustment}
        isSubmitting={isSubmittingAdjustment}
      />

      {/* Floating Feedback Notification Toast */}
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

