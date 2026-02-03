// LocalStorage utilities for managing generated client access tokens

export interface StoredToken {
  id: string;
  clientName: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  fullUrl: string;
}

const STORAGE_KEY = 'qurate_client_tokens';

/**
 * Get all stored tokens from localStorage
 */
export function getStoredTokens(): StoredToken[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as StoredToken[];
  } catch {
    console.error('Failed to parse stored tokens');
    return [];
  }
}

/**
 * Save a new token to localStorage
 */
export function saveToken(token: StoredToken): void {
  const tokens = getStoredTokens();
  tokens.unshift(token); // Add to beginning (most recent first)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

/**
 * Delete a token by ID
 */
export function deleteToken(id: string): void {
  const tokens = getStoredTokens();
  const filtered = tokens.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * Generate a unique ID for a new token record
 */
export function generateTokenId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
