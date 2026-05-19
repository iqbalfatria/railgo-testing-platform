import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div id="profile-page" data-testid="profile-page" className="max-w-2xl fade-in">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">My Profile</h1>

        <div className="card">
          <div className="flex items-center gap-5 mb-6">
            <div
              id="profile-avatar"
              data-testid="profile-avatar"
              className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold"
            >
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 id="profile-name" data-testid="profile-name" className="text-xl font-bold text-gray-900">
                {user?.full_name}
              </h2>
              <p id="profile-role" data-testid="profile-role" className="badge-info">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Full Name', value: user?.full_name, id: 'field-full-name' },
              { label: 'Email Address', value: user?.email, id: 'field-email' },
              { label: 'Phone Number', value: user?.phone_number, id: 'field-phone' },
              { label: 'Account Role', value: user?.role, id: 'field-role' },
            ].map(f => (
              <div key={f.id} className="flex justify-between py-3 border-b border-gray-50">
                <span className="text-sm text-gray-500 font-medium">{f.label}</span>
                <span id={f.id} data-testid={f.id} className="text-sm font-semibold text-gray-900">
                  {f.value || '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export const ForgotPasswordPage = () => {
  return (
    <div id="forgot-password-page" data-testid="forgot-password-page" className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="card max-w-md w-full shadow-xl text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h1 id="forgot-password-title" data-testid="forgot-password-title"
            className="text-2xl font-extrabold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-500 mb-6">This is a dummy page for QA Testing purposes.</p>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-bold text-blue-800 mb-2">🧪 Test Scenarios:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• TC-FP-001: Enter registered email → Show success message</li>
              <li>• TC-FP-002: Enter unregistered email → Show error message</li>
              <li>• TC-FP-003: Leave empty → Show validation error</li>
              <li>• TC-FP-004: Invalid email format → Show format error</li>
            </ul>
          </div>

          <div className="mb-4">
            <input type="email" id="forgot-email" name="email" data-testid="input-forgot-email"
              placeholder="Enter your email address"
              className="input-field" />
          </div>

          <button id="btn-send-reset" data-testid="btn-send-reset"
            onClick={() => alert('Reset link sent! (Dummy)')}
            className="btn-primary w-full mb-4">
            Send Reset Link
          </button>

          <Link to="/login" id="link-back-login" data-testid="link-back-login"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
