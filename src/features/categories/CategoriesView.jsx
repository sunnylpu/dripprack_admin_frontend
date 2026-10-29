import React, { useState, useEffect, useCallback, useRef } from 'react';
import { categoryApi } from './categoryApi.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { CategoriesTable } from './components/CategoriesTable.jsx';
import { CategoryFormModal } from './components/CategoryFormModal.jsx';
import { CategoryDeactivateModal } from './components/CategoryDeactivateModal.jsx';
import {
  FolderTree,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDeactivate, setCategoryToDeactivate] = useState(null);

  const isMountedRef = useRef(true);

  const loadCategories = useCallback(async (targetPage = 1, isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await categoryApi.getAdminCategories({
        page: targetPage,
        limit: 20,
        includeInactive: true // Request all categories so client status tabs function smoothly
      });

      if (isMountedRef.current) {
        setCategories(data?.categories || []);
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
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadCategories(1, false);

    return () => {
      isMountedRef.current = false;
    };
  }, [loadCategories]);

  // Client filtering on top of server data (search and active/inactive status tabs)
  const filteredCategories = categories.filter((cat) => {
    if (statusFilter === 'active' && !cat.isActive) return false;
    if (statusFilter === 'inactive' && cat.isActive) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (cat.name || '').toLowerCase().includes(q);
    const slugMatch = (cat.slug || '').toLowerCase().includes(q);
    const idMatch = (cat._id || '').toLowerCase().includes(q);
    return nameMatch || slugMatch || idMatch;
  });

  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = categories.filter((c) => !c.isActive).length;

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      if (isMountedRef.current) setNotification(null);
    }, 4000);
  };

  const handleSaveCategory = async (payload, id) => {
    if (id) {
      await categoryApi.updateCategory(id, payload);
      showNotification(`Category "${payload.name || 'updated'}" saved successfully.`);
    } else {
      await categoryApi.createCategory(payload);
      showNotification(`Category "${payload.name}" created successfully.`);
    }
    loadCategories(page, true);
  };

  const handleConfirmDeactivate = async (id) => {
    await categoryApi.deactivateCategory(id);
    showNotification('Category deactivated successfully (marked inactive).');
    loadCategories(page, true);
  };

  const handleReactivate = async (category) => {
    try {
      await categoryApi.updateCategory(category._id, { isActive: true });
      showNotification(`Category "${category.name}" reactivated successfully.`);
      loadCategories(page, true);
    } catch (err) {
      showNotification(err.message || 'Failed to reactivate category', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Category Taxonomy"
        subtitle="Catalog classification, active status constraints, and URL slug taxonomy"
        badge="TAXONOMY NODE"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => loadCategories(page, true)}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-mono text-on-surface transition-colors disabled:opacity-60"
              title="Refresh category list"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Re-Index'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCategoryToEdit(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-headline text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>
        }
      />

      {/* Notification Toast / Alert */}
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

      {/* System Invariant Alert Banner */}
      <div className="p-4 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-start gap-3 relative overflow-hidden">
        <div className="w-1 absolute left-0 top-0 bottom-0 bg-tertiary" />
        <div className="p-1 rounded bg-tertiary/10 text-tertiary shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-tertiary font-bold uppercase tracking-wider">
              CATEGORY STATUS INVARIANT
            </span>
            <span className="font-mono text-[10px] text-outline bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/30">
              HTTP 409 CONFLICT GUARD
            </span>
          </div>
          <p className="font-body text-xs text-outline leading-relaxed">
            Products assigned to an inactive category cannot be transitioned to <code className="text-secondary">published</code> (HTTP 409 Conflict). Soft-deactivating a category hides it from active product creation forms and public customer navigation without destroying relational integrity.
          </p>
        </div>
      </div>

      {/* Metric Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-outline block">Total Categories</span>
            <span className="font-headline text-2xl font-bold text-on-surface mt-1 block">
              {meta ? meta.total : categories.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary border border-outline-variant/30">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-secondary block">Active Categories</span>
            <span className="font-headline text-2xl font-bold text-secondary mt-1 block">
              {activeCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-tertiary block">Inactive Categories</span>
            <span className="font-headline text-2xl font-bold text-tertiary mt-1 block">
              {inactiveCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table & Filtering Container */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xl overflow-hidden flex flex-col">
        {/* Controls Toolbar */}
        <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/30 text-outline flex-1 max-w-md">
            <Search className="w-4 h-4 text-outline shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, slug, or ID..."
              className="bg-transparent border-none outline-none font-mono text-xs text-on-surface placeholder:text-outline/60 w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-mono text-outline hover:text-on-surface"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-surface-container-low rounded-lg border border-outline-variant/30 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              All ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-secondary text-on-secondary'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-tertiary text-on-tertiary'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>
        </div>

        {/* Table / Error Display */}
        {error ? (
          <div className="p-6">
            <ErrorState
              title="Category Taxonomy Ingestion Failure"
              message={error.message || 'Unable to retrieve category records from server.'}
              code={error.code}
              onRetry={() => loadCategories(page, false)}
            />
          </div>
        ) : (
          <>
            <CategoriesTable
              categories={filteredCategories}
              isLoading={isLoading}
              onEdit={(cat) => {
                setCategoryToEdit(cat);
                setIsFormOpen(true);
              }}
              onDeactivate={(cat) => setCategoryToDeactivate(cat)}
              onReactivate={handleReactivate}
            />

            <Pagination
              meta={meta}
              onPageChange={(newPage) => loadCategories(newPage, false)}
            />
          </>
        )}
      </div>

      {/* Category Create / Edit Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
        onSave={handleSaveCategory}
      />

      {/* Category Deactivation Confirmation Modal */}
      <CategoryDeactivateModal
        isOpen={Boolean(categoryToDeactivate)}
        onClose={() => setCategoryToDeactivate(null)}
        category={categoryToDeactivate}
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  );
}

