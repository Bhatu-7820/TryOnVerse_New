import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/helpers';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgotpassword', { email });
      setSent(true);
      toast.success('Reset link processed!');
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
          Reset your password
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#7E818C]">
          Enter your email to receive password reset instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 border border-[#EAEAEC] rounded-md shadow-sm">
          {sent ? (
            <div className="text-center space-y-3">
              <FiCheckCircle className="mx-auto text-3xl text-emerald-600" />
              <h3 className="text-sm font-bold text-[#111111]">Reset instructions sent</h3>
              <p className="text-xs text-[#7E818C]">
                If an account exists for {email}, you will receive password reset instructions.
              </p>
              <div className="pt-2">
                <Link to="/login" className="btn-primary text-xs !py-2.5 inline-block">
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#111111] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2.5 border border-[#EAEAEC] rounded text-xs text-[#111111] focus:border-[#111111] outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-xs !py-3 font-bold mt-2"
              >
                {loading ? 'Sending Instructions...' : 'Send Reset Link'}
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
          )}
        </div>
      </div>
    </div>
  );
}
