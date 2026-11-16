import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Link as LinkIcon,
  Film,
  Image as ImageIcon,
  Check,
  AlertCircle,
  X,
  Loader2,
  Copy,
  ExternalLink,
  Play
} from 'lucide-react';
import { apiClient } from '../../lib/apiClient.js';

export function MediaUploader({
  value = '',
  onChange,
  type = 'video', // 'video' | 'image'
  label,
  helperText,
  recommended
}) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'url'
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const isVideo = type === 'video';
  const acceptTypes = isVideo
    ? 'video/mp4,video/webm,video/quicktime,video/x-m4v'
    : 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml';

  const defaultLabel = isVideo ? 'Ambient Video Stream' : 'Editorial Image';
  const defaultHelper = isVideo
    ? 'Direct MP4/WebM video stream for looping background playback.'
    : 'High-resolution photo for lookbook or editorial placement.';
  const defaultRecommended = isVideo
    ? 'MP4, WebM or MOV up to 100MB (16:9 or 21:9 ratio recommended)'
    : 'JPG, PNG or WebP up to 20MB';

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Check size limit: 100MB for video, 20MB for image
    const maxSize = isVideo ? 100 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is ${isVideo ? '100MB' : '20MB'}.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const data = await apiClient.upload(file, (percent) => {
        setUploadProgress(percent);
      });

      if (data?.url) {
        onChange(data.url);
      } else {
        throw new Error('Upload succeeded but no media URL was returned');
      }
    } catch (err) {
      setUploadError(err.message || 'Failed to upload media file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCopyUrl = () => {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onChange('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Header & Mode Tabs */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono text-outline font-medium">
          {label || defaultLabel}
        </label>
        <div className="flex items-center gap-1 bg-surface-container rounded-md p-0.5 border border-outline-variant/30 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
              tab === 'upload'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
              tab === 'url'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Paste URL</span>
          </button>
        </div>
      </div>

      {/* Upload Zone Tab */}
      {tab === 'upload' && (
        <div className="space-y-2">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-outline-variant/40 bg-surface-container/50 hover:bg-surface-container hover:border-outline-variant/70'
            } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptTypes}
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploading ? (
              <div className="space-y-3 py-2">
                <div className="flex items-center justify-center gap-2 text-primary font-mono text-xs font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading {isVideo ? 'video' : 'image'} to secure cloud storage... {uploadProgress}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full max-w-xs mx-auto bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-outline block">
                  Processing file stream & persisting to database...
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-surface-container-high flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                  {isVideo ? (
                    <Film className="w-5 h-5 text-outline" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-outline" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-headline font-semibold text-on-surface">
                    Drag & drop your {isVideo ? 'video' : 'photo'} here, or{' '}
                    <span className="text-primary underline">browse files</span>
                  </p>
                  <p className="text-[11px] font-mono text-outline mt-0.5">
                    {recommended || defaultRecommended}
                  </p>
                </div>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="p-2 rounded bg-error/10 border border-error/30 text-error flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{uploadError}</span>
              </div>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="text-error hover:text-on-surface"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Paste URL Tab */}
      {tab === 'url' && (
        <div className="space-y-1.5">
          <div className="relative flex items-center">
            <input
              type="url"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={isVideo ? 'https://.../video.mp4' : 'https://.../photo.jpg'}
              className="w-full bg-surface-container px-3 py-2 text-xs font-mono text-on-surface rounded-md border border-outline-variant/40 focus:border-primary focus:outline-none pr-16"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 px-1.5 py-0.5 text-[10px] font-mono text-outline hover:text-on-surface hover:bg-surface-container-high rounded transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <span className="text-[11px] text-outline block">
            {helperText || defaultHelper}
          </span>
        </div>
      )}

      {/* Active Media Preview & Actions */}
      {value && (
        <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low overflow-hidden">
          {/* Media Player / Image Display */}
          <div className="relative bg-black group">
            {isVideo ? (
              <div className="relative w-full aspect-video max-h-56 bg-black flex items-center justify-center overflow-hidden">
                <video
                  key={value}
                  src={value}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white font-mono text-[9px] uppercase tracking-wider backdrop-blur-xs flex items-center gap-1 pointer-events-none">
                  <Play className="w-2.5 h-2.5 fill-current text-emerald-400" />
                  <span>Live Stream Active</span>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-36 bg-surface-container overflow-hidden">
                <img
                  src={value}
                  alt="Media preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Bar below media */}
          <div className="p-2.5 flex items-center justify-between gap-2 border-t border-outline-variant/20 bg-surface-container/60 text-xs">
            <div className="flex-1 min-w-0 pr-2">
              <p className="font-mono text-[10px] text-outline truncate" title={value}>
                {value}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyUrl}
                title="Copy media URL"
                className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1 text-[11px] font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                title="Open in new tab"
                className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleClear}
                title="Remove media"
                className="p-1 rounded text-outline hover:text-error hover:bg-error/10 transition-colors flex items-center gap-1 text-[11px] font-mono"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaUploader;
