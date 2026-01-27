// Self-contained token utilities for access control
// Tokens encode the expiry date within them (no database needed)

const TOKEN_SECRET = 'qurate-fee-calc-2024'; // Simple obfuscation key

/**
 * Generates a self-contained access token with embedded expiry
 * Copy this function to your Qurate admin app to generate client tokens
 * 
 * @param daysValid - Number of days the token should be valid (default: 30)
 * @returns Base64 encoded token string
 */
export function generateToken(daysValid: number = 30): string {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + daysValid);
  
  const payload = {
    exp: expiryDate.getTime(),
    iat: Date.now(),
    key: TOKEN_SECRET,
  };
  
  // Encode payload as base64
  const encoded = btoa(JSON.stringify(payload));
  
  // Add a simple checksum for basic integrity
  const checksum = simpleHash(encoded);
  
  return `${encoded}.${checksum}`;
}

/**
 * Validates an access token and checks if it's expired
 * 
 * @param token - The token string from URL parameter
 * @returns Object with valid flag and optional error message
 */
export function validateToken(token: string | null): { 
  valid: boolean; 
  error?: string;
  expiresAt?: Date;
} {
  if (!token) {
    return { valid: false, error: 'No access token provided' };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [encoded, checksum] = parts;
    
    // Verify checksum
    if (simpleHash(encoded) !== checksum) {
      return { valid: false, error: 'Token integrity check failed' };
    }

    // Decode payload
    const payload = JSON.parse(atob(encoded));
    
    // Verify secret key
    if (payload.key !== TOKEN_SECRET) {
      return { valid: false, error: 'Invalid token' };
    }

    // Check expiry
    const expiryDate = new Date(payload.exp);
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, expiresAt: expiryDate };
  } catch {
    return { valid: false, error: 'Invalid token' };
  }
}

/**
 * Simple hash function for checksum
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Helper to extract token from URL
export function getTokenFromURL(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}
