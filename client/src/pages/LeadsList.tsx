import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  Users, 
  Search, 
  Filter, 
  Trash2, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  Download, 
  MessageSquare 
} from 'lucide-react';

export const LeadsList: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/enquiries?status=${statusFilter}`);
      setLeads(res.data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/admin/enquiries/${id}/status`, { status: newStatus });
      setLeads(leads.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleSaveNotes = async (id: number) => {
    try {
      await api.patch(`/admin/enquiries/${id}/status`, { admin_notes: adminNotes });
      setLeads(leads.map((l) => (l.id === id ? { ...l, admin_notes: adminNotes } : l)));
      alert('Admin notes saved successfully!');
    } catch (err) {
      alert('Failed to save notes.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete lead entry for "${name}"?`)) return;
    try {
      await api.delete(`/admin/enquiries/${id}`);
      setLeads(leads.filter((l) => l.id !== id));
      if (selectedLead && selectedLead.id === id) setSelectedLead(null);
    } catch (err) {
      alert('Failed to delete lead.');
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Service', 'Status', 'Date', 'Page URL'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.email || ''}"`,
      `"${l.service_name || ''}"`,
      l.status,
      new Date(l.created_at).toISOString(),
      `"${l.page_url || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone.includes(searchTerm) ||
    (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.service_name && l.service_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lead & Enquiry Manager</h1>
          <p className="text-xs text-slate-500 mt-1">Manage consultation requests and form submissions across all site pages.</p>
        </div>

        <button
          onClick={exportCSV}
          disabled={leads.length === 0}
          className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-slate-200 flex items-center space-x-2 text-xs transition-all cursor-pointer disabled:opacity-50 shadow-xs"
        >
          <Download className="w-4 h-4 text-red-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center space-x-3 shadow-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client name, phone, email, or service..."
            className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center space-x-2 shadow-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">All Lead Statuses</option>
            <option value="new">🔴 New Leads</option>
            <option value="contacted">🟡 Contacted</option>
            <option value="in_progress">🔵 In Progress</option>
            <option value="converted">🟢 Converted</option>
            <option value="closed">⚪ Closed</option>
          </select>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Column */}
        <div className={`bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs ${selectedLead ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-500">Loading leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">No leads found matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 rounded-l-lg">Client Name</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Service Required</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => {
                        setSelectedLead(lead);
                        setAdminNotes(lead.admin_notes || '');
                      }}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedLead?.id === lead.id ? 'bg-red-50/60 border-l-2 border-red-600' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3 font-bold text-slate-900">{lead.name}</td>
                      <td className="py-3.5 px-3 text-red-600 font-mono text-[11px] font-bold">{lead.phone}</td>
                      <td className="py-3.5 px-3 font-medium text-slate-800">{lead.service_name || 'General Inquiry'}</td>
                      <td className="py-3.5 px-3">
                        <select
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-[10px] font-bold rounded-lg px-2 py-1 text-slate-800 outline-none"
                        >
                          <option value="new">🔴 NEW</option>
                          <option value="contacted">🟡 CONTACTED</option>
                          <option value="in_progress">🔵 IN PROGRESS</option>
                          <option value="converted">🟢 CONVERTED</option>
                          <option value="closed">⚪ CLOSED</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(lead.id, lead.name);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lead Details Sidebar Drawer */}
        {selectedLead && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 h-fit sticky top-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedLead.name}</h2>
                <p className="text-xs text-slate-400 font-medium">Lead #{selectedLead.id} Details</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-900 text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-red-600 shrink-0" />
                <a href={`tel:${selectedLead.phone}`} className="font-mono text-red-600 font-bold hover:underline">
                  {selectedLead.phone}
                </a>
              </div>

              {selectedLead.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <a href={`mailto:${selectedLead.email}`} className="text-slate-700 hover:underline">
                    {selectedLead.email}
                  </a>
                </div>
              )}

              <div className="flex items-center space-x-2 text-slate-500">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Form: {selectedLead.form_name || 'Standard Form'}</span>
              </div>

              <div className="flex items-center space-x-2 text-slate-500">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{new Date(selectedLead.created_at).toLocaleString()}</span>
              </div>
            </div>

            {selectedLead.message && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-500 block mb-1">User Message:</span>
                <p className="text-slate-800 leading-relaxed">{selectedLead.message}</p>
              </div>
            )}

            {/* Private Admin Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-red-600 flex items-center space-x-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Private Admin Notes</span>
              </label>
              <textarea
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about call discussion, quotation sent, next follow-up date..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-red-500 focus:bg-white"
              />
              <button
                onClick={() => handleSaveNotes(selectedLead.id)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-red-600/20"
              >
                Save Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
