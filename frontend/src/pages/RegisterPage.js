import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import Navbar from '../components/layout/Navbar';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone_number: '', password: '', confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Full name is required';
    if (!formData.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.phone_number) errs.phone_number = 'Phone number is required';
    else if (!/^[0-9]+$/.test(formData.phone_number)) errs.phone_number = 'Phone number must contain numbers only';
    else if (formData.phone_number.length < 10) errs.phone_number = 'Phone number must be at least 10 digits';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!formData.confirm_password) errs.confirm_password = 'Please confirm your password';
    else if (formData.password !== formData.confirm_password) errs.confirm_password = 'Passwords do not match';
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
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await authAPI.register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      const apiErrors = err.response?.data?.errors || {};
      const msg = err.response?.data?.message || 'Registration failed.';
      setErrors(apiErrors);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: 'full-name', name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Doe', testId: 'input-full-name' },
    { id: 'email-register', name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', testId: 'input-email' },
    { id: 'phone-number', name: 'phone_number', label: 'Phone Number', type: 'tel', placeholder: '081234567890', testId: 'input-phone' },
  ];

  return (
    <div id="register-page" data-testid="register-page" className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card shadow-xl">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🚆</div>
              <h1 id="register-title" data-testid="register-title" className="text-2xl font-extrabold text-gray-900">
                Create Account
              </h1>
              <p className="text-gray-500 mt-1">Join RailGo Testing Platform</p>
            </div>

            <form id="form-register" data-testid="form-register" onSubmit={handleSubmit} noValidate>
              {fields.map((f) => (
                <div key={f.name} className="mb-4">
                  <label htmlFor={f.id} className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    id={f.id}
                    name={f.name}
                    data-testid={f.testId}
                    placeholder={f.placeholder}
                    value={formData[f.name]}
                    onChange={handleChange}
                    className={`input-field ${errors[f.name] ? 'input-error' : ''}`}
                    aria-invalid={!!errors[f.name]}
                  />
                  {errors[f.name] && (
                    <p data-testid={`error-${f.name}`} className="mt-1.5 text-sm text-red-500" role="alert">
                      {errors[f.name]}
                    </p>
                  )}
                </div>
              ))}

              {/* Password */}
              <div className="mb-4">
                <label htmlFor="password-register" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password-register"
                    name="password"
                    data-testid="input-password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field pr-12 ${errors.password ? 'input-error' : ''}`}
                  />
                  <button type="button" id="btn-toggle-password" data-testid="btn-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && (
                  <p data-testid="error-password" className="mt-1.5 text-sm text-red-500" role="alert">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    id="confirm-password"
                    name="confirm_password"
                    data-testid="input-confirm-password"
                    placeholder="Re-enter your password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`input-field pr-12 ${errors.confirm_password ? 'input-error' : ''}`}
                  />
                  <button type="button" id="btn-toggle-confirm" data-testid="btn-toggle-confirm"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p data-testid="error-confirm-password" className="mt-1.5 text-sm text-red-500" role="alert">{errors.confirm_password}</p>
                )}
              </div>

              <button
                type="submit"
                id="btn-register"
                data-testid="btn-register"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span data-testid="btn-register-loading">Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" id="link-login" data-testid="link-login"
                className="text-blue-600 hover:text-blue-700 font-semibold">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
