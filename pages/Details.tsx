import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Download, Plus, Share2, Star, Calendar, Clock, ChevronDown, Check } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Content } from '../types';
import Navbar from '../components/Navbar';
import ContentRow from '../components/ContentRow';

interface DetailsProps {
   user: any;
   logout: () => void;
}

const Details: React.FC<DetailsProps> = ({ user, logout }) => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<Content | null>(null);
  const [similar, setSimilar] = useState<Content[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'done'>('idle');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      if (id) {
        const item = await dataService.getContentById(id);
        if (item) {
           setContent(item);
           // Mock similar based on genre
           const all = await dataService.getAllContent();
           setSimilar(all.filter(c => c.id !== item.id && c.genres.some(g => item.genres.includes(g))));
        }
      }
    };
    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (!content) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  const handlePlay = (episodeId?: string, seasonNum?: number) => {
     if(content.type === 'movie') {
        navigate(`/watch/${content.id}`);
     } else {
        const s = seasonNum || 1;
        const e = episodeId ? parseInt(episodeId.replace(/\D/g, '')) : 1;
        navigate(`/watch/${content.id}?s=${s}&e=${e}`);
     }
  };

  const handleDownload = (quality: string) => {
     setIsDownloadOpen(false);
     setDownloadState('downloading');
     
     // Simulate download
     setTimeout(() => {
        setDownloadState('done');
        setTimeout(() => setDownloadState('idle'), 3000);
     }, 2000);
  };

  const currentSeason = content.seasons?.find(s => s.seasonNumber === selectedSeason);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar user={user} onLogout={logout} />
      
      {/* Backdrop */}
      <div className="relative h-[70vh] w-full">
         <div className="absolute inset-0">
            <img src={content.bannerUrl} alt={content.title} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
         </div>
         
         <div className="absolute bottom-0 left-0 right-0 px-4 md:px-12 pb-12 flex flex-col md:flex-row gap-8 items-end">
            <img src={content.posterUrl} alt={content.title} className="w-40 md:w-56 rounded-lg shadow-2xl border-2 border-gray-700 hidden md:block" />
            
            <div className="flex-1 space-y-4">
               <h1 className="text-4xl md:text-6xl font-bold text-white">{content.title}</h1>
               
               <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-1 text-green-400 font-bold"><Star size={16} fill="currentColor"/> {content.rating}</span>
                  <span>{content.releaseYear}</span>
                  {content.duration && <span className="flex items-center gap-1"><Clock size={16}/> {content.duration}</span>}
                  <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-300 border border-gray-600 uppercase text-xs">{content.type}</span>
               </div>

               <div className="flex flex-wrap gap-2">
                  {content.genres.map(g => (
                     <span key={g} className="text-brand-300 bg-brand-900/50 px-3 py-1 rounded-full text-sm border border-brand-700/50">
                        {g}
                     </span>
                  ))}
               </div>

               <p className="text-gray-300 max-w-2xl text-lg leading-relaxed">{content.description}</p>

               <div className="flex flex-wrap items-center gap-4 pt-4 relative">
                  <button 
                     onClick={() => handlePlay()}
                     className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-transform active:scale-95"
                  >
                     <Play fill="currentColor" size={20} />
                     {content.type === 'movie' ? 'Watch Movie' : 'Watch S1 E1'}
                  </button>
                  
                  <div className="relative">
                     <button 
                        onClick={() => downloadState === 'idle' && setIsDownloadOpen(!isDownloadOpen)}
                        className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                           downloadState === 'done' ? 'bg-green-600 text-white' : 
                           downloadState === 'downloading' ? 'bg-gray-700 text-gray-300 cursor-wait' :
                           'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                     >
                        {downloadState === 'done' ? <Check size={20} /> : <Download size={20} className={downloadState === 'downloading' ? 'animate-bounce' : ''} />}
                        {downloadState === 'done' ? 'Downloaded' : downloadState === 'downloading' ? 'Downloading...' : 'Download'}
                     </button>
                     
                     {isDownloadOpen && (
                        <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[160px] z-20">
                           <div className="px-4 py-2 text-xs text-gray-500 font-bold uppercase bg-gray-950/50">Select Quality</div>
                           {['480p (300MB)', '720p (850MB)', '1080p (2.1GB)'].map((quality) => (
                              <button
                                 key={quality}
                                 onClick={() => handleDownload(quality)}
                                 className="w-full text-left px-4 py-3 hover:bg-gray-800 text-sm text-gray-300 hover:text-white border-b border-gray-800 last:border-0"
                              >
                                 {quality}
                              </button>
                           ))}
                        </div>
                     )}
                  </div>

                  <button className="p-3 rounded-full border border-gray-600 hover:border-white text-gray-300 hover:text-white transition-colors">
                     <Plus size={20} />
                  </button>
                  <button className="p-3 rounded-full border border-gray-600 hover:border-white text-gray-300 hover:text-white transition-colors">
                     <Share2 size={20} />
                  </button>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
         {/* Series Episodes Section */}
         {content.type === 'series' && content.seasons && (
            <div className="mb-16">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Episodes</h2>
                  <div className="relative">
                     <select 
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(Number(e.target.value))}
                        className="appearance-none bg-gray-800 border border-gray-700 text-white py-2 pl-4 pr-10 rounded-lg cursor-pointer focus:outline-none focus:border-brand-500"
                     >
                        {content.seasons.map(s => (
                           <option key={s.seasonNumber} value={s.seasonNumber}>Season {s.seasonNumber}</option>
                        ))}
                     </select>
                     <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
                  </div>
               </div>

               <div className="space-y-4">
                  {currentSeason?.episodes.map((ep) => (
                     <div 
                        key={ep.id} 
                        onClick={() => handlePlay(ep.id, selectedSeason)}
                        className="flex items-center gap-4 p-4 rounded-lg bg-dark-900 hover:bg-dark-800 transition-colors cursor-pointer group"
                     >
                        <div className="relative w-32 md:w-48 aspect-video rounded overflow-hidden">
                           <img src={content.bannerUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20">
                              <Play fill="white" size={24} className="opacity-0 group-hover:opacity-100 transition-opacity"/>
                           </div>
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between mb-1">
                              <h3 className="font-bold text-lg group-hover:text-brand-400 transition-colors">
                                 {ep.episodeNumber}. {ep.title}
                              </h3>
                              <span className="text-gray-400 text-sm">{ep.duration}</span>
                           </div>
                           <p className="text-gray-400 text-sm line-clamp-2">
                              Description for this episode would go here. Fast paced streaming action.
                           </p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         <ContentRow title="More Like This" content={similar} />
      </div>
    </div>
  );
};

export default Details;