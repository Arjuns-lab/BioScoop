
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Film, Tv, Star, Check, X, Layers, FileVideo, MonitorPlay, Image as ImageIcon, AlertCircle, Upload, Paperclip, Loader2, Info, Search, Filter, Settings2, ShieldAlert, Save, UploadCloud, ArrowLeft, FileCode, FileType, Users, Clock } from 'lucide-react';
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
      try {
          await dataService.savePlatformSettings(platformSettings);
          alert('Settings saved successfully.');
      } catch (err) {
          alert('Failed to save settings');
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

      {/* UPLOAD TAB */}
      {activeTab === 'upload' && (
         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h1 className="text-3xl font-bold text-white">
                      {formData.type === 'movie' ? 'Upload New Movie' : 'Create New Series'}
                  </h1>
                  <p className="text-gray-400 mt-1">Add details and media files to your library</p>
               </div>
               <div className="bg-dark-900 p-1 rounded-xl flex border border-gray-800">
                  <button 
                     onClick={() => setFormData({...formData, type: 'movie'})}
                     className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${formData.type === 'movie' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                     <Film size={18} /> Movie
                  </button>
                  <button 
                     onClick={() => setFormData({...formData, type: 'series'})}
                     className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${formData.type === 'series' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                     <Tv size={18} /> Series
                  </button>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
               {/* 1. Basic Information */}
               <section className="bg-dark-900 border border-gray-800 rounded-2xl p-6 md:p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                     <span className="w-8 h-8 rounded-full bg-brand-900/50 flex items-center justify-center text-brand-400 border border-brand-500/20">1</span>
                     Basic Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Title</label>
                        <input 
                           type="text" 
                           required
                           className="w-full bg-dark-950 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                           placeholder={formData.type === 'movie' ? "e.g. Kalki 2898 AD" : "e.g. The Family Man"}
                           value={formData.title}
                           onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="block text-sm font-medium text-gray-400">Release Year</label>
                           <input 
                              type="number" 
                              required
                              className="w-full bg-dark-950 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none"
                              value={formData.releaseYear}
                              onChange={e => setFormData({...formData, releaseYear: parseInt(e.target.value)})}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="block text-sm font-medium text-gray-400">IMDb Rating</label>
                           <div className="relative">
                              <Star className="absolute left-3 top-3 text-yellow-500" size={16} />
                              <input 
                                 type="number" 
                                 step="0.1"
                                 max="10"
                                 required
                                 className="w-full bg-dark-950 border border-gray-700 rounded-lg pl-10 pr-3 py-3 text-white focus:border-brand-500 focus:outline-none"
                                 value={formData.rating}
                                 onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})}
                              />
                           </div>
                        </div>
                     </div>
                     <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Description</label>
                        <textarea 
                           required
                           rows={3}
                           className="w-full bg-dark-950 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none"
                           placeholder="Plot summary..."
                           value={formData.description}
                           onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Genres (comma separated)</label>
                        <input 
                           type="text" 
                           className="w-full bg-dark-950 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none"
                           placeholder="Action, Sci-Fi, Thriller"
                           value={formData.genres}
                           onChange={e => setFormData({...formData, genres: e.target.value})}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Languages</label>
                        <input 
                           type="text" 
                           className="w-full bg-dark-950 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none"
                           placeholder="Telugu, Hindi, Tamil"
                           value={formData.languages}
                           onChange={e => setFormData({...formData, languages: e.target.value})}
                        />
                     </div>
                  </div>
               </section>

               {/* 2. Media Assets */}
               <section className="bg-dark-900 border border-gray-800 rounded-2xl p-6 md:p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                     <span className="w-8 h-8 rounded-full bg-brand-900/50 flex items-center justify-center text-brand-400 border border-brand-500/20">2</span>
                     Visual Assets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {renderUploadInput('Poster Image URL', 'posterUrl', 'https://...', ImageIcon, 'Vertical aspect ratio (2:3) recommended', 'JPG/PNG')}
                      {renderUploadInput('Banner Image URL', 'bannerUrl', 'https://...', ImageIcon, 'Horizontal aspect ratio (16:9) recommended', 'JPG/PNG')}
                  </div>
               </section>

               {/* 3. Video Configuration */}
               <section className="bg-dark-900 border border-gray-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                     <Settings2 size={120} />
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-brand-900/50 flex items-center justify-center text-brand-400 border border-brand-500/20">3</span>
                        Video Source
                     </h3>

                     {/* Source Type Toggle */}
                     <div className="flex bg-dark-950 p-1 rounded-lg border border-gray-700">
                        <button
                           type="button"
                           onClick={() => handleSourceTypeChange('hls')}
                           className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${videoSourceType === 'hls' ? 'bg-brand-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                           <FileCode size={16} /> Adaptive (HLS)
                        </button>
                        <button
                           type="button"
                           onClick={() => handleSourceTypeChange('mp4')}
                           className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${videoSourceType === 'mp4' ? 'bg-brand-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                           <FileVideo size={16} /> Direct (MP4)
                        </button>
                     </div>
                  </div>

                  {formData.type === 'series' ? (
                     <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 flex items-start gap-3">
                        <Info className="text-blue-400 mt-0.5 flex-shrink-0" size={20} />
                        <div>
                           <h4 className="font-bold text-blue-400 text-sm">Series Content</h4>
                           <p className="text-xs text-blue-300 mt-1">
                              You are creating a Series container. Episodes are added individually after creating the series. 
                              Video URLs added here will be ignored.
                           </p>
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-6">
                        {/* HLS Workflow */}
                        {videoSourceType === 'hls' && (
                           <div className="animate-in fade-in slide-in-from-left-2">
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                  <div className="md:col-span-8 lg:col-span-9">
                                      {renderUploadInput(
                                          'Master Playlist URL', 
                                          'videoUrl', 
                                          'https://.../master.m3u8', 
                                          FileCode, 
                                          'Provide the .m3u8 master playlist for adaptive streaming.',
                                          'M3U8'
                                      )}
                                  </div>
                                  <div className="md:col-span-4 lg:col-span-3">
                                      <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                                         <Clock size={14} /> Duration
                                      </label>
                                       <input 
                                          type="text" 
                                          className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                                          placeholder="e.g. 2h 45m"
                                          value={formData.duration}
                                          onChange={e => setFormData({...formData, duration: e.target.value})}
                                       />
                                       <p className="text-xs text-transparent select-none mt-2">spacer</p>
                                  </div>
                              </div>
                              <div className="mt-4 bg-brand-900/20 p-3 rounded-lg border border-brand-900/50 flex gap-2 items-center">
                                 <Info size={16} className="text-brand-400" />
                                 <p className="text-xs text-brand-300">HLS allows the player to automatically adjust quality based on user internet speed.</p>
                              </div>
                           </div>
                        )}

                        {/* MP4 Workflow */}
                        {videoSourceType === 'mp4' && (
                           <div className="animate-in fade-in slide-in-from-right-2 space-y-6">
                              
                              {/* Primary Video & Duration */}
                              <div className="bg-dark-950/50 p-5 rounded-xl border border-gray-800">
                                 <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                     <div className="md:col-span-8 lg:col-span-9">
                                        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                            <Star size={14} className="text-yellow-500" /> Primary Source (Required)
                                        </h4>
                                        {renderUploadInput(
                                            'Primary Video URL (.mp4)', 
                                            'videoUrl', 
                                            'https://.../movie.mp4', 
                                            FileVideo, 
                                            'This file will be used as the default playback source.',
                                            'MP4'
                                        )}
                                     </div>
                                     <div className="md:col-span-4 lg:col-span-3">
                                         <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                                             <Clock size={14} /> Duration
                                         </h4>
                                         <div className="mt-1">
                                             <label className="block text-sm font-medium text-gray-400 mb-2 sr-only">Duration</label>
                                             <input 
                                                type="text" 
                                                className="w-full bg-dark-950 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:border-brand-500 focus:outline-none"
                                                placeholder="e.g. 2h 45m"
                                                value={formData.duration}
                                                onChange={e => setFormData({...formData, duration: e.target.value})}
                                             />
                                             <p className="text-xs text-gray-500 mt-2">Format: 2h 30m</p>
                                         </div>
                                     </div>
                                 </div>
                              </div>

                              {/* Quality Variants */}
                              <div className="border border-dashed border-gray-700 p-6 rounded-xl bg-dark-900/30">
                                 <div className="flex items-center justify-between mb-6">
                                     <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                         <Layers size={14} /> Quality Variants (Optional)
                                     </h4>
                                     <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-1 rounded border border-gray-700">MP4 Only</span>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     {renderUploadInput('1080p (Full HD) (Optional)', 'quality1080p', '...1080p.mp4', FileVideo, 'Optional', 'MP4')}
                                     {renderUploadInput('720p (HD) (Optional)', 'quality720p', '...720p.mp4', FileVideo, 'Optional', 'MP4')}
                                     {renderUploadInput('480p (Standard) (Optional)', 'quality480p', '...480p.mp4', FileVideo, 'Optional', 'MP4')}
                                 </div>
                                 <p className="text-xs text-gray-500 mt-4 text-center">
                                     Adding variants allows users to manually switch quality or download specific sizes.
                                 </p>
                              </div>
                           </div>
                        )}
                     </div>
                  )}
               </section>

               {/* Action Buttons */}
               <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                      <input 
                         type="checkbox" 
                         id="trending" 
                         className="w-5 h-5 rounded border-gray-700 bg-dark-950 text-brand-600 focus:ring-brand-500"
                         checked={formData.trending}
                         onChange={e => setFormData({...formData, trending: e.target.checked})}
                      />
                      <label htmlFor="trending" className="text-white font-medium">Mark as Trending</label>
                  </div>
                  <div className="flex-1"></div>
                  <button 
                     type="button" 
                     onClick={resetForm}
                     className="px-6 py-3 text-gray-400 font-bold hover:text-white transition-colors"
                  >
                     Clear
                  </button>
                  <button 
                     type="submit" 
                     className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-brand-900/50 transition-transform active:scale-95 flex items-center gap-2"
                  >
                     <Save size={20} /> Publish Content
                  </button>
               </div>
            </form>
         </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-white">User Management</h1>
                  <span className="text-sm text-gray-400">Total: {users.length}</span>
              </div>
              
              <div className="bg-dark-900 rounded-2xl border border-gray-800 overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-dark-950 text-gray-400 text-xs uppercase tracking-wider">
                          <tr>
                              <th className="p-4">User</th>
                              <th className="p-4">Contact</th>
                              <th className="p-4">Role</th>
                              <th className="p-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                          {users.map(u => (
                              <tr key={u.id} className="hover:bg-dark-800/50">
                                  <td className="p-4 font-medium text-white flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                                          {u.name[0]}
                                      </div>
                                      {u.name}
                                  </td>
                                  <td className="p-4 text-gray-400 text-sm">
                                      {u.email || u.phoneNumber}
                                  </td>
                                  <td className="p-4">
                                      {u.isAdmin ? (
                                          <span className="text-xs bg-brand-900/50 text-brand-400 px-2 py-1 rounded border border-brand-800">Admin</span>
                                      ) : (
                                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">User</span>
                                      )}
                                  </td>
                                  <td className="p-4 text-right">
                                      {!u.isAdmin && (
                                          <button 
                                              onClick={() => handleDeleteUser(u.id)}
                                              className="text-red-400 hover:bg-red-900/30 p-2 rounded transition-colors"
                                              title="Delete User"
                                          >
                                              <Trash2 size={16} />
                                          </button>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* PLATFORM SETTINGS TAB */}
      {activeTab === 'platform_settings' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-2xl font-bold text-white mb-8">Platform Settings</h1>
              
              <div className="bg-dark-900 border border-gray-800 rounded-2xl p-8 space-y-8">
                  <div className="flex items-center justify-between">
                      <div>
                          <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              <ShieldAlert className="text-red-500" size={20} />
                              Maintenance Mode
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                              Temporarily disable the app for all non-admin users.
                          </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={platformSettings.maintenanceMode}
                              onChange={(e) => setPlatformSettings({...platformSettings, maintenanceMode: e.target.checked})}
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                      </label>
                  </div>

                  <div className="space-y-3">
                      <label className="block text-sm font-medium text-white">Global Announcement Alert</label>
                      <input 
                          type="text" 
                          className="w-full bg-dark-950 border border-gray-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none"
                          placeholder="e.g. Server maintenance scheduled for 10 PM..."
                          value={platformSettings.globalAlert}
                          onChange={(e) => setPlatformSettings({...platformSettings, globalAlert: e.target.value})}
                      />
                      <p className="text-xs text-gray-500">This message will appear at the top of the home page for all users.</p>
                  </div>

                  <div className="pt-4 border-t border-gray-800 flex justify-end">
                      <button 
                          onClick={handleSaveSettings}
                          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                      >
                          <Save size={18} /> Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )}
    </AdminLayout>
  );
};

export default Admin;
