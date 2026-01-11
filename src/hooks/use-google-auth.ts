import { useCallback, useEffect, useState, useRef } from 'react';

import { authApi } from 'src/api';

interface GoogleAuthHook {
  signInWithGoogle: () => Promise<void>;
  isGoogleLoaded: boolean;
}

/**
 * Google Identity Services OAuth hook
 * Loads Google Identity Services and handles OAuth flow
 */
export function useGoogleAuth(
  onSuccess?: (credentialOrToken: string) => void, 
  onError?: (error: Error) => void
): GoogleAuthHook {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const isInitialized = useRef(false);
  const clientIdRef = useRef<string>('');

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

  // Store callbacks in refs to avoid re-initialization
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  // Initialize Google Identity Services once when loaded
  useEffect(() => {
    if (!isGoogleLoaded || isInitialized.current) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!clientId) {
      console.error('Google Client ID is not configured');
      return;
    }

    clientIdRef.current = clientId;

    // Initialize once with stable callback
    try {
      window.google!.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          console.log('Google callback triggered with credential');
          try {
            // Call success callback with the credential (idToken)
            // The callback (handleGoogleCallback) will:
            // 1. Call loginWithGoogle(credential) which handles backend call and auth context update
            // 2. Redirect to dashboard
            if (onSuccessRef.current) {
              console.log('Calling success callback with credential');
              await onSuccessRef.current(response.credential);
            } else {
              console.warn('No success callback provided, handling directly');
              // Fallback: handle directly if no callback provided
              const authResponse = await authApi.googleAuth({ idToken: response.credential });
              localStorage.setItem('accessToken', authResponse.accessToken);
              console.log('Stored access token directly');
            }
          } catch (error) {
            console.error('Google auth error:', error);
            const err = error instanceof Error ? error : new Error('Google authentication failed');
            if (onErrorRef.current) {
              onErrorRef.current(err);
            } else {
              console.error('No error callback provided, error:', err);
            }
          }
        },
      });
      isInitialized.current = true;
      console.log('Google Identity Services initialized');
    } catch (err) {
      console.error('Failed to initialize Google Identity Services:', err);
    }
  }, [isGoogleLoaded]);

  const signInWithGoogle = useCallback(async () => {
    try {
      if (!isGoogleLoaded || !window.google?.accounts?.id || !isInitialized.current) {
        throw new Error('Google Identity Services is not ready yet. Please try again.');
      }

      // Create a hidden container and render button, then trigger it
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.visibility = 'hidden';
      document.body.appendChild(container);

      try {
        // Render Google sign-in button
        window.google!.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        });

        // Wait a moment for button to render, then click it
        setTimeout(() => {
          const button = container.querySelector('div[role="button"]') as HTMLElement;
          if (button) {
            button.click();
          } else {
            // Fallback: use prompt() if button rendering fails
            try {
              window.google!.accounts.id.prompt();
            } catch (err) {
              if (onError) {
                onError(new Error('Failed to trigger Google sign-in. Please try again.'));
              }
            }
          }
          
          // Cleanup after a short delay
          setTimeout(() => {
            if (document.body.contains(container)) {
              document.body.removeChild(container);
            }
          }, 2000);
        }, 100);
      } catch (err) {
        // Cleanup on error
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        // Fallback: use prompt()
        try {
          window.google!.accounts.id.prompt();
        } catch (promptErr) {
          const error = new Error('Failed to trigger Google sign-in. Please check your configuration.');
          if (onError) {
            onError(error);
          }
          throw error;
        }
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
