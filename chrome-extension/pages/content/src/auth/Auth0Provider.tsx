import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import type { Auth0Client, User } from '@auth0/auth0-spa-js';

interface Auth0ContextType {
  isAuthenticated: boolean;
  user: User | undefined;
  isLoading: boolean;
  loginWithRedirect: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const Auth0Context = createContext<Auth0ContextType | null>(null);

export const useAuth0 = () => {
  const context = useContext(Auth0Context);
  if (!context) {
    throw new Error('useAuth0 must be used within an Auth0Provider');
  }
  return context;
};

interface Auth0ProviderProps {
  children: ReactNode;
}

export const Auth0Provider = ({ children }: Auth0ProviderProps) => {
  const [auth0Client, setAuth0Client] = useState<Auth0Client | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth0 = async () => {
      try {
        console.log('Initializing Auth0...');
        const extensionUrl = chrome.runtime.getURL('popup.html');
        console.log('Extension URL:', extensionUrl); // Debug log

        const client = await createAuth0Client({
          domain: 'dev-xwr5wf24ald2p0la.us.auth0.com',
          clientId: 'fJxFAp9DABaE2WTkNEvScV9XQ2ZQrBwL',
          authorizationParams: {
            redirect_uri: extensionUrl,
            scope: 'openid profile email',
            response_type: 'token id_token',
          },
          cacheLocation: 'localstorage',
          useRefreshTokens: true,
          useFormData: true,
          auth0Client: {
            name: 'monkey-chat-extension',
            version: '1.0.0',
          },
        });

        setAuth0Client(client);
        console.log('Auth0 client created');

        if (window.location.search.includes('state=')) {
          console.log('Handling callback...');
          await client.handleRedirectCallback();
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const isAuth = await client.isAuthenticated();
        console.log('Is authenticated:', isAuth);
        setIsAuthenticated(isAuth);

        if (isAuth) {
          const userProfile = await client.getUser();
          setUser(userProfile);
          console.log('User profile:', userProfile);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Auth0 initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Auth0');
        setIsLoading(false);
      }
    };

    initAuth0();
  }, []);

  const loginWithRedirect = async () => {
    try {
      console.log('Attempting login with popup...');
      if (auth0Client) {
        await auth0Client.loginWithPopup({
          authorizationParams: {
            redirect_uri: chrome.runtime.getURL('popup.html'),
            response_type: 'token id_token',
            scope: 'openid profile email',
          },
        });

        const isAuth = await auth0Client.isAuthenticated();
        if (isAuth) {
          const user = await auth0Client.getUser();
          setUser(user);
          setIsAuthenticated(true);
          console.log('Login successful:', user);
        } else {
          throw new Error('Failed to authenticate');
        }
      } else {
        console.error('Auth0 client not initialized');
        setError('Auth0 client not initialized');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
    }
  };

  const logout = async () => {
    if (auth0Client) {
      await auth0Client.logout({
        logoutParams: {
          returnTo: chrome.runtime.getURL('popup.html'),
        },
      });
    }
  };

  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        loginWithRedirect,
        logout,
        error,
      }}>
      {children}
    </Auth0Context.Provider>
  );
};
