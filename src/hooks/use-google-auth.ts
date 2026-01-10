import { useCallback, useEffect, useState } from 'react';

import { authApi } from 'src/api';

interface GoogleAuthHook {
  signInWithGoogle: () => Promise<void>;
  isGoogleLoaded: boolean;
}

/**
 * Google Identity Services OAuth hook
 * Loads Google Identity Services and handles OAuth flow
 */
export function useGoogleAuth(onSuccess?: (token: string) => void, onError?: (error: Error) => void): GoogleAuthHook {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Load Google Identity Services script
  useEffect(() => {
    if (window.google?.accounts) {
      setIsGoogleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Identity Services');
    };
    document.head.appendChild(script);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      if (!isGoogleLoaded || !window.google?.accounts?.id) {
        throw new Error('Google Identity Services is not loaded yet. Please try again.');
      }

      // Get Google Client ID from environment
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

      if (!clientId) {
        throw new Error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
      }

      // Initialize Google Identity Services with callback
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          try {
            // Send ID token to backend
            const authResponse = await authApi.googleAuth({ idToken: response.credential });
            
            // Store token
            localStorage.setItem('accessToken', authResponse.accessToken);
            
            // Call success callback if provided
            if (onSuccess) {
              onSuccess(authResponse.accessToken);
            }
          } catch (error) {
            const err = error instanceof Error ? error : new Error('Google authentication failed');
            if (onError) {
              onError(err);
            } else {
              throw err;
            }
          }
        },
      });

      // Show one-tap prompt (if available)
      // Note: prompt() doesn't take parameters - it just shows the UI
      try {
        window.google.accounts.id.prompt();
      } catch (err) {
        // One-tap not available - user can still click button
        console.debug('Google one-tap not available, using button flow');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to initialize Google authentication');
      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, [isGoogleLoaded, onSuccess, onError]);

  return { signInWithGoogle, isGoogleLoaded };
}

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
          id: {
            initialize: (config: {
              client_id: string;
              callback: (response: { credential: string }) => void;
            }) => void;
            prompt: () => void;
            renderButton: (element: HTMLElement, config: any) => void;
          };
      };
    };
  }
}
