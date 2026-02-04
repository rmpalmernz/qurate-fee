import { useState, useEffect, useCallback } from 'react';

// Token validation API endpoint (QVOS backend)
const VALIDATION_ENDPOINT = 'https://wzzucfuixqbjowztqzbr.supabase.co/functions/v1/validate-calculator-token';

export interface RecipientInfo {
  recipientName: string | null;
  recipientEmail: string | null;
  company: {
    name: string;
    industry: string;
  } | null;
}

export interface TokenValidationResult {
  isLoading: boolean;
  isValid: boolean;
  error: string | null;
  recipient: RecipientInfo | null;
}

/**
 * Hook to validate calculator access tokens against the QVOS backend.
 * Validates once on initial load and caches the result.
 * 
 * @param token - The token from URL query parameter
 * @param devMode - If true, bypasses validation for development
 */
export function useTokenValidation(
  token: string | null,
  devMode: boolean = false
): TokenValidationResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<RecipientInfo | null>(null);

  const validateToken = useCallback(async () => {
    // Dev mode bypass
    if (devMode) {
      setIsLoading(false);
      setIsValid(true);
      setRecipient({
        recipientName: 'Development User',
        recipientEmail: null,
        company: null,
      });
      return;
    }

    // No token provided
    if (!token) {
      setIsLoading(false);
      setIsValid(false);
      setError('No access token provided');
      return;
    }

    try {
      const response = await fetch(VALIDATION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          mark_as_used: true,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setIsValid(true);
        setRecipient({
          recipientName: data.recipient_name || null,
          recipientEmail: data.recipient_email || null,
          company: data.company ? {
            name: data.company.name || '',
            industry: data.company.industry || '',
          } : null,
        });
        setError(null);
      } else {
        setIsValid(false);
        setError(data.error || 'Invalid token');
        setRecipient(null);
      }
    } catch (err) {
      console.error('Token validation failed:', err);
      setIsValid(false);
      setError('Unable to validate access. Please try again later.');
      setRecipient(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, devMode]);

  // Validate once on mount (or when token/devMode changes)
  useEffect(() => {
    validateToken();
  }, [validateToken]);

  return {
    isLoading,
    isValid,
    error,
    recipient,
  };
}
