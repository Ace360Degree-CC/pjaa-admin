import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { Save, Phone } from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    site_name: 'Praveen J & Associates',
    contact_phone: '+91 98765 43210',
    whatsapp_number: '+91 98765 43210',
    contact_email: 'info@praveenj.com',
    office_address: 'Suite 402, Business Tower, MG Road, Mumbai, India',
    ga_tracking_id: 'G-XXXXXXXXXX',
    banner_announcement: '🔥 2026 Special Offer: Get 20% off on complete MCA Annual Filing Packages!',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data && Object.keys(res.data).length > 0) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      alert('Site settings updated successfully!');
    } catch (err) {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-xs text-slate-500">Loading site settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Site Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Configure global phone numbers, office contact details, and top announcement bars.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-red-600/20 flex items-center space-x-2 text-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Phone className="w-4 h-4 text-red-600" />
          <span>Contact Information</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={settings.contact_phone}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Float Number</label>
            <input
              type="text"
              value={settings.whatsapp_number}
              onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Support Email</label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Google Analytics (GA4) ID</label>
            <input
              type="text"
              value={settings.ga_tracking_id}
              onChange={(e) => setSettings({ ...settings, ga_tracking_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-red-600 font-mono font-bold outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Office Address</label>
          <input
            type="text"
            value={settings.office_address}
            onChange={(e) => setSettings({ ...settings, office_address: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Top Announcement Banner</label>
          <textarea
            rows={2}
            value={settings.banner_announcement}
            onChange={(e) => setSettings({ ...settings, banner_announcement: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:bg-white focus:border-red-500"
          />
        </div>
      </div>
    </div>
  );
};
