import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@praveenj.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('pjaa_admin_token', response.data.token);
      localStorage.setItem('pjaa_admin_user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err: any) {
      const detailMsg = err.response?.data?.details || err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(detailMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-600 mx-auto flex items-center justify-center font-extrabold text-white text-2xl shadow-lg shadow-red-600/30 mb-4">
            P
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Praveen J & Associates</h2>
          <p className="text-xs text-slate-500 mt-1">CMS & Website Admin Portal</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs flex items-center space-x-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@praveenj.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/20 flex items-center justify-center space-x-2 text-xs transition-all duration-200 cursor-pointer disabled:opacity-50 mt-6"
          >
            <span>{loading ? 'Signing in...' : 'Sign In to Admin Panel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
          <span>Secure Express + MySQL Admin Engine</span>
        </div>
      </div>
    </div>
  );
};
