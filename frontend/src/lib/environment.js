import { GoogleOAuthProvider } from "@react-oauth/google";

export const Environment = {
  API: {
    BaseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7058/api',
    Timeout: 30000,
  },
  GoogleOAuthProvider: {
    ClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '251362053713-dgb4pjf8kr8e9vffre618vcpftdnp2ih.apps.googleusercontent.com',
  },
  App: {
    Name: 'ThirdWatch',
    Version: '1.0.0',
  },
};
