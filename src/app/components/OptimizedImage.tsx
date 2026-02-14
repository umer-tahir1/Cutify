import React, { useState, useRef, useEffect, memo } from 'react';
import { resolveAssetUrl } from '../utils/assetUrl';

// ── Build a resize URL through the backend /assets/resize endpoint ──
// On static deployments (production), skip resize and use the raw image.
const isStaticDeploy = !import.meta.env.DEV;

function getResizedUrl(src: string, width: number, quality = 75): string {
  // Only process /assets/ URLs (our local product/category images)
  if (!src || !src.includes('/assets/')) return resolveAssetUrl(src);
  if (isStaticDeploy) {
    // No backend resize endpoint on GitHub Pages — serve the raw image
    return resolveAssetUrl(src);
  }
  return `/assets/resize?src=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

// ── Generate srcSet for responsive images ──
function buildSrcSet(src: string, widths: number[], quality = 75): string {
  if (!src || !src.includes('/assets/')) return '';
  if (isStaticDeploy) {
    // On static deploy, all sizes point to the same raw image
    const resolved = resolveAssetUrl(src);
    return widths.map(w => `${resolved} ${w}w`).join(', ');
  }
  return widths.map(w => `${getResizedUrl(src, w, quality)} ${w}w`).join(', ');
}

// ── Tiny blurred placeholder (inline SVG) ──
const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23f0e6ef'/%3E%3C/svg%3E`;

interface OptimizedImageProps {
  src: string | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  /** Responsive sizes attribute (default: auto-sized) */
  sizes?: string;
  /** Image widths for srcSet generation */
  srcSetWidths?: number[];
  /** WebP quality 10-100 (default: 75) */
  quality?: number;
  /** Use eager loading (for above-the-fold images) */
  priority?: boolean;
  /** Aspect ratio for CLS prevention (e.g. "4/5", "1/1", "3/4") */
  aspectRatio?: string;
  /** Additional wrapper class */
  wrapperClassName?: string;
  /** Called when image fully loads */
  onLoad?: () => void;
  /** Object-fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  /** Fetch priority hint */
  fetchPriority?: 'high' | 'low' | 'auto';
  style?: React.CSSProperties;
}

const OptimizedImageInner: React.FC<OptimizedImageProps> = ({
  src: rawSrc,
  alt,
  width,
  height,
  className = '',
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  srcSetWidths = [200, 400, 600, 800],
  quality = 75,
  priority = false,
  aspectRatio,
  wrapperClassName = '',
  onLoad,
  objectFit = 'cover',
  fetchPriority,
  style,
}) => {
  const src = rawSrc || '';
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(priority); // priority images are always "in view"
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver for lazy loading (if not priority)
  useEffect(() => {
    if (priority || inView) return;
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' } // start loading 200px before visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, inView]);

  const isLocal = src?.includes('/assets/');
  const srcSet = isLocal && inView ? buildSrcSet(src, srcSetWidths, quality) : undefined;
  // For local images, serve the smallest reasonable size as the default src
  const optimizedSrc = isLocal && inView
    ? getResizedUrl(src, srcSetWidths[srcSetWidths.length - 1] || 800, quality)
    : (inView ? resolveAssetUrl(src) : undefined);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    // Fallback to original src
    setLoaded(true);
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={{ aspectRatio: aspectRatio || undefined }}
    >
      {/* Blur placeholder background */}
      {!loaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50 animate-pulse"
          style={{
            backgroundImage: `url("${PLACEHOLDER_SVG}")`,
            backgroundSize: 'cover',
          }}
        />
      )}

      {/* Actual image — only render when in view */}
      {inView && (
        <img
          src={error ? resolveAssetUrl(src) : optimizedSrc}
          srcSet={error ? undefined : srcSet}
          sizes={error ? undefined : (isLocal ? sizes : undefined)}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={fetchPriority || (priority ? 'high' : undefined)}
          className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          style={{ objectFit, ...style }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export const OptimizedImage = memo(OptimizedImageInner);

// ── Re-export helpers for direct use ──
export { getResizedUrl, buildSrcSet };
