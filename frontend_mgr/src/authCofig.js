export const msalConfig = {
  auth: {
    clientId: "a59ff352-ea45-423f-af52-7ee1b86050b1", // From Azure Portal
    authority: "https://login.microsoftonline.com/d6058c58-0ad1-4efe-be9d-ce0a8818dd61", // Replace with your tenant ID
    redirectUri: "https://front-workflow-gzq3.vercel.app/auth/callback",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};