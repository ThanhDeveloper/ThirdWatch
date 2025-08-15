# ThirdWatch Frontend

Modern React dashboard application built with Material Tailwind and Vite.

## Features

- 🎨 **Modern UI**: Material Tailwind components
- 🔐 **Authentication**: JWT-based login/logout
- 🛡️ **Protected Routes**: Secure dashboard access
- 📱 **Responsive Design**: Mobile-first approach
- ⚡ **Fast Development**: Vite build tool
- 🎯 **404 Handling**: Smart error page routing

## Quick Start

### Prerequisites

- Node.js 18+ 
- Yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Create environment file:**
   ```bash
   # Create .env.local file
   VITE_API_BASE_URL=https://localhost:7058/api
   VITE_APP_NAME=ThirdWatch
   VITE_APP_VERSION=1.0.0
   ```

3. **Start development server:**
   ```bash
   yarn dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable components
│   └── ProtectedRoute.jsx
├── layouts/            # Layout components
│   ├── auth.jsx
│   └── dashboard.jsx
├── lib/               # Configuration
│   └── environment.js
├── pages/             # Page components
│   ├── auth/
│   │   ├── sign-in.jsx
│   │   └── sign-up.jsx
│   ├── dashboard/
│   │   ├── home.jsx
│   │   ├── profile.jsx
│   │   └── ...
│   └── not-found.jsx
├── services/          # API services
│   ├── api.js
│   └── authService.js
├── widgets/           # Dashboard widgets
└── App.jsx           # Main app component
```

## Authentication

The app uses JWT tokens for authentication:

- **Login**: `/auth/sign-in`
- **Protected Routes**: All dashboard routes require authentication
- **Logout**: Available in user menu
- **Token Storage**: localStorage

## API Integration

- **Base URL**: Configured via `VITE_API_BASE_URL`
- **Error Handling**: Automatic 401 redirects to login
- **Request Interceptors**: Automatic token injection
- **Response Interceptors**: Error handling and token management

## 404 Handling

- **Route 404**: Invalid URLs redirect to `/404`
- **API 404**: API errors are handled separately (no redirect)
- **Responsive**: Mobile-friendly 404 page

## Development

### Code Style

- ESLint configuration included
- Prettier formatting
- Consistent naming conventions
- No deprecated icons or components

### Best Practices

- Component-based architecture
- Service layer for API calls
- Proper error handling
- Responsive design
- Clean code structure

## Build & Deploy

```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

## License

This project is licensed under the MIT License.
