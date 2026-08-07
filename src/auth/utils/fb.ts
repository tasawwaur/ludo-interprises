/**
 * Facebook SDK Client Utility
 */

export interface FBFriend {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
}

export interface FBUserProfile {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

// Dynamically load the Facebook SDK script
export const loadFacebookSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded
    if ((window as any).FB) {
      resolve();
      return;
    }

    // Set up async initialization hook
    const previousInit = (window as any).fbAsyncInit;
    (window as any).fbAsyncInit = function () {
      if (previousInit) previousInit();
      resolve();
    };

    // Check if script already injected
    if (document.getElementById('facebook-jssdk')) {
      return;
    }

    try {
      const fjs = document.getElementsByTagName('script')[0];
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      js.crossOrigin = 'anonymous';
      js.onerror = () => reject(new Error('Failed to load Facebook SDK script.'));
      
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      } else {
        document.head.appendChild(js);
      }
    } catch (err) {
      reject(err);
    }
  });
};

// Initialize Facebook SDK
export const initFacebookSDK = (appId: string = '1745824376557788'): Promise<void> => {
  return new Promise((resolve) => {
    loadFacebookSDK()
      .then(() => {
        try {
          (window as any).FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
          resolve();
        } catch (e) {
          console.warn('Error in FB.init:', e);
          resolve(); // Resolve anyway to allow mock fallback
        }
      })
      .catch((err) => {
        console.warn('Facebook SDK failed to load, falling back to mock mode:', err);
        resolve(); // Resolve to let the application continue
      });
  });
};

// Login with Facebook SDK
export const loginWithFacebook = (): Promise<FBUserProfile> => {
  return new Promise((resolve, reject) => {
    const FB = (window as any).FB;
    if (!FB) {
      reject(new Error('Facebook SDK not loaded.'));
      return;
    }

    FB.login((response: any) => {
      if (response.authResponse) {
        // Logged in successfully, retrieve user profile
        FB.api('/me', { fields: 'id,name,email,picture.type(large)' }, (profile: any) => {
          if (profile && !profile.error) {
            resolve({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              avatarUrl: profile.picture?.data?.url
            });
          } else {
            reject(new Error('Failed to fetch Facebook profile details.'));
          }
        });
      } else {
        reject(new Error('Facebook login cancelled or failed.'));
      }
    }, { scope: 'public_profile,email,user_friends' });
  });
};

// Fetch real Facebook friends who also authorized the app
export const fetchFacebookFriends = (): Promise<FBFriend[]> => {
  return new Promise((resolve, reject) => {
    const FB = (window as any).FB;
    if (!FB) {
      resolve([]);
      return;
    }

    FB.api('/me/friends', { fields: 'id,name,picture.type(large)' }, (response: any) => {
      if (response && !response.error && response.data) {
        const friends: FBFriend[] = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          avatarUrl: item.picture?.data?.url,
          isOnline: Math.random() > 0.4 // Mock online status for game integration
        }));
        resolve(friends);
      } else {
        console.warn('FB.api(/me/friends) failed or returned empty:', response?.error);
        resolve([]); // Resolve empty instead of rejecting to keep app robust
      }
    });
  });
};
