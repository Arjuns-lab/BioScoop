
import React, { useState, useEffect } from 'react';
import { User as UserType, Download } from '../types';
import { User, Download as DownloadIcon, Palette, Settings as SettingsIcon, Shield, Trash2, Check, LayoutDashboard, ChevronRight, HardDrive, FolderOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { dataService } from '../services/dataService';

interface SettingsProps {
  user: UserType | null;
  logout: () => void;
}

const SettingsPage: React.FC<SettingsProps> = ({ user, logout }) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'downloads' | 'appearance'>('profile');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [storageUsage, setStorageUsage] = useState({ usedGB: '0.0', totalGB: 64, percent: 0 });
  const [preferExternalStorage, setPreferExternalStorage] = useState(false);
  const navigate = useNavigate();

  // Load Downloads & Storage on mount
  useEffect(() => {
    refreshDownloads();
    const savedPref = localStorage.getItem('bioscoop_external_storage_pref');
    if (savedPref) setPreferExternalStorage(JSON.parse(savedPref));
  }, []);

  const refreshDownloads = () => {
      setDownloads(dataService.getDownloads());
      setStorageUsage(dataService.getStorageUsage());
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await dataService.updateUserProfile(displayName);
    setIsSavingProfile(false);
  };

  const handleDeleteDownload = (id: string) => {
    if(window.confirm('Remove this download?')) {
        dataService.removeDownload(id);
        refreshDownloads();
    }
  };

  const handleClearAllDownloads = () => {
    if(window.confirm('Are you sure you want to delete ALL downloads? This will free up storage.')) {
        dataService.removeAllDownloads();
        refreshDownloads();
    }
  };

  const toggleExternalStorage = () => {
      const newVal = !preferExternalStorage;
      setPreferExternalStorage(newVal);
      localStorage.setItem('bioscoop_external_storage_pref', JSON.stringify(newVal));
  };

  const themes = [
    { name: 'Neon Purple', color: '#7652d6', var: { '500': '#7652d6', '600': '#5b3ea8', '400': '#926be6', '300': '#af84f5' } },
    { name: 'Ocean Blue', color: '#3b82f6', var: { '500': '#3b82f6', '600': '#2563eb', '400': '#60a5fa', '300': '#93c5fd' } },
    { name: 'Netflix Red', color: '#e50914', var: { '500': '#e50914', '600': '#b9090b', '400': '#ff1f1f', '300': '#ff4d4d' } },
    { name: 'Emerald Green', color: '#10b981', var: { '500': '#10b981', '600': '#059669', '400': '#34d399', '300': '#6ee7b7' } },
  ];

  const handleThemeChange = (theme: typeof themes[0]) => {
      const root = document.documentElement;
      root.style.setProperty('--brand-500', theme.var['500']);
      root.style.setProperty('--brand-600', theme.var['600']);
      root.style.setProperty('--brand-400', theme.var['400']);
      root.style.setProperty('--brand-300', theme.var['300']);
      localStorage.setItem('bioscoop_theme', JSON.stringify(theme));
  };

  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
        activeSection === id 
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40' 
          : 'text-gray-400 hover:bg-dark-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  if (!user) {
      navigate('/login');
      return null;
  }

  return (
    <div className="min-h-screen bg-dark-950">
       <Navbar user={user} onLogout={logout} />
       
       <div className="max-w-6xl mx-auto px-4 pt-28 pb-12">
          <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
          
          <div className="flex flex-col md:flex-row gap-8">
             {/* Sidebar */}
             <div className="w-full md:w-64 space-y-2">
                <NavItem id="profile" icon={User} label="Profile" />
                <NavItem id="downloads" icon={DownloadIcon} label="Downloads" />
                <NavItem id="appearance" icon={Palette} label="Appearance" />
                
                {user.isAdmin && (
                   <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-brand-400 hover:bg-dark-800 transition-all">
                      <LayoutDashboard size={20} />
                      Admin Panel
                   </Link>
                )}
             </div>

             {/* Content Area */}
             <div className="flex-1 bg-dark-900 rounded-2xl border border-gray-800 p-6 md:p-8 min-h-[500px]">
                
                {/* PROFILE SECTION */}
                {activeSection === 'profile' && (
                   <div className="animate-in fade-in slide-in-from-right-4">
                      <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Profile Details</h2>
                      
                      <div className="flex items-center gap-6 mb-8">
                         <div className="w-24 h-24 rounded-full bg-brand-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-dark-900 shadow-xl">
                            {user.name[0].toUpperCase()}
                         </div>
                         <div>
                            <div className="text-white font-bold text-lg">{user.name}</div>
                            <div className="text-gray-400 text-sm">{user.email || user.phoneNumber}</div>
                            <div className="mt-2 text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded inline-block">
                               Member since {new Date().getFullYear()}
                            </div>
                         </div>
                      </div>

                      <form onSubmit={handleUpdateProfile} className="max-w-md space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                            <input 
                               type="text" 
                               value={displayName}
                               onChange={(e) => setDisplayName(e.target.value)}
                               className="w-full bg-dark-950 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none"
                            />
                         </div>
                         <button 
                            type="submit" 
                            disabled={isSavingProfile}
                            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2"
                         >
                            {isSavingProfile ? <span className="animate-spin">⌛</span> : <Check size={18} />}
                            Save Changes
                         </button>
                      </form>
                   </div>
                )}

                {/* DOWNLOADS SECTION */}
                {activeSection === 'downloads' && (
                   <div className="animate-in fade-in slide-in-from-right-4">
                      <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4 flex justify-between items-center">
                          <span>Downloads Library</span>
                          <span className="text-xs font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded">Local Memory</span>
                      </h2>

                      {/* Download Preferences */}
                      <div className="mb-8 space-y-4">
                         <div className="flex items-center justify-between py-3 border-b border-gray-800">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-800 rounded-lg">
                                    <FolderOpen size={20} className="text-brand-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">Download Location</p>
                                    <p className="text-xs text-gray-500 font-mono">
                                       {preferExternalStorage ? 'External Storage / SD Card (Prompt)' : 'Device Default / Downloads'}
                                    </p>
                                </div>
                             </div>
                             <button 
                                onClick={toggleExternalStorage} 
                                className="text-brand-400 hover:text-white text-xs font-bold transition-colors"
                             >
                                {preferExternalStorage ? 'Use Internal' : 'Use External'}
                             </button>
                         </div>
                      </div>

                      {/* Storage Usage Visual */}
                      <div className="bg-dark-950 rounded-xl p-5 mb-8 border border-gray-800">
                          <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-gray-300 font-medium">
                                  <HardDrive size={20} className="text-brand-400" />
                                  <span>Device Storage</span>
                              </div>
                              <span className="text-sm text-gray-400">
                                  <span className="text-white font-bold">{storageUsage.usedGB} GB</span> used of {storageUsage.totalGB} GB
                              </span>
                          </div>
                          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                              <div 
                                  className="h-full bg-gradient-to-r from-brand-600 to-blue-500 transition-all duration-1000 ease-out"
                                  style={{ width: `${storageUsage.percent}%` }}
                              />
                          </div>
                          <div className="flex justify-end mt-4">
                             <button 
                                onClick={handleClearAllDownloads}
                                disabled={downloads.length === 0}
                                className="text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                             >
                                Clear All Storage
                             </button>
                          </div>
                      </div>

                      {downloads.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                            <DownloadIcon size={48} className="mb-4 opacity-20" />
                            <p className="text-lg">No downloads yet</p>
                            <Link to="/" className="text-brand-500 hover:underline mt-2">Browse content to download</Link>
                         </div>
                      ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {downloads.map(item => (
                               <div key={`${item.contentId}-${item.quality}`} className="bg-dark-950 rounded-xl overflow-hidden border border-gray-800 group hover:border-gray-700 transition-colors">
                                  <div className="relative aspect-video">
                                     <img src={item.posterUrl} className="w-full h-full object-cover" alt={item.title} />
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Link to={`/watch/${item.contentId}`} className="bg-white text-black p-2 rounded-full hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                         </Link>
                                     </div>
                                     <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded border border-white/20">{item.quality}</span>
                                  </div>
                                  <div className="p-3">
                                     <h4 className="font-bold text-white truncate">{item.title}</h4>
                                     <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-gray-500">{item.size} • {new Date(item.downloadedAt).toLocaleDateString()}</span>
                                        <button 
                                          onClick={() => handleDeleteDownload(item.contentId)}
                                          className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-gray-800 transition-colors"
                                          title="Remove Download"
                                        >
                                           <Trash2 size={16} />
                                        </button>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      )}
                   </div>
                )}

                {/* APPEARANCE SECTION */}
                {activeSection === 'appearance' && (
                   <div className="animate-in fade-in slide-in-from-right-4">
                      <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4">App Appearance</h2>
                      
                      <div className="mb-8">
                         <h3 className="text-sm font-medium text-gray-300 mb-4">Accent Theme</h3>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {themes.map(theme => (
                               <button
                                  key={theme.name}
                                  onClick={() => handleThemeChange(theme)}
                                  className="group relative h-24 rounded-xl border border-gray-700 overflow-hidden hover:border-white transition-all"
                                  style={{ background: `linear-gradient(135deg, ${theme.color}20, transparent)` }}
                               >
                                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                     <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: theme.color }}></div>
                                     <span className="text-sm font-medium text-gray-300 group-hover:text-white">{theme.name}</span>
                                  </div>
                               </button>
                            ))}
                         </div>
                         <p className="text-xs text-gray-500 mt-4 flex items-center gap-2">
                            <Shield size={12} />
                            Theme preference is saved locally.
                         </p>
                      </div>
                   </div>
                )}

             </div>
          </div>
       </div>
    </div>
  );
};

export default SettingsPage;
