/**
 * Resolves an asset URL to include the Vite base path.
 * Images in the static JSON data are stored as "/assets/..." but on GitHub Pages
 * with base="/Cutify/", they need to be "/Cutify/assets/...".
 *
 * This function also handles external URLs (starting with http) by passing them through.
 */

const BASE = import.meta.env.BASE_URL || '/';

export function resolveAssetUrl(url: string | undefined): string {
  if (!url) return '';
  // External URLs — pass through
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // Already has the base prefix
  if (BASE !== '/' && url.startsWith(BASE)) {
    return url;
  }
  // Ensure leading slash
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  // Prepend base (remove trailing / from base to avoid double slash)
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  return `${base}${cleanUrl}`;
}
