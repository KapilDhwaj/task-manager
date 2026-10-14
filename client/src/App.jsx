import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import useReminders from './hooks/useReminders';
import {
  requestNotificationPermission,
  registerServiceWorker,
} from './utils/notifications';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Inner component so it can access AuthContext
function AppInner() {
  const { user } = useAuth();

  // Register service worker once on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Ask for notification permission once user logs in
  useEffect(() => {
    if (user) {
      requestNotificationPermission();
    }
  }, [user]);

  // Listen for SW navigation messages (e.g., clicking a notification)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = (event) => {
      if (event.data?.type === 'NAVIGATE') {
        window.location.href = event.data.path;
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, []);

  // Start reminder polling when logged in
  useReminders(!!user);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route path="/"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', fontWeight: '500' },
          }}
        />
        <AppInner />
      </Router>
    </AuthProvider>
  );
}

export default App;
