import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/helpers';
import { FiArrowLeft } from 'react-icons/fi';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await api.put(`/api/auth/resetpassword/${token}`, { password });
      toast.success('Password reset successful! Logging you in...');
      navigate('/login');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
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
          Set new password
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#7E818C]">
          Choose a secure password for your TryOnVerse account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 border border-[#EAEAEC] rounded-md shadow-sm">
          <form onSubmit={submit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#111111] mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-[#EAEAEC] rounded text-xs text-[#111111] focus:border-[#111111] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#111111] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-[#EAEAEC] rounded text-xs text-[#111111] focus:border-[#111111] outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-xs !py-3 font-bold mt-2"
            >
              {loading ? 'Updating Password...' : 'Save & Sign In'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#7E818C] hover:text-[#111111] font-semibold"
              >
                <FiArrowLeft className="text-xs" /> Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
