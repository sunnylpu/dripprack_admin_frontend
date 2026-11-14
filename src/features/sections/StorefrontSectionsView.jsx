import React, { useState, useEffect } from 'react';
import {
  Film,
  Play,
  Eye,
  Sliders,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MonitorPlay,
  ShoppingBag,
  Grid
} from 'lucide-react';
import { sectionApi } from './sectionApi.js';
import { SectionEditDrawer } from './SectionEditDrawer.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { LoadingState } from '../../components/ui/LoadingState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';

export function StorefrontSectionsView() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [editingSection, setEditingSection] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  const fetchSections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sectionApi.getSections({ page: activeTab });
      setSections(data);
    } catch (err) {
      setError(err?.message || 'Failed to load storefront sections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [activeTab]);

  const handleToggleStatus = async (section) => {
    try {
      const updated = await sectionApi.toggleSectionStatus(section._id, !section.isActive);
      setSections((prev) =>
        prev.map((s) => (s._id === section._id ? { ...s, isActive: updated.isActive } : s))
      );
      showFeedback(`"${section.sectionName}" visibility updated`);
    } catch (err) {
      showFeedback(err?.message || 'Failed to toggle status');
    }
  };

  const showFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(''), 3500);
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setIsDrawerOpen(true);
  };

  const handleSaved = (updated) => {
    setSections((prev) =>
      prev.map((s) => (s._id === updated._id ? updated : s)).sort((a, b) => a.sortOrder - b.sortOrder)
    );
    showFeedback(`"${updated.sectionName}" saved successfully`);
  };

  // Metrics
  const totalCount = sections.length;
  const activeCount = sections.filter((s) => s.isActive).length;
  const videoCount = sections.filter((s) => s.media?.videoUrl).length;
  const curationCount = sections.filter((s) => s.curation?.products?.length > 0).length;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded bg-primary/10 text-primary">
              <MonitorPlay className="w-5 h-5" />
            </span>
            <span className="font-mono text-xs text-primary font-bold tracking-widest uppercase">
              STOREFRONT CMS & VIDEO MANAGER
            </span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
            Storefront Sections & Video Feeds
          </h1>
          <p className="font-body text-xs text-outline mt-1 max-w-2xl">
            Curate vertical page flow, ambient looping video streams, lookbook split-grids, and interactive editorial banners with live client placement notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://localhost:5174/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high text-xs font-headline font-semibold text-on-surface transition-colors"
          >
            <span>Live Client Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-outline" />
          </a>

          <Button variant="outline" onClick={fetchSections} className="p-2">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Action feedback toast */}
      {actionFeedback && (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded text-primary text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{actionFeedback}</span>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
          <span className="font-mono text-[11px] text-outline uppercase tracking-wider block">Total Sections</span>
          <span className="font-headline text-2xl font-bold text-on-surface mt-1 block">{totalCount}</span>
          <span className="font-mono text-[11px] text-outline mt-0.5 block">Configured for {activeTab}</span>
        </div>

        <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
          <span className="font-mono text-[11px] text-outline uppercase tracking-wider block">Active & Visible</span>
          <span className="font-headline text-2xl font-bold text-emerald-400 mt-1 block">{activeCount}</span>
          <span className="font-mono text-[11px] text-outline mt-0.5 block">Rendering live on client</span>
        </div>

        <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
          <span className="font-mono text-[11px] text-outline uppercase tracking-wider block">Video Feeds</span>
          <span className="font-headline text-2xl font-bold text-primary mt-1 block">{videoCount}</span>
          <span className="font-mono text-[11px] text-outline mt-0.5 block">Ambient HD loops</span>
        </div>

        <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
          <span className="font-mono text-[11px] text-outline uppercase tracking-wider block">Outfit Curations</span>
          <span className="font-headline text-2xl font-bold text-on-surface mt-1 block">{curationCount}</span>
          <span className="font-mono text-[11px] text-outline mt-0.5 block">Shop The Look modules</span>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="flex border-b border-outline-variant/30 gap-1">
        {['home', 'shop', 'about', 'support'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-headline uppercase tracking-wider font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            {tab} Page
          </button>
        ))}
      </div>

      {/* Sections List */}
      {isLoading ? (
        <LoadingState message="Loading storefront layout configuration..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSections} />
      ) : sections.length === 0 ? (
        <div className="p-12 text-center rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-low/40">
          <Layers className="w-10 h-10 text-outline mx-auto mb-3 opacity-50" />
          <h3 className="font-headline text-sm font-semibold text-on-surface">No Sections Found</h3>
          <p className="font-body text-xs text-outline mt-1">
            No sections currently configured for the "{activeTab}" page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-outline font-mono uppercase tracking-wider px-2">
            <span>Storefront Flow Timeline (Top to Bottom)</span>
            <span>{sections.length} Ordered Blocks</span>
          </div>

          <div className="space-y-3">
            {sections.map((section, idx) => {
              const hasVideo = Boolean(section.media?.videoUrl);
              const hasImage = Boolean(section.media?.imageUrl);

              return (
                <div
                  key={section._id}
                  className={`p-5 rounded-lg border transition-all ${
                    section.isActive
                      ? 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant/60 shadow-sm'
                      : 'bg-surface-container-lowest/50 border-outline-variant/20 opacity-60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Sequence index & Section Overview */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Numeric Order Badge */}
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-surface-container border border-outline-variant/30 shrink-0">
                        <span className="font-mono text-xs text-outline font-bold">POS</span>
                        <span className="font-headline text-sm font-bold text-on-surface">
                          {String(section.sortOrder ?? idx + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-headline text-sm font-bold text-on-surface truncate">
                            {section.sectionName}
                          </h3>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-outline uppercase font-semibold">
                            {section.sectionType}
                          </span>
                          <span className="font-mono text-[10px] text-outline">
                            • key: <code className="text-on-surface">{section.sectionKey}</code>
                          </span>
                        </div>

                        {/* High Visibility Placement Notice */}
                        <div className="mt-1 p-2 rounded bg-surface-container-low border border-outline-variant/30 flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                            WHERE IT APPEARS
                          </span>
                          <span className="font-body text-xs text-on-surface-variant truncate">
                            {section.placementNotice}
                          </span>
                        </div>

                        {/* Editorial Summary Snippet */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-outline font-body">
                          {section.content?.heading && (
                            <span>
                              Headline: <strong className="text-on-surface font-headline font-semibold">"{section.content.heading}"</strong>
                            </span>
                          )}
                          {section.cta?.text && (
                            <span>
                              CTA: <code className="text-primary font-mono">{section.cta.text} &rarr; {section.cta.link}</code>
                            </span>
                          )}
                          {section.curation?.products?.length > 0 && (
                            <span>
                              Curated: <strong className="text-on-surface">{section.curation.products.length} Products</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Media Thumbnail */}
                    <div className="shrink-0 flex items-center gap-3">
                      {hasVideo ? (
                        <div className="relative w-28 h-16 rounded overflow-hidden border border-outline-variant/40 bg-black group">
                          <video
                            src={section.media.videoUrl}
                            muted
                            loop
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <span className="p-1 rounded-full bg-black/60 text-white font-mono text-[9px] uppercase tracking-wider flex items-center gap-1">
                              <Play className="w-2.5 h-2.5 fill-current" /> HD Loop
                            </span>
                          </div>
                        </div>
                      ) : hasImage ? (
                        <div className="w-28 h-16 rounded overflow-hidden border border-outline-variant/40 bg-surface-container">
                          <img
                            src={section.media.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-28 h-16 rounded border border-dashed border-outline-variant/40 bg-surface-container-low flex flex-col items-center justify-center text-outline text-[10px] font-mono">
                          <span>NO MEDIA</span>
                          <span>TEXT ONLY</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions & Visibility Toggle */}
                    <div className="flex items-center gap-2 justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-outline-variant/20">
                      {/* Active Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(section)}
                        className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
                          section.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-surface-container text-outline border border-outline-variant/30 hover:text-on-surface'
                        }`}
                        title="Click to toggle visibility on storefront"
                      >
                        <span className={`w-2 h-2 rounded-full ${section.isActive ? 'bg-emerald-400' : 'bg-outline'}`} />
                        <span>{section.isActive ? 'VISIBLE' : 'HIDDEN'}</span>
                      </button>

                      {/* Edit Button */}
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(section)}
                        className="text-xs px-3 py-1.5 flex items-center gap-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Edit Section</span>
                      </Button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Slide-over Drawer for Section Edits */}
      <SectionEditDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        section={editingSection}
        onSaved={handleSaved}
      />

    </div>
  );
}

