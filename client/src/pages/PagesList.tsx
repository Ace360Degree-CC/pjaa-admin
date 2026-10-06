import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api/client';
import { 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  FileText, 
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { isSuperAdmin } from '../utils/auth';

export const PagesList: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const superAdmin = isSuperAdmin();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/pages');
      setPages(res.data || []);
    } catch (err) {
      console.error('Error loading pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await api.put(`/admin/pages/${id}`, { status: newStatus });
      setPages(pages.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
    } catch (err) {
      alert('Failed to update page status.');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!superAdmin) {
      alert('Only Super Admin can delete pages.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the page "${title}"?`)) return;
    try {
      await api.delete(`/admin/pages/${id}`);
      setPages(pages.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete page.');
    }
  };

  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' ||
      (p.template && p.template.toUpperCase().includes(categoryFilter));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CMS Pages ({pages.length})</h1>
          <p className="text-xs text-slate-500 mt-1">Edit any existing website page or manage visibility without code.</p>
        </div>
        {superAdmin && (
          <NavLink
            to="/pages/builder/new"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-red-600/20 flex items-center space-x-2 text-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Page</span>
          </NavLink>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center space-x-3 shadow-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search across 200+ existing website pages by title or URL slug..."
            className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center space-x-2 shadow-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
          >
            <option value="ALL">All Service Categories ({pages.length})</option>
            <option value="GST">GST Services</option>
            <option value="INCOMETAX">Income Tax Services</option>
            <option value="MCA">MCA / ROC Services</option>
            <option value="TDS">TDS & TCS Services</option>
            <option value="ACCOUNTING">Accounting & Audit</option>
            <option value="BANKLOAN">Bank Loans & CMA</option>
            <option value="REGISTRATION">Business Registrations</option>
            <option value="CONSULTATION">Consultations</option>
          </select>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">Loading website pages...</div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl space-y-3">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">No pages found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Page Title</th>
                  <th className="py-3 px-4">URL Path</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{page.title}</td>
                    <td className="py-3.5 px-4 text-red-600 font-mono text-[11px] font-semibold">
                      /{page.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-slate-200">
                        {page.template || 'GENERAL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          page.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {page.status === 'published' ? 'PUBLISHED' : 'HIDDEN'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Edit Page */}
                        <NavLink
                          to={`/pages/builder/${page.id}`}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors"
                          title="Edit Page Content & Layout"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </NavLink>

                        {/* Hide / Unhide Toggle */}
                        <button
                          onClick={() => handleToggleStatus(page.id, page.status)}
                          className={`px-2.5 py-1.5 border rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors ${
                            page.status === 'published'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          }`}
                          title={page.status === 'published' ? 'Hide Page from Website' : 'Unhide / Publish Page to Website'}
                        >
                          {page.status === 'published' ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hide</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Unhide</span>
                            </>
                          )}
                        </button>

                        {/* Delete (Super Admin Only) */}
                        {superAdmin && (
                          <button
                            onClick={() => handleDelete(page.id, page.title)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Page (Super Admin Only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
