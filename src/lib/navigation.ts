/**
 * Navigation and redirect utilities
 */

/**
 * List of safe redirect paths within the application
 * Only paths starting with these prefixes are allowed
 */
const SAFE_REDIRECT_PATHS = [
  '/',
  '/dashboard',
  '/profile',
  '/edit-profile',
  '/opgs',
  '/products',
  '/product/',
  '/opg/',
  '/reservations',
  '/notifications',
  '/conversations',
  '/chat/',
  '/add-product',
  '/edit-product/',
  '/map',
  '/favorites',
  '/settings'
] as const;

/**
 * Validate that a redirect path is safe to use
 * Prevents open redirect vulnerabilities
 * @param path - The path to validate
 * @returns true if the path is safe
 */
export const isSafeRedirectPath = (path: string | null | undefined): boolean => {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // Reject absolute URLs (must be relative paths)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return false;
  }

  // Reject paths with suspicious characters
  if (path.includes('\\') || path.includes('<') || path.includes('>')) {
    return false;
  }

  // Must start with /
  if (!path.startsWith('/')) {
    return false;
  }

  // Check if path starts with any safe prefix
  return SAFE_REDIRECT_PATHS.some(safePath =>
    path === safePath || path.startsWith(safePath)
  );
};

/**
 * Get a safe redirect path, falling back to default if invalid
 * @param path - The requested redirect path
 * @param defaultPath - The default path to use if invalid (default: '/')
 * @returns A safe redirect path
 */
export const getSafeRedirectPath = (
  path: string | null | undefined,
  defaultPath: string = '/'
): string => {
  return isSafeRedirectPath(path) ? path : defaultPath;
};

/**
 * Store a redirect path in localStorage (only if safe)
 * @param path - The path to store
 * @returns true if stored, false if rejected
 */
export const storeRedirectPath = (path: string): boolean => {
  if (isSafeRedirectPath(path)) {
    localStorage.setItem('redirectAfterLogin', path);
    return true;
  }
  return false;
};

/**
 * Get and remove the stored redirect path from localStorage
 * Returns a safe path or the default
 * @param defaultPath - The default path to use if no valid redirect (default: '/')
 * @returns A safe redirect path
 */
export const consumeRedirectPath = (defaultPath: string = '/'): string => {
  const path = localStorage.getItem('redirectAfterLogin');
  localStorage.removeItem('redirectAfterLogin');
  return getSafeRedirectPath(path, defaultPath);
};
