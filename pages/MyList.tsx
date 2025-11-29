
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Play, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import { dataService } from '../services/dataService';
import { Content, User } from '../types';

interface MyListProps {
  user: User | null;
  logout: () => void;
}

const MyList: React.FC<MyListProps> = ({ user, logout }) => {
  const [watchlist, setWatchlist] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      const list = await dataService.getWatchlistContent();
      setWatchlist(list);
      setIsLoading(false);
    };
    fetchWatchlist();
  }, []);

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    // Optimistic update
    setWatchlist(prev => prev.filter(item => item.id !== id));
    
    // Actual update
    await dataService.toggleWatchlist(id);
  };

  if (isLoading) {
    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center">
            <div className="text-brand-500 font-bold text-xl">Loading your list...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar user={user} onLogout={logout} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-12">
        <div className="flex items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-white">My List</h1>
            <span className="bg-dark-900 text-gray-400 text-sm font-bold px-3 py-1 rounded-full border border-gray-800">
                {watchlist.length} Items
            </span>
        </div>

        {watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-2xl bg-dark-900/30">
                <Plus size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Your watchlist is empty</p>
                <p className="text-sm opacity-60 max-w-xs text-center mt-2">Add movies and series to your list to track what you want to watch next.</p>
                <Link to="/" className="mt-6 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">
                    Browse Content
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {watchlist.map(content => (
                    <Link to={`/details/${content.id}`} key={content.id} className="group relative aspect-video bg-dark-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-brand-500/50 transition-all hover:scale-[1.02]">
                        <img 
                            src={content.bannerUrl} 
                            alt={content.title} 
                            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40"
                        />
                        
                        <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <h3 className="text-white font-bold truncate mb-1">{content.title}</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-brand-400 font-medium uppercase">{content.type}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // Handle play logic if needed, or link just takes to details
                                        }}
                                        className="p-2 bg-white text-black rounded-full hover:bg-brand-400 hover:text-white transition-colors"
                                        title="Play"
                                    >
                                        <Play size={16} fill="currentColor" />
                                    </button>
                                    <button 
                                        onClick={(e) => handleRemove(e, content.id)}
                                        className="p-2 bg-gray-800 text-gray-400 rounded-full hover:bg-red-500 hover:text-white transition-colors border border-gray-700 hover:border-red-500"
                                        title="Remove from list"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile remove button always visible? No, sticking to hover/focus for cleaner UI or top right absolute */}
                        <button 
                             onClick={(e) => handleRemove(e, content.id)}
                             className="md:hidden absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full z-10"
                        >
                             <Trash2 size={14} />
                        </button>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default MyList;
