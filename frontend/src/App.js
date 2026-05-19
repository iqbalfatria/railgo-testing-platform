import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SchedulePage from './pages/SchedulePage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import DashboardPage from './pages/DashboardPage';
import MyTicketsPage from './pages/MyTicketsPage';
import { ProfilePage, ForgotPasswordPage } from './pages/ProfilePage';
import QASandboxPage from './pages/QASandboxPage';

import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: 'white' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/qa-sandbox" element={<QASandboxPage />} />

          {/* Semi-Public - accessible but redirects to login for booking */}
          <Route path="/booking" element={<BookingPage />} />

          {/* Protected Routes */}
          <Route path="/payment/:bookingCode" element={
            <ProtectedRoute><PaymentPage /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/dashboard/tickets" element={
            <ProtectedRoute><MyTicketsPage /></ProtectedRoute>
          } />
          <Route path="/dashboard/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={
            <div id="not-found-page" data-testid="not-found-page"
              className="min-h-screen flex items-center justify-center bg-gray-50 text-center">
              <div>
                <p className="text-8xl mb-4">🚆</p>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404</h1>
                <p className="text-gray-500 mb-6">Page not found. Track lost!</p>
                <a href="/" id="link-go-home" data-testid="link-go-home"
                  className="btn-primary">
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
