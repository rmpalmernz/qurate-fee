// Token utilities for access control
// Token validation is now handled by the QVOS backend
// This file is kept for reference and potential admin-side token generation

/**
 * Helper to extract token from URL
 * Used by the useTokenValidation hook
 */
export function getTokenFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

/**
 * @deprecated Token validation is now handled by the QVOS backend.
 * Use the useTokenValidation hook instead.
 * 
 * This function is kept for backwards compatibility and will be removed
 * in a future version.
 */
export function validateToken(token: string | null): { 
  valid: boolean; 
  error?: string;
  expiresAt?: Date;
} {
  console.warn('validateToken is deprecated. Token validation is now handled by the QVOS backend.');
  
  if (!token) {
    return { valid: false, error: 'No access token provided' };
  }
  
  // All token validation now happens server-side
  return { valid: false, error: 'Client-side validation deprecated' };
}
