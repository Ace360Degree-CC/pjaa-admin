import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api/client';
import { FileText, PlusCircle, ArrowRight } from 'lucide-react';

import { isSuperAdmin } from '../utils/auth';

export const Dashboard: React.FC = () => {
  const [pagesCount, setPagesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const superAdmin = isSuperAdmin();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/pages').catch(() => ({ data: [] }));
      setPagesCount((res.data || []).length);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage Praveen J & Associates website pages and content.</p>
        </div>
        {superAdmin && (
          <div className="flex items-center space-x-3">
            <NavLink
              to="/pages/builder/new"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md shadow-red-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Page</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Total Pages Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Pages</span>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-extrabold text-slate-900">
              {loading ? '...' : pagesCount}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-2">Active CMS dynamic website pages</p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <NavLink
              to="/pages"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <span>View & Edit All Pages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
