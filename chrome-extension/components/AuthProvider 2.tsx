import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { useState } from 'react';


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const domain = 'dev-0p8i6f4ki1j6kwnf.us.auth0.com';
  const clientId = 'hPFWi5PD63MdRT68GimI0aY6usTHNrB2';
  const redirectUri = chrome.runtime.getURL(`chrome-extension://${chrome.runtime.id}/`);


  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: redirectUri }}
      redirectUri={chrome.identity.getRedirectURL()}
    >
      {children}
    </Auth0Provider>
  );
};


