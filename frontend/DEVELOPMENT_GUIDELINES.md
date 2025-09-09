# ThirdWatch Frontend - Development Guidelines

## 🎯 Project Overview
ThirdWatch is a React-based dashboard application with authentication, data visualization, and modern UI components.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + Vite
- **UI Library**: Material Tailwind React
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Charts**: ApexCharts
- **Styling**: Tailwind CSS
- **Authentication**: Cookie-based with credential management

### Project Structure
```
src/
├── components/          # Reusable components
│   └── ProtectedRoute.jsx
├── layouts/            # Layout components
│   ├── auth.jsx
│   └── dashboard.jsx
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   └── dashboard/      # Dashboard pages
│       └── tools/      # Tools section
├── widgets/            # Complex UI components
│   ├── cards/          # Card components
│   ├── charts/         # Chart components
│   └── layout/         # Layout widgets
├── services/           # API and business logic
├── context/            # React context providers
├── data/               # Static data and mock data
└── lib/                # Utility functions
```

## 📱 Responsive Design Rules

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Tailwind Classes
```css
/* Mobile First Approach */
className="text-sm sm:text-base lg:text-lg"
className="p-4 sm:p-6 lg:p-8"
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
```

### Component Structure
```jsx
<div className="mt-4 sm:mt-8 lg:mt-12 px-4 sm:px-6 lg:px-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Responsive content */}
  </div>
</div>
```

## 🔐 Authentication Flow

### Protected Routes
- Use `ProtectedRoute` component to guard dashboard routes
- Authentication verification via `/auth/verify` endpoint
- Automatic redirect to sign-in for unauthenticated users

### API Integration
```javascript
// Use existing apiClient from services/api.js
import apiClient from '@/services/api';

// All requests include credentials automatically
const response = await apiClient.get('/endpoint');
```

## 🎨 UI/UX Guidelines

### Material Tailwind Components
- Use Material Tailwind React components consistently
- Follow established color scheme and design system
- Implement proper loading states and user feedback

### Color Scheme
- Primary: Blue variants
- Secondary: Blue-gray variants
- Success: Green
- Error: Red
- Warning: Amber

### Typography
- Headings: Use Typography component with proper variants
- Body text: Consistent font sizes and line heights
- Responsive text sizing

## 🧩 Component Development

### Component Structure
```jsx
import React, { useState, useEffect } from 'react';
import { Typography, Button } from '@material-tailwind/react';
import PropTypes from 'prop-types';

export function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState('');
  
  useEffect(() => {
    // Side effects
  }, []);
  
  return (
    <div className="responsive-classes">
      {/* Component content */}
    </div>
  );
}

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

export default ComponentName;
```

### State Management
- Use React hooks (useState, useEffect, useContext)
- Implement proper loading and error states
- Use context for global state when needed

### Error Handling
```jsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleAction = async () => {
  setLoading(true);
  setError('');
  try {
    // Implementation
  } catch (err) {
    setError('User-friendly error message');
    toast.error('Error occurred');
  } finally {
    setLoading(false);
  }
};
```

## 🛠️ Development Workflow

### Before Making Changes
1. **Read existing code** to understand patterns
2. **Check similar components** for consistency
3. **Understand the data flow** and state management
4. **Review responsive design** requirements

### During Development
1. **Follow responsive design** principles
2. **Use existing components** and patterns
3. **Implement proper error handling**
4. **Add loading states** and user feedback
5. **Test on multiple devices**

### After Development
1. **Test responsive behavior** on all screen sizes
2. **Verify accessibility** requirements
3. **Check for console errors**
4. **Validate user interactions**

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1024px+ width)
- [ ] Verify all buttons and links work
- [ ] Check form validation
- [ ] Test error scenarios
- [ ] Verify loading states
- [ ] Check accessibility (keyboard navigation)

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Code Quality

### Naming Conventions
- **Components**: PascalCase (`DataGenerator`)
- **Files**: kebab-case (`data-generator.jsx`)
- **Variables**: camelCase (`userName`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Documentation
- Add JSDoc comments for complex functions
- Include PropTypes for all components
- Document component props and usage
- Add inline comments for complex logic

### Performance
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Avoid unnecessary re-renders
- Optimize bundle size

## 🚀 Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
- `VITE_API_BASE_URL`: API base URL
- Other environment-specific configurations

## 🔧 Troubleshooting

### Common Issues
1. **Responsive Layout Breaking**: Check Tailwind classes and breakpoints
2. **Authentication Issues**: Verify cookie handling and API endpoints
3. **Component Not Rendering**: Check imports and prop types
4. **Styling Issues**: Verify Material Tailwind component usage

### Debug Tools
- React Developer Tools
- Browser DevTools
- Network tab for API debugging
- Console for error messages

## 📚 Resources

### Documentation
- [Material Tailwind React](https://www.material-tailwind.com/)
- [React Router DOM](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ApexCharts](https://apexcharts.com/)

### Best Practices
- Follow React best practices
- Implement proper error boundaries
- Use semantic HTML elements
- Ensure accessibility compliance
- Optimize for performance
