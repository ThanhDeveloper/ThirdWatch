import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Dashboard, Auth } from '@/layouts';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/not-found';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

function App() {
  useWelcomeToast();

  return (
    <Routes>
      {/* Protected dashboard routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Public auth routes */}
      <Route path="/auth/*" element={<Auth />} />
      
      {/* 404 page */}
      <Route path="/404" element={<NotFound />} />
      
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard/home" replace />} />
      
      {/* Catch all other routes and redirect to 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

function useWelcomeToast() {
  const location = useLocation();

  useEffect(() => {
    const shouldWelcome = sessionStorage.getItem('showWelcomeToast') === '1';
    if (!shouldWelcome) return;
    sessionStorage.removeItem('showWelcomeToast');

    const hours = new Date().getHours();
    let greeting = 'Welcome';
    if (hours < 12) greeting = 'Good morning';
    else if (hours < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    const user = localStorage.getItem('user');
    const name = user ? (JSON.parse(user).name || '') : '';
    const message = name ? `${greeting}, ${name}!` : `${greeting}!`;

    toast.success(message);
  }, [location.pathname]);
}

export default App;
