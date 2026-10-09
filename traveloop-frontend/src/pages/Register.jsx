import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { getErrorMessage } from '@/utils/helpers';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const status = useSelector((state) => state.auth.status);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Full name is required';
    if (!form.email.trim()) next.email = 'Email address is required';
    if (!form.password.trim() || form.password.length < 6)
      next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return !Object.keys(next).length;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = await authService.register(form);
      dispatch(setCredentials(payload));
      toast.success('Your TryOnVerse account has been created!');
      navigate('/');
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
          Create your account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#7E818C]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#111111] underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 border border-[#EAEAEC] rounded-md shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#111111] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Alex Morgan"
                className="w-full px-3 py-2.5 border border-[#EAEAEC] rounded text-xs text-[#111111] focus:border-[#111111] outline-none"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#111111] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="alex@example.com"
                className="w-full px-3 py-2.5 border border-[#EAEAEC] rounded text-xs text-[#111111] focus:border-[#111111] outline-none"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#111111] mb-1">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2.5 border border-[#EAEAEC] rounded text-xs text-[#111111] focus:border-[#111111] outline-none"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <p className="text-[11px] text-[#7E818C] leading-normal pt-1">
              By creating an account, you agree to TryOnVerse's{' '}
              <span className="text-[#111111] font-semibold underline">Terms of Use</span> and{' '}
              <span className="text-[#111111] font-semibold underline">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full btn-primary text-xs !py-3 font-bold mt-2"
            >
              {status === 'loading' ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
