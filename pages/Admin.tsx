import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Film, Tv, BarChart, ArrowLeft } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Content } from '../types';

interface AdminProps {
   user: any;
}

const Admin: React.FC<AdminProps> = ({ user }) => {
  const navigate = useNavigate();
  const [contents, setContents] = useState<Content[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'movies' | 'series'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Content>>({
     type: 'movie',
     languages: [],
     genres: [],
     trending: false
  });

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    const data = await dataService.getAllContent();
    setContents(data);
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Are you sure you want to delete this content?')) {
       await dataService.deleteContent(id);
       loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     // Basic validation and mock logic
     if(!formData.title) return;
     
     // Ensure required fields for mock
     const payload: any = {
        title: formData.title,
        description: formData.description || 'No description',
        type: formData.type || 'movie',
        languages: formData.languages || ['English'],
        genres: formData.genres || ['Drama'],
        releaseYear: formData.releaseYear || 2024,
        posterUrl: formData.posterUrl || `https://picsum.photos/seed/${Date.now()}/300/450`,
        bannerUrl: formData.bannerUrl || `https://picsum.photos/seed/${Date.now()}_banner/1200/600`,
        rating: 8.5,
        trending: formData.trending || false,
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        seasons: formData.type === 'series' ? [] : undefined
     };

     await dataService.addContent(payload);
     setIsFormOpen(false);
     setFormData({ type: 'movie', languages: [], genres: [], trending: false });
     loadData();
  };

  const StatCard = ({ label, count, color }: any) => (
     <div className="bg-dark-900 p-6 rounded-xl border border-gray-800">
        <h3 className="text-gray-400 text-sm font-medium uppercase">{label}</h3>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{count}</p>
     </div>
  );

  return (
    <div className="min-h-screen bg-dark-950 text-white flex">
       {/* Sidebar */}
       <aside className="w-64 bg-dark-900 border-r border-gray-800 hidden md:flex flex-col">
          <div className="p-6">
             <h1 className="text-2xl font-bold text-brand-500">Admin Panel</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
             <button 
               onClick={() => setActiveTab('dashboard')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-dark-800'}`}
             >
                <BarChart size={20} /> Dashboard
             </button>
             <button 
               onClick={() => setActiveTab('movies')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'movies' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-dark-800'}`}
             >
                <Film size={20} /> Movies
             </button>
             <button 
               onClick={() => setActiveTab('series')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'series' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-dark-800'}`}
             >
                <Tv size={20} /> Web Series
             </button>
          </nav>
          <div className="p-4 border-t border-gray-800">
             <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <ArrowLeft size={18} /> Back to App
             </Link>
          </div>
       </aside>

       {/* Main Content */}
       <main className="flex-1 p-8 overflow-y-auto h-screen">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
             <button 
               onClick={() => setIsFormOpen(true)}
               className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
             >
                <Plus size={18} /> Add New
             </button>
          </div>

          {activeTab === 'dashboard' && (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard label="Total Movies" count={contents.filter(c => c.type === 'movie').length} color="text-blue-400" />
                <StatCard label="Total Series" count={contents.filter(c => c.type === 'series').length} color="text-purple-400" />
                <StatCard label="Total Users" count="1,240" color="text-green-400" />
                <StatCard label="Active Streams" count="85" color="text-yellow-400" />
             </div>
          )}

          <div className="bg-dark-900 rounded-xl overflow-hidden border border-gray-800">
             <table className="w-full text-left">
                <thead className="bg-dark-800 text-gray-400">
                   <tr>
                      <th className="p-4">Title</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Language</th>
                      <th className="p-4">Year</th>
                      <th className="p-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                   {contents
                     .filter(c => activeTab === 'dashboard' ? true : activeTab === 'movies' ? c.type === 'movie' : c.type === 'series')
                     .map(content => (
                      <tr key={content.id} className="hover:bg-dark-800/50">
                         <td className="p-4 flex items-center gap-3">
                            <img src={content.posterUrl} className="w-8 h-12 object-cover rounded" alt="" />
                            <span className="font-medium">{content.title}</span>
                         </td>
                         <td className="p-4 capitalize">
                            <span className={`px-2 py-1 rounded text-xs ${content.type === 'movie' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>
                               {content.type}
                            </span>
                         </td>
                         <td className="p-4 text-gray-400">{content.languages[0]}</td>
                         <td className="p-4 text-gray-400">{content.releaseYear}</td>
                         <td className="p-4 text-right space-x-2">
                            <button className="text-gray-400 hover:text-white"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(content.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </main>

       {/* Simple Modal Form for Adding Content */}
       {isFormOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
             <div className="bg-dark-900 rounded-xl p-6 w-full max-w-lg border border-gray-800">
                <h3 className="text-xl font-bold mb-4">Add New Content</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                   <input 
                      type="text" 
                      placeholder="Title" 
                      className="w-full bg-dark-950 border border-gray-700 p-2 rounded text-white"
                      value={formData.title || ''}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      required
                   />
                   <div className="grid grid-cols-2 gap-4">
                      <select 
                        className="bg-dark-950 border border-gray-700 p-2 rounded text-white"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as any})}
                      >
                         <option value="movie">Movie</option>
                         <option value="series">Series</option>
                      </select>
                      <input 
                         type="number" 
                         placeholder="Year"
                         className="bg-dark-950 border border-gray-700 p-2 rounded text-white"
                         value={formData.releaseYear || ''}
                         onChange={e => setFormData({...formData, releaseYear: parseInt(e.target.value)})}
                      />
                   </div>
                   <textarea 
                      placeholder="Description"
                      className="w-full bg-dark-950 border border-gray-700 p-2 rounded text-white h-24"
                      value={formData.description || ''}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                   ></textarea>
                   
                   <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded">Create Mock</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};

export default Admin;