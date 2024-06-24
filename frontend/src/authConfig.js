// src/authConfig.js
export const msalConfig = {
    auth: {
      clientId: process.env.REACT_APP_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
      redirectUri: window.location.origin
    },
    cache: {
      cacheLocation: "sessionStorage", // or "localStorage"
      storeAuthStateInCookie: false
    }
};
  
export const loginRequest = {
    scopes: ["User.Read"]
};
  