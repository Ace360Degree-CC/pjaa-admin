import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { User, Mail, Lock, Save, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';

export const Profile: React.FC = () => {
  const currentUser = getCurrentUser();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Fetch fresh details on load
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data) {
        setName(res.data.name || '');
        setEmail(res.data.email || '');
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim() || !email.trim()) {
      setMessage({ type: 'error', text: 'Name and Email are required.' });
      return;
    }

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (password && password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    try {
      const payload: { name: string; email: string; password?: string } = {
        name,
        email,
      };
      if (password) {
        payload.password = password;
      }

      const res = await api.put('/auth/profile', payload);

      if (res.data?.token) {
        localStorage.setItem('pjaa_admin_token', res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem('pjaa_admin_user', JSON.stringify(res.data.user));
      }

      setPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your account name, login email address, and security password.</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Form Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Role badge banner */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
              {currentUser?.role === 'superadmin' ? 'SA' : 'AD'}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">{name || 'Admin User'}</h3>
              <p className="text-[11px] text-slate-500">{email}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-[10px] uppercase rounded-full tracking-wider flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>{currentUser?.role || 'Admin'}</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <hr className="border-slate-100 my-4" />

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password (Optional)</label>
            <p className="text-[11px] text-slate-400 mb-1.5">Leave blank if you do not wish to change your password.</p>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-red-600/20 flex items-center space-x-2 text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
