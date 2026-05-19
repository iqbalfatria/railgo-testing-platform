import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Please enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(formData);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}! 👋`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      const apiErrors = err.response?.data?.errors || {};
      setErrors(apiErrors);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-page" data-testid="login-page" className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="w-full max-w-md">
          {/* Session expired alert */}
          {location.search.includes('expired=true') && (
            <div
              id="alert-session-expired"
              data-testid="alert-session-expired"
              className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm font-medium"
              role="alert"
            >
              ⚠️ Your session has expired. Please login again.
            </div>
          )}

          <div className="card shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🚆</div>
              <h1
                id="login-title"
                data-testid="login-title"
                className="text-2xl font-extrabold text-gray-900"
              >
                Welcome Back
              </h1>
              <p className="text-gray-500 mt-1">Login to your RailGo account</p>
            </div>

            <form
              id="form-login"
              data-testid="form-login"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Email Field */}
              <div className="mb-4">
                <label
                  htmlFor="email-login"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email-login"
                  name="email"
                  data-testid="input-email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? 'input-error' : ''}`}
                  autoComplete="email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    data-testid="error-email"
                    className="mt-1.5 text-sm text-red-500"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label
                  htmlFor="password-login"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password-login"
                    name="password"
                    data-testid="input-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field pr-12 ${errors.password ? 'input-error' : ''}`}
                    autoComplete="current-password"
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    id="btn-toggle-password"
                    data-testid="btn-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    data-testid="error-password"
                    className="mt-1.5 text-sm text-red-500"
                    role="alert"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="checkbox-remember-me"
                    name="remember_me"
                    data-testid="checkbox-remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  id="link-forgot-password"
                  data-testid="link-forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-login"
                data-testid="btn-login"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
                aria-live="polite"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span id="btn-login-loading-text" data-testid="btn-login-loading">Logging in...</span>
                  </>
                ) : (
                  <span id="btn-login-text">Login</span>
                )}
              </button>
            </form>

            {/* Register link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link
                to="/register"
                id="link-register"
                data-testid="link-register"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Register here
              </Link>
            </p>

            {/* Test credentials hint */}
            <div
              id="test-credentials-hint"
              data-testid="test-credentials-hint"
              className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100"
            >
              <p className="text-xs font-semibold text-blue-700 mb-1">🧪 QA Test Credentials:</p>
              <p className="text-xs text-blue-600">Email: <code className="font-mono">test@railgo.com</code></p>
              <p className="text-xs text-blue-600">Password: <code className="font-mono">RailGo123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
