import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  UserCircle,
  LogOut, 
  PlusCircle,
  Menu,
  X
} from 'lucide-react';

import { getCurrentUser, isSuperAdmin } from '../utils/auth';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose, onToggle }) => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const superAdmin = isSuperAdmin();

  const handleLogout = () => {
    localStorage.removeItem('pjaa_admin_token');
    localStorage.removeItem('pjaa_admin_user');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Pages & CMS', path: '/pages', icon: FileText },
    { label: 'My Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-screen shadow-sm transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 md:ml-0' : '-translate-x-full md:-ml-64'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-red-600/20">
                P
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-sm tracking-tight">Praveen J & Assoc.</h1>
                <p className="text-xs text-red-600 font-semibold">CMS Admin Panel</p>
              </div>
            </div>
            {/* Burger toggle button inside sidebar header */}
            <button
              onClick={onToggle || onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <X className="w-5 h-5 md:hidden" />
              <Menu className="w-5 h-5 hidden md:block" />
            </button>
          </div>

          {/* Quick Action Button (Super Admin Only) */}
          {superAdmin && (
            <div className="p-4">
              <NavLink
                to="/pages/builder/new"
                onClick={() => onClose?.()}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center space-x-2 text-xs transition-all duration-200 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Page</span>
              </NavLink>
            </div>
          )}

          {/* Navigation List */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <NavLink
              to="/profile"
              onClick={() => onClose?.()}
              className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center font-bold text-xs text-red-600 group-hover:bg-red-100">
                {superAdmin ? 'SA' : 'AD'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase">{user?.role || 'Admin'}</p>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
