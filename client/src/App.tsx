import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PagesList } from './pages/PagesList';
import { PageBuilder } from './pages/PageBuilder';
import { LeadsList } from './pages/LeadsList';
import { BlogsList } from './pages/BlogsList';
import { Settings } from './pages/Settings';
import { Menu } from 'lucide-react';

const ProtectedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const token = localStorage.getItem('pjaa_admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] relative">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar with Burger Button */}
        <header className="bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Toggle Sidebar Navigation"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider hidden sm:inline-block">
              CMS Admin Panel
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pages" element={<PagesList />} />
          <Route path="/pages/builder/:id" element={<PageBuilder />} />
          <Route path="/leads" element={<LeadsList />} />
          <Route path="/blogs" element={<BlogsList />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
