export const Environment = {
  API: {
    BaseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7058/api',
    Timeout: 30000,
  },
  App: {
    Name: 'ThirdWatch',
    Version: '1.0.0',
  },
};
