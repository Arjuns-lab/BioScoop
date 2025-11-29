
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Film, Tv, ArrowLeft, Menu, X, LogOut, User as UserIcon, Bell, Users, Settings as SettingsIcon, UploadCloud } from 'lucide-react';
import { User } from '../types';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'movies' | 'series' | 'users' | 'platform_settings' | 'upload';
  setActiveTab: (tab: 'dashboard' | 'movies' | 'series' | 'users' | 'platform_settings' | 'upload') => void;
  user: User;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart },
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'series', label: 'Web Series', icon: Tv },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'platform_settings', label: 'Platform Settings', icon: SettingsIcon },
  ];

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white font-sans flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-dark-900 border-r border-gray-800 z-40
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-blue-500 tracking-tighter">
                    BioScoop
                </h1>
                <span className="text-xs font-bold text-gray-500 tracking-[0.2em] ml-0.5">ADMIN PANEL</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                <X size={24} />
            </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group font-medium ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40 translate-x-1' 
                    : 'text-gray-400 hover:bg-dark-800 hover:text-white hover:translate-x-1'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
           <Link 
              to="/" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-800 hover:text-white transition-colors"
           >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to App</span>
           </Link>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-dark-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
              >
                 <Menu size={24} />
              </button>
              <h2 className="text-lg font-semibold text-gray-200 hidden md:block capitalize">
                 {activeTab.replace('_', ' ')} Overview
              </h2>
           </div>

           <div className="flex items-center gap-4 md:gap-6">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-dark-900"></span>
              </button>
              
              <div className="h-8 w-px bg-gray-700 mx-1 hidden md:block"></div>

              <div className="flex items-center gap-3">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                    <p className="text-xs text-brand-400 leading-none mt-1">Super Admin</p>
                 </div>
                 <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold border border-white/10 shadow-inner">
                    {user.name[0].toUpperCase()}
                 </div>
                 <button 
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                    title="Sign Out"
                 >
                    <LogOut size={20} />
                 </button>
              </div>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
           <div className="max-w-7xl mx-auto">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
