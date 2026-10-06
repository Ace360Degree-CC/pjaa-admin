import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PagesList } from './pages/PagesList';
import { PageBuilder } from './pages/PageBuilder';
import { LeadsList } from './pages/LeadsList';
import { BlogsList } from './pages/BlogsList';
import { Settings } from './pages/Settings';

const ProtectedLayout = () => {
  const token = localStorage.getItem('pjaa_admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
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
