# GitHub Copilot Instructions for ThirdWatch Frontend

These are project-specific instructions for GitHub Copilot when generating or suggesting code in this repository.

## Project Context
- React 18 + Vite
- ThirdWatch components
- React Router DOM v6
- Axios for API calls
- ApexCharts for data visualization
- Cookie-based authentication
- Using yarn as the package manager
- Install packages with `yarn add <package-name>`

## Core Development Rules

### 1. Project Structure Understanding
- ALWAYS read and understand the existing codebase before making changes
- Follow the established folder structure: `/src/pages/dashboard/`, `/src/widgets/`, `/src/services/`
- Use existing patterns and conventions found in the codebase
- Maintain consistency with current naming conventions (camelCase for components, kebab-case for files)

### 2. Responsive Design Requirements
- ALL code MUST be mobile-first and fully responsive
- Use Tailwind CSS responsive prefixes: `md:`, `lg:`, `xl:`
- Test layouts on mobile (320px), tablet (768px), and desktop (1024px+)
- NEVER break the layout on any device - app must work perfectly on all screen sizes
- Use flexbox and grid layouts appropriately for responsive behavior
- Ensure touch targets are at least 44px for mobile accessibility

### 3. Code Quality & Maintainability
- Write clean, readable, and well-documented code
- Use meaningful variable and function names
- Add proper PropTypes for all components
- Include JSDoc comments for complex functions
- Follow React best practices and hooks patterns
- Use TypeScript-style prop validation where possible
- Always use package with the latest stable version, popular and compatible with existing packages. 

### 4. Implementation Guidelines
- ALWAYS understand existing logic before implementing changes
- Read related files to understand data flow and state management
- Maintain existing authentication and routing patterns
- Use Material Tailwind components consistently
- Follow the established error handling patterns
- Implement proper loading states and user feedback

### 5. Component Development
- Create reusable components when possible
- Use proper state management (useState, useEffect, context)
- Implement proper error boundaries and fallbacks
- Ensure components are accessible (ARIA labels, keyboard navigation)
- Use semantic HTML elements

### 6. API Integration
- Follow existing API patterns in `/src/services/`
- Use the established axios configuration
- Implement proper error handling and user feedback
- Maintain authentication token handling
- Use proper loading states for async operations

### 7. Styling Guidelines
- Use ThirdWatch components as the primary UI library
- Follow the established color scheme and design system
- Use consistent spacing and typography
- Implement proper dark/light theme support
- Ensure proper contrast ratios for accessibility

### 8. Testing & Validation
- Test all functionality on multiple devices and browsers
- Ensure forms have proper validation
- Implement proper error handling and user feedback
- Use toast notifications for user actions
- Validate all user inputs
- Validate generated code after generation

## File Structure Rules
- Components: `/src/components/` for reusable components
- Pages: `/src/pages/dashboard/` for dashboard pages
- Widgets: `/src/widgets/` for complex UI components
- Services: `/src/services/` for API and business logic
- Utils: `/src/lib/` for utility functions
- Data: `/src/data/` for static data and mock data

## Code Examples

### Responsive Component Structure:
```jsx
<div className="mt-4 sm:mt-8 lg:mt-12 px-4 sm:px-6 lg:px-8">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Content */}
  </div>
</div>
```

### Proper State Management:
```jsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleSubmit = async () => {
  setLoading(true);
  setError('');
  try {
    // Implementation
  } catch (err) {
    setError('Error message');
  } finally {
    setLoading(false);
  }
};
```

## Never Do:
- Break existing functionality
- Ignore responsive design requirements
- Create components without proper error handling
- Use hardcoded values without constants
- Skip proper validation and user feedback
- Ignore accessibility requirements
- Create non-reusable code when patterns exist

## Always Do:
- Read and understand existing code first and related files
- Test on multiple devices
- Use existing patterns and conventions
- Implement proper error handling
- Add loading states and user feedback
- Follow responsive design principles
- Write maintainable and readable code
- Your code must be enterprise standard. Minimum level senior or above
- File should not contain any deprecated icons or components
- Always follow the established folder structure and naming conventions
- Code should be consistent with existing code style (ESLint, Prettier)
- File should not contain any unused imports or variables
- Code in files should not exceed 800 lines. If it is too long, separate components for easy reuse and import
- UI should be consistent with existing design patterns and components
- Never add redundant comments
- Don't add redundant code and console logs
- Reuse existing components and utilities wherever possible (e.g., buttons, modals, form elements)