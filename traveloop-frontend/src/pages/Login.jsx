import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { getErrorMessage } from '@/utils/helpers';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';
import { FiUser, FiShield, FiLock, FiMail, FiArrowRight } from 'react-icons/fi';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const status = useSelector((state) => state.auth.status);

  const [role, setRole] = useState('user'); // 'user' or 'admin'
  const [form, setForm] = useState({
    email: 'alex@tryonverse.com',
    password: 'UserPassword123!',
  });
  const [errors, setErrors] = useState({});

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setForm(
      newRole === 'admin'
        ? { email: 'admin@tryonverse.com', password: 'AdminPassword123!' }
        : { email: 'alex@tryonverse.com', password: 'UserPassword123!' }
    );
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required';
    if (!form.password.trim()) next.password = 'Password is required';
    setErrors(next);
    return !Object.keys(next).length;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = await authService.login(form);
      dispatch(setCredentials(payload));
      toast.success(`Welcome back, ${payload.user.name}!`);

      if (payload.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(location.state?.from?.pathname || '/');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const payload = await authService.firebaseLogin(idToken);
      dispatch(setCredentials(payload));
      toast.success(`Welcome back, ${payload.user.name}!`);
      navigate(location.state?.from?.pathname || '/');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#111111]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block">
          <span className="font-extrabold text-2xl tracking-[0.2em] text-[#111111]">
            TRYONVERSE
          </span>
        </Link>
        <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#7E818C]">
          Or{' '}
          <Link to="/register" className="font-semibold text-[#111111] underline underline-offset-2">
            create a new TryOnVerse account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 border border-[#EAEAEC] rounded-md shadow-sm">
          {/* Role Toggle Selector */}
          <div className="flex border-b border-[#EAEAEC] mb-6">
            <button
              type="button"
              onClick={() => handleRoleChange('user')}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition ${
                role === 'user'
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#7E818C] hover:text-[#111111]'
              }`}
            >
              Customer Sign In
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition ${
                role === 'admin'
                  ? 'border-[#111111] text-[#111111]'
                  : 'border-transparent text-[#7E818C] hover:text-[#111111]'
              }`}
            >
              Merchant / Admin
            </button>
          </div>

          {/* Quick Demo Pre-load Badge */}
          <div className="mb-5 p-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-[11px] text-[#6B7280] flex items-center justify-between">
            <span>Demo credentials pre-loaded ({role})</span>
            <span className="font-semibold text-[#111111]">Instant Access</span>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#111111] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#EAEAEC] rounded text-xs text-[#111111] focus:border-[#111111] outline-none"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#7E818C] hover:text-[#111111] underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-3 py-2.5 border border-[#EAEAEC] rounded text-xs text-[#111111] focus:border-[#111111] outline-none"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full btn-primary text-xs !py-3 font-bold mt-2"
            >
              {status === 'loading' ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {role === 'user' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#EAEAEC]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold">
                  <span className="bg-white px-3 text-[#7E818C]">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mt-4 w-full flex items-center justify-center gap-2 border border-[#EAEAEC] py-2.5 px-4 rounded text-xs font-semibold text-[#111111] hover:bg-[#F9FAFB] transition"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
