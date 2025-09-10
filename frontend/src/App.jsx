import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard, Auth } from '@/layouts';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/not-found';

function App() {
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

export default App;
