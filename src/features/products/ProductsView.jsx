import React, { useState, useEffect, useCallback, useRef } from 'react';
import { productApi } from './productApi.js';
import { categoryApi } from '../categories/categoryApi.js';
import { DEFAULT_CURRENCY_CODE } from '../../lib/formatters.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { ProductsTable } from './components/ProductsTable.jsx';
import { ProductFormDrawer } from './components/ProductFormDrawer.jsx';
import { ProductStatusModal } from './components/ProductStatusModal.jsx';
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export function ProductsView() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStock, setSelectedStock] = useState('all'); // 'all', 'true', 'false'
  const [selectedSort, setSelectedSort] = useState('createdAt:desc');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft', 'archived'

  const [activeCategories, setActiveCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productForStatus, setProductForStatus] = useState(null);

  const isMountedRef = useRef(true);

  // Load active categories for filter dropdown
  useEffect(() => {
    categoryApi
      .getActiveCategories()
      .then((cats) => {
        if (isMountedRef.current) setActiveCategories(cats || []);
      })
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(
    async (targetPage = 1, isManual = false) => {
      if (isManual) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await productApi.getAdminProducts({
          page: targetPage,
          limit: 20,
          q: searchQuery,
          category: selectedCategory,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          inStock: selectedStock === 'all' ? undefined : selectedStock,
          sortBy: selectedSort
        });

        if (isMountedRef.current) {
          setProducts(data?.products || []);
          setMeta(data?.meta || null);
          setPage(targetPage);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [searchQuery, selectedCategory, statusFilter, selectedStock, selectedSort]
  );

  // Re-fetch when filters change (debounced for search)
  useEffect(() => {
    const handler = setTimeout(() => {
      loadProducts(1, false);
    }, 250);

    return () => clearTimeout(handler);
  }, [loadProducts]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      if (isMountedRef.current) setNotification(null);
    }, 4000);
  };

  const handleSaveProduct = async (payload, id) => {
    if (id) {
      await productApi.updateProduct(id, payload);
      showNotification(`Product "${payload.name || 'updated'}" saved successfully.`);
    } else {
      await productApi.createProduct(payload);
      showNotification(`Product "${payload.name}" created successfully.`);
    }
    loadProducts(page, true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    await productApi.updateProductStatus(id, newStatus);
    showNotification(`Product status updated to ${newStatus.toUpperCase()}.`);
    loadProducts(page, true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Products Catalog Management"
        subtitle="Search, filter, create, and manage SKU specifications and lifecycle states"
        badge="CATALOG NODE"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => loadProducts(page, true)}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-mono text-on-surface transition-colors disabled:opacity-60"
              title="Refresh product list"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Re-Index'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProductToEdit(null);
                setIsDrawerOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-headline text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Product</span>
            </button>
          </div>
        }
      />

      {/* Notification Toast Alert */}
      {notification && (
        <div
          className={`p-3 rounded-lg border flex items-center justify-between text-xs font-mono animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'error'
              ? 'bg-error-container/20 border-error/40 text-error'
              : 'bg-secondary/10 border-secondary/30 text-secondary'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-outline hover:text-on-surface font-bold text-xs"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Invariant Constraint Notice */}
      <div className="p-4 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-start gap-3 relative overflow-hidden">
        <div className="w-1 absolute left-0 top-0 bottom-0 bg-primary" />
        <div className="p-1 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider">
              INVENTORY ARCHITECTURE NOTE
            </span>
            <span className="font-mono text-[10px] text-outline bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/30">
              IMMUTABLE STOCK ALLOCATION
            </span>
          </div>
          <p className="font-body text-xs text-outline leading-relaxed">
            New products are strictly initialized with 0 available stock. Initial physical warehouse stock intake is recorded through the <strong className="text-on-surface">Inventory Stock Adjustments</strong> workflow in Phase 4 with mandatory audit trail notes.
          </p>
        </div>
      </div>

      {/* Filter and Command Toolbar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product title, SKU code, or description (e.g. 'Acid', 'DRIP-HOD')..."
              className="w-full pl-9 pr-8 py-2 bg-surface-container-low text-on-surface placeholder:text-outline/60 text-xs font-body rounded border border-outline-variant/30 focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 bg-surface-container-low text-on-surface text-xs font-mono rounded border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">Category: All</option>
              {activeCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Stock Level Filter */}
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="h-9 px-3 bg-surface-container-low text-on-surface text-xs font-mono rounded border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">Stock: All Levels</option>
              <option value="true">In Stock (&gt; 0)</option>
              <option value="false">Out of Stock (= 0)</option>
            </select>

            {/* Sort Filter */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="h-9 px-3 bg-surface-container-low text-on-surface text-xs font-mono rounded border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="createdAt:desc">Created: Newest First</option>
              <option value="createdAt:asc">Created: Oldest First</option>
              <option value="priceCents:asc">Price: Low to High</option>
              <option value="priceCents:desc">Price: High to Low</option>
              <option value="name:asc">Name: A to Z</option>
              <option value="name:desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Status Segmented Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant/20">
          <div className="inline-flex p-0.5 bg-surface-container-low rounded border border-outline-variant/30">
            {[
              { id: 'all', label: 'All Catalog' },
              { id: 'published', label: 'Published' },
              { id: 'draft', label: 'Draft' },
              { id: 'archived', label: 'Archived' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-outline">
            TOTAL MATCHES: <span className="text-on-surface font-bold">{meta ? meta.total : products.length}</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xl overflow-hidden flex flex-col">
        {error ? (
          <div className="p-6">
            <ErrorState
              title="Products Ingestion Error"
              message={error.message || 'Unable to retrieve products from server.'}
              code={error.code}
              onRetry={() => loadProducts(page, false)}
            />
          </div>
        ) : (
          <>
            <ProductsTable
              products={products}
              currency={DEFAULT_CURRENCY_CODE}
              isLoading={isLoading}
              onEdit={(prod) => {
                setProductToEdit(prod);
                setIsDrawerOpen(true);
              }}
              onChangeStatus={(prod) => setProductForStatus(prod)}
            />

            <Pagination
              meta={meta}
              onPageChange={(newPage) => loadProducts(newPage, false)}
            />
          </>
        )}
      </div>

      {/* Product Create / Edit Drawer */}
      <ProductFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
      />

      {/* Product Quick Status Transition Modal */}
      <ProductStatusModal
        isOpen={Boolean(productForStatus)}
        onClose={() => setProductForStatus(null)}
        product={productForStatus}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

