/**
 * Google Identity Services (GIS) Client Utility
 */

export interface GoogleUserProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  givenName?: string;
  familyName?: string;
}

// Dynamically load the Google Identity Services SDK script
export const loadGoogleSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.id) {
      resolve();
      return;
    }

    if (document.getElementById('google-jssdk')) {
      resolve();
      return;
    }

    try {
      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK.'));
      document.head.appendChild(script);
    } catch (err) {
      reject(err);
    }
  });
};

// Safely decode Google JWT Credential Token
export const decodeGoogleJwt = (credential: string): GoogleUserProfile | null => {
  try {
    const base64Url = credential.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      sub: parsed.sub,
      name: parsed.name || `${parsed.given_name || ''} ${parsed.family_name || ''}`.trim(),
      email: parsed.email,
      picture: parsed.picture,
      givenName: parsed.given_name,
      familyName: parsed.family_name,
    };
  } catch (err) {
    console.error('Error decoding Google JWT:', err);
    return null;
  }
};

// Initialize Google SDK
export const initGoogleSDK = async (
  clientId: string,
  onSuccess: (profile: GoogleUserProfile) => void
): Promise<boolean> => {
  try {
    await loadGoogleSDK();
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.initialize({
        client_id: clientId || '1088492040921-sample.apps.googleusercontent.com',
        callback: (response: any) => {
          if (response.credential) {
            const profile = decodeGoogleJwt(response.credential);
            if (profile) {
              onSuccess(profile);
            }
          }
        },
        auto_select: false,
      });
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Google SDK init warning:', e);
    return false;
  }
};

// Render Official Google Sign-In Button into HTML Element
export const renderGoogleSignInButton = (
  container: HTMLElement,
  clientId: string,
  onSuccess: (profile: GoogleUserProfile) => void
): void => {
  try {
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.initialize({
        client_id: clientId || '1088492040921-sample.apps.googleusercontent.com',
        callback: (response: any) => {
          if (response.credential) {
            const profile = decodeGoogleJwt(response.credential);
            if (profile) {
              onSuccess(profile);
            }
          }
        },
      });

      google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 280,
      });
    }
  } catch (e) {
    console.warn('Error rendering Google button:', e);
  }
};

// Trigger Real Google OAuth 2.0 Popup Window Client
export const triggerGoogleOAuth = (
  clientId: string,
  onSuccess: (profile: GoogleUserProfile) => void
): void => {
  try {
    const google = (window as any).google;
    if (google?.accounts?.oauth2) {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId || '1088492040921-sample.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const data = await res.json();
              if (data && data.name) {
                onSuccess({
                  sub: data.sub || `goog_${Date.now()}`,
                  name: data.name,
                  email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
                  picture: data.picture,
                  givenName: data.given_name,
                  familyName: data.family_name,
                });
              }
            } catch (err) {
              console.warn('Error fetching Google userinfo:', err);
            }
          }
        },
      });
      client.requestAccessToken();
    } else {
      promptGoogleSignIn();
    }
  } catch (err) {
    console.warn('Error triggering Google OAuth popup:', err);
    promptGoogleSignIn();
  }
};

// Prompt Google Sign-In One-Tap
export const promptGoogleSignIn = (): void => {
  const google = (window as any).google;
  if (google?.accounts?.id) {
    google.accounts.id.prompt();
  }
};
