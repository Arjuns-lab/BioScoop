
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Film, Tv, Star, Check, X, Layers, FileVideo, MonitorPlay, Image as ImageIcon, AlertCircle, Upload, Paperclip, Loader2, Info, Search, Filter, Settings2, ShieldAlert, Save, UploadCloud, ArrowLeft, FileCode, FileType, Users, Clock, Bell } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Content, User } from '../types';
import AdminLayout from '../components/AdminLayout';

interface AdminProps {
   user: User;
   onLogout: () => void;
}

const Admin: React.FC<AdminProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<Content[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'movies' | 'series' | 'users' | 'platform_settings' | 'upload'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [videoSourceType, setVideoSourceType] = useState<'hls' | 'mp4'>('hls');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  
  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
      maintenanceMode: false,
      globalAlert: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Upload Simulation State
  // Map of fieldName -> progress percentage (0-100)
  const [activeUploads, setActiveUploads] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadFieldRef = useRef<string>('');
  
  // Form State
  const [formData, setFormData] = useState<{
     title: string;
     description: string;
     type: 'movie' | 'series';
     releaseYear: number;
     rating: number;
     duration: string;
     genres: string; // Comma separated string for input
     languages: string; // Comma separated string for input
     posterUrl: string;
     bannerUrl: string;
     videoUrl: string; // Used for HLS or primary source
     quality480p: string;
     quality720p: string;
     quality1080p: string;
     trending: boolean;
  }>({
     title: '',
     description: '',
     type: 'movie',
     releaseYear: new Date().getFullYear(),
     rating: 0,
     duration: '',
     genres: '',
     languages: '',
     posterUrl: '',
     bannerUrl: '',
     videoUrl: '',
     quality480p: '',
     quality720p: '',
     quality1080p: '',
     trending: false
  });

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [user, activeTab]);

  const loadData = async () => {
    try {
        const data = await dataService.getAllContent();
        setContents(data);
        
        // Load platform settings
        const settings = await dataService.getPlatformSettings();
        setPlatformSettings(settings);
        
        // Load users if in users tab
        if(activeTab === 'users' || activeTab === 'dashboard') {
            try {
                const usersData = await dataService.getAllUsers();
                setUsers(usersData);
            } catch (err) {
                console.warn('Unable to load users:', err);
            }
        }
    } catch (error) {
        console.error('Failed to load admin data:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Are you sure you want to delete this content?')) {
       try {
           await dataService.deleteContent(id);
           loadData();
           alert('Content deleted successfully.');
       } catch (error) {
           alert(error instanceof Error ? error.message : 'Failed to delete content');
       }
    }
  };

  const handleDeleteUser = async (id: string) => {
      if(window.confirm('Are you sure you want to delete this user?')) {
          try {
              await dataService.deleteUser(id);
              setUsers(prev => prev.filter(u => u.id !== id));
              alert('User deleted successfully.');
          } catch (error) {
              alert(error instanceof Error ? error.message : 'Failed to delete user');
          }
      }
  };

  const resetForm = () => {
      setFormData({
        title: '',
        description: '',
        type: 'movie',
        releaseYear: new Date().getFullYear(),
        rating: 0,
        duration: '',
        genres: '',
        languages: '',
        posterUrl: '',
        bannerUrl: '',
        videoUrl: '',
        quality480p: '',
        quality720p: '',
        quality1080p: '',
        trending: false
     });
     setIsFormOpen(false);
     setVideoSourceType('hls');
     setActiveUploads({});
  };

  const handleSourceTypeChange = (type: 'hls' | 'mp4') => {
      setVideoSourceType(type);
      // Clear all video fields to ensure clean state for the new type
      setFormData(prev => ({ 
          ...prev, 
          videoUrl: '',
          quality1080p: '', 
          quality720p: '', 
          quality480p: '' 
      }));
  };

  // Upload Logic
  const triggerFileUpload = (fieldName: string) => {
      activeUploadFieldRef.current = fieldName;
      if (fileInputRef.current) {
          // Reset value to allow selecting same file again
          fileInputRef.current.value = '';
          fileInputRef.current.click();
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const fieldName = activeUploadFieldRef.current;
      
      // Initialize progress for this specific field
      setActiveUploads(prev => ({ ...prev, [fieldName]: 0 }));

      // Simulate Upload with independent progress for this field
      let progress = 0;
      const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress >= 100) {
              clearInterval(interval);
              setActiveUploads(prev => ({ ...prev, [fieldName]: 100 })); // Mark complete
              
              // Mock URL generation based on field type
              let mockUrl = '';
              if (fieldName.includes('poster')) mockUrl = `https://picsum.photos/seed/${Date.now()}/300/450`;
              else if (fieldName.includes('banner')) mockUrl = `https://picsum.photos/seed/${Date.now()}/1200/600`;
              else if (fieldName === 'videoUrl' && videoSourceType === 'hls') mockUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
              else if (fieldName.includes('quality') || fieldName === 'videoUrl') mockUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

              // Cast prev to any to avoid type errors when assigning string URL to potentially number fields
              setFormData((prev: any) => ({ ...prev, [fieldName]: mockUrl }));
              
              // Clear progress after short delay
              setTimeout(() => {
                 setActiveUploads(prev => {
                     const newState = { ...prev };
                     delete newState[fieldName];
                     return newState;
                 });
              }, 2000);
          } else {
              setActiveUploads(prev => ({ ...prev, [fieldName]: progress }));
          }
      }, 300);
  };

  // Helper for rendering inputs with upload
  const renderUploadInput = (
    label: string, 
    field: keyof typeof formData & string,
    placeholder: string, 
    icon: React.ElementType,
    helperText?: string,
    badge?: string
  ) => {
    const isUploading = activeUploads[field] !== undefined;
    const progress = activeUploads[field] || 0;
    const isComplete = progress >= 100;

    return (
      <div className="space-y-2">
         <label className="block text-sm font-medium text-gray-400 flex justify-between">
            {label}
            {badge && <span className="text-[10px] bg-brand-900 text-brand-300 px-1.5 py-0.5 rounded border border-brand-800">{badge}</span>}
         </label>
         <div className="relative group">
            <div className="absolute left-3 top-3 text-gray-500">
               <Icon size={18} icon={icon} />
            </div>
            <input 
               type="text" 
               className="w-full bg-dark-950 border border-gray-700 pl-10 pr-24 py-2.5 rounded-lg text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
               placeholder={placeholder}
               value={formData[field] as string}
               onChange={(e) => setFormData({...formData, [field]: e.target.value})}
               disabled={isUploading}
            />
            
            {/* Action Buttons inside Input */}
            <div className="absolute right-2 top-1.5 flex items-center gap-1">
               {isUploading ? (
                   <div className="flex items-center gap-2 px-3 py-1 bg-dark-800 rounded text-xs font-bold text-brand-400 border border-brand-900/50">
                       {isComplete ? (
                           <> <Check size={14} /> Done </>
                       ) : (
                           <> <Loader2 size={14} className="animate-spin" /> {Math.round(progress)}% </>
                       )}
                   </div>
               ) : (
                   <button 
                      type="button"
                      onClick={() => triggerFileUpload(field)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      title="Upload File"
                   >
                      <UploadCloud size={18} />
                   </button>
               )}
            </div>
            
            {/* Progress Bar Line */}
            {isUploading && (
                <div className="absolute bottom-0 left-0 h-1 bg-brand-600 transition-all duration-300 rounded-b-lg z-10" style={{ width: `${progress}%` }}></div>
            )}
         </div>
         {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  };

  const Icon = ({ icon: I, size }: any) => <I size={size} />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const contentData: Omit<Content, 'id' | 'createdAt'> = {
            title: formData.title,
            description: formData.description,
            type: formData.type,
            releaseYear: Number(formData.releaseYear),
            rating: Number(formData.rating),
            posterUrl: formData.posterUrl,
            bannerUrl: formData.bannerUrl,
            languages: formData.languages.split(',').map(s => s.trim() as any).filter(Boolean),
            genres: formData.genres.split(',').map(s => s.trim()).filter(Boolean),
            trending: formData.trending,
            duration: formData.duration,
            videoUrl: formData.videoUrl, // Main URL (HLS master or MP4 primary)
            qualityUrls: videoSourceType === 'mp4' ? {
                '480p': formData.quality480p || undefined,
                '720p': formData.quality720p || undefined,
                '1080p': formData.quality1080p || undefined
            } : undefined
        };

        if (activeTab === 'upload') {
            await dataService.addContent(contentData);
            alert('Content added successfully!');
            resetForm();
            // Stay on upload page for next upload
        }
        loadData();
    } catch (error) {
        alert(error instanceof Error ? error.message : 'Operation failed');
    }
  };

  const handleSaveSettings = async () => {
      setIsSavingSettings(true);
      try {
          await dataService.savePlatformSettings(platformSettings);
          // Simulate minimal delay
          await new Promise(r => setTimeout(r, 500));
          alert('Settings saved successfully.');
      } catch (err) {
          alert('Failed to save settings');
      } finally {
          setIsSavingSettings(false);
      }
  };

  // Filter Logic
  const filteredContents = contents.filter(c => {
      const lowerQ = searchQuery.toLowerCase();
      const matchesSearch = c.title.toLowerCase().includes(lowerQ) || 
                            c.genres.some(g => g.toLowerCase().includes(lowerQ)) ||
                            c.type.toLowerCase().includes(lowerQ);
      
      const matchesGenre = selectedGenre === 'All' || c.genres.includes(selectedGenre);
      
      if(activeTab === 'movies') return c.type === 'movie' && matchesSearch && matchesGenre;
      if(activeTab === 'series') return c.type === 'series' && matchesSearch && matchesGenre;
      return matchesSearch && matchesGenre; // Dashboard shows all
  });

  const uniqueGenres = Array.from(new Set(contents.flatMap(c => c.genres))).sort();

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={onLogout}>
      
      <input 
         type="file" 
         ref={fileInputRef} 
         className="hidden" 
         onChange={handleFileChange}
      />

      {/* DASHBOARD / MOVIES / SERIES VIEW */}
      {(activeTab === 'dashboard' || activeTab === 'movies' || activeTab === 'series') && (
        <div className="space-y-8 animate-in fade-in duration-500">
           
           {/* Quick Stats Row (Dashboard Only) */}
           {activeTab === 'dashboard' && (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-dark-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 hover:border-brand-500/50 transition-colors">
                   <div className="p-3 bg-brand-900/50 rounded-xl text-brand-400">
                      <Film size={28} />
                   </div>
                   <div>
                      <p className="text-gray-400 text-sm font-medium">Total Movies</p>
                      <h3 className="text-3xl font-bold text-white">{contents.filter(c => c.type === 'movie').length}</h3>
                   </div>
                </div>
                <div className="bg-dark-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 hover:border-blue-500/50 transition-colors">
                   <div className="p-3 bg-blue-900/50 rounded-xl text-blue-400">
                      <Tv size={28} />
                   </div>
                   <div>
                      <p className="text-gray-400 text-sm font-medium">Web Series</p>
                      <h3 className="text-3xl font-bold text-white">{contents.filter(c => c.type === 'series').length}</h3>
                   </div>
                </div>
                <div className="bg-dark-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 hover:border-green-500/50 transition-colors">
                   <div className="p-3 bg-green-900/50 rounded-xl text-green-400">
                      <Users size={28} />
                   </div>
                   <div>
                      <p className="text-gray-400 text-sm font-medium">Total Users</p>
                      <h3 className="text-3xl font-bold text-white">{users.length}</h3>
                   </div>
                </div>
                
                {/* Upload CTA Card */}
                <button 
                  onClick={() => setActiveTab('upload')}
                  className="bg-gradient-to-br from-brand-600 to-brand-800 p-6 rounded-2xl flex flex-col justify-center items-center text-white hover:scale-[1.02] transition-transform shadow-xl shadow-brand-900/20"
                >
                    <UploadCloud size={32} className="mb-2 opacity-80" />
                    <span className="font-bold text-lg">Upload New Content</span>
                </button>
             </div>
           )}

           {/* Content Filters Toolbar */}
           <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-dark-900/50 p-4 rounded-xl border border-gray-800 backdrop-blur-sm sticky top-0 z-10">
               <div className="flex items-center gap-2 w-full md:w-auto">
                   <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
                       {activeTab === 'dashboard' ? 'Content Library' : `${activeTab} List`}
                       <span className="bg-gray-800 text-xs py-0.5 px-2 rounded-full text-gray-400">{filteredContents.length}</span>
                   </h2>
                   
                   {/* Add Movie Shortcut */}
                   {activeTab === 'movies' && (
                        <button 
                            onClick={() => {
                                setFormData(prev => ({ ...prev, type: 'movie' }));
                                setActiveTab('upload');
                            }}
                            className="ml-4 flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
                        >
                            <Plus size={14} /> Add Movie
                        </button>
                   )}
                   {/* Add Series Shortcut */}
                   {activeTab === 'series' && (
                        <button 
                            onClick={() => {
                                setFormData(prev => ({ ...prev, type: 'series' }));
                                setActiveTab('upload');
                            }}
                            className="ml-4 flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
                        >
                            <Plus size={14} /> Add Series
                        </button>
                   )}
               </div>
               
               <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                   {/* Search */}
                   <div className="relative group w-full md:w-64">
                       <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-brand-500 transition-colors" size={18} />
                       <input 
                          type="text" 
                          placeholder="Search title, genre, type..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-dark-950 border border-gray-700 pl-10 pr-4 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                       />
                   </div>
                   
                   {/* Genre Filter */}
                   <div className="relative w-full md:w-48">
                       <Filter className="absolute left-3 top-2.5 text-gray-500" size={18} />
                       <select 
                          value={selectedGenre}
                          onChange={(e) => setSelectedGenre(e.target.value)}
                          className="w-full bg-dark-950 border border-gray-700 pl-10 pr-8 py-2 rounded-lg text-sm text-white appearance-none focus:outline-none focus:border-brand-500 cursor-pointer"
                       >
                           <option value="All">All Genres</option>
                           {uniqueGenres.map(g => (
                               <option key={g} value={g}>{g}</option>
                           ))}
                       </select>
                       <div className="absolute right-3 top-3 pointer-events-none">
                           <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-gray-500"></div>
                       </div>
                   </div>
               </div>
           </div>

           {/* Data Table */}
           <div className="bg-dark-900 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-dark-950 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                      <th className="p-4 pl-6">Title</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Year</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4">Genres</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredContents.length > 0 ? filteredContents.map((content) => (
                      <tr key={content.id} className="hover:bg-dark-800/50 transition-colors group">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <img src={content.posterUrl} alt="" className="w-10 h-14 rounded object-cover shadow-sm group-hover:scale-110 transition-transform" />
                            <div>
                               <p className="font-bold text-white">{content.title}</p>
                               <p className="text-xs text-gray-500">{content.duration}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                           <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${
                              content.type === 'movie' 
                              ? 'bg-purple-900/30 text-purple-400 border-purple-800' 
                              : 'bg-blue-900/30 text-blue-400 border-blue-800'
                           }`}>
                              {content.type}
                           </span>
                        </td>
                        <td className="p-4 text-gray-300 text-sm">{content.releaseYear}</td>
                        <td className="p-4">
                           <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                              <Star size={14} fill="currentColor" /> {content.rating}
                           </div>
                        </td>
                        <td className="p-4">
                           <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {content.genres.slice(0, 2).map(g => (
                                 <span key={g} className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700">{g}</span>
                              ))}
                              {content.genres.length > 2 && <span className="text-[10px] text-gray-500">+{content.genres.length - 2}</span>}
                           </div>
                        </td>
                        <td className="p-4">
                           {content.trending ? (
                               <span className="text-xs text-green-400 flex items-center gap-1"><MonitorPlay size={12}/> Trending</span>
                           ) : (
                               <span className="text-xs text-gray-500">Standard</span>
                           )}
                        </td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 text-gray-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(content.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                       <tr>
                          <td colSpan={7} className="p-12 text-center text-gray-500">
                             <div className="flex flex-col items-center gap-2">
                                <Search size={32} className="opacity-20" />
                                <p>No matching content found.</p>
                                <button onClick={() => {setSearchQuery(''); setSelectedGenre('All');}} className="text-brand-500 text-sm hover:underline">Clear Filters</button>
                             </div>
                          </td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {/* PLATFORM SETTINGS TAB */}
      {activeTab === 'platform_settings' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gray-800 rounded-xl">
                      <Settings2 size={32} className="text-gray-400" />
                  </div>
                  <div>
                      <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
                      <p className="text-gray-400">Manage global configurations and system status</p>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Settings Form */}
                  <div className="lg:col-span-2 space-y-6">
                      
                      {/* Maintenance Mode Card */}
                      <div className={`border rounded-2xl p-6 transition-all duration-300 ${platformSettings.maintenanceMode ? 'bg-red-900/10 border-red-900/50' : 'bg-dark-900 border-gray-800'}`}>
                          <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${platformSettings.maintenanceMode ? 'bg-red-900/30 text-red-500' : 'bg-gray-800 text-gray-400'}`}>
                                      <ShieldAlert size={24} />
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-white text-lg">Maintenance Mode</h3>
                                      <p className="text-sm text-gray-400">Restrict access to admins only</p>
                                  </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                      type="checkbox" 
                                      className="sr-only peer"
                                      checked={platformSettings.maintenanceMode}
                                      onChange={(e) => setPlatformSettings({...platformSettings, maintenanceMode: e.target.checked})}
                                  />
                                  <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                              </label>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed border-t border-gray-700/50 pt-4 mt-2">
                              When enabled, all non-admin users will be redirected to a maintenance screen. 
                              Use this during major updates or database migrations.
                          </p>
                      </div>

                      {/* Global Alert Card */}
                      <div className="bg-dark-900 border border-gray-800 rounded-2xl p-6">
                          <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 bg-blue-900/20 text-blue-400 rounded-lg">
                                  <Bell size={24} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-white text-lg">Global Announcement</h3>
                                  <p className="text-sm text-gray-400">Display a banner message to all users</p>
                              </div>
                          </div>

                          <div className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">Banner Message</label>
                                  <input 
                                      type="text" 
                                      className="w-full bg-dark-950 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none transition-colors"
                                      placeholder="e.g. New server upgrades scheduled for tonight..."
                                      value={platformSettings.globalAlert}
                                      onChange={(e) => setPlatformSettings({...platformSettings, globalAlert: e.target.value})}
                                  />
                              </div>
                              
                              {/* Live Preview */}
                              {platformSettings.globalAlert && (
                                  <div className="animate-in fade-in slide-in-from-top-2">
                                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Live Preview</label>
                                      <div className="bg-gradient-to-r from-brand-600 to-blue-600 text-white py-2 px-4 text-sm font-bold flex items-center justify-center gap-2 rounded-lg shadow-lg">
                                         <Bell size={16} className="animate-pulse" />
                                         {platformSettings.globalAlert}
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="flex justify-end pt-4">
                          <button 
                              onClick={handleSaveSettings}
                              disabled={isSavingSettings}
                              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-wait text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-900/20"
                          >
                              {isSavingSettings ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                              {isSavingSettings ? 'Saving Changes...' : 'Save Configuration'}
                          </button>
                      </div>
                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-6">
                      <div className="bg-dark-900 border border-gray-800 rounded-2xl p-6">
                          <h4 className="font-bold text-white mb-4">System Status</h4>
                          <div className="space-y-4">
                              <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">Database Connection</span>
                                  <span className="text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Active</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">Auth Service</span>
                                  <span className="text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">Storage</span>
                                  <span className="text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Healthy</span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="bg-blue-900/10 border border-blue-900/30 rounded-2xl p-6">
                           <div className="flex items-start gap-3">
                              <Info className="text-blue-400 shrink-0" size={20} />
                              <p className="text-sm text-blue-200 leading-relaxed">
                                  Changes to these settings take effect immediately for all active users. Please use caution when enabling maintenance mode.
                              </p>
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </AdminLayout>
  );
};

export default Admin;
