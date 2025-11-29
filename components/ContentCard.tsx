
import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Download, Check, Loader2 } from 'lucide-react';
import { Content } from '../types';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService';

interface ContentCardProps {
  content: Content;
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success'>('idle');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dataService.isDownloaded(content.id)) {
      setDownloadStatus('success');
    }
  }, [content.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowQualityMenu(false);
      }
    };

    if (showQualityMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQualityMenu]);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (downloadStatus === 'idle') {
       setShowQualityMenu(!showQualityMenu);
    }
  };

  const handleSelectQuality = (e: React.MouseEvent, quality: string) => {
      e.preventDefault();
      e.stopPropagation();
      setShowQualityMenu(false);
      setDownloadStatus('downloading');

      // Simulate download process
      setTimeout(() => {
          setDownloadStatus('success');
          dataService.addDownload({
              contentId: content.id,
              title: content.title,
              posterUrl: content.posterUrl,
              quality: quality,
              size: quality === '1080p' ? '2.1 GB' : quality === '720p' ? '850 MB' : '300 MB',
              downloadedAt: new Date().toISOString(),
              type: content.type
          });
      }, 2000);
  };

  return (
    <Link to={`/details/${content.id}`} className="group relative flex-none w-[220px] md:w-[300px] aspect-video cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:z-20 block bg-dark-900 rounded-lg overflow-hidden">
      <img
        src={content.bannerUrl}
        alt={content.title}
        className="w-full h-full object-cover shadow-lg group-hover:shadow-brand-500/20"
      />
      
      {/* Progress Bar for Continue Watching */}
      {content.progress !== undefined && content.progress > 0 && (
         <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 z-10">
            <div 
               className="h-full bg-red-600"
               style={{ width: `${Math.min(content.progress, 100)}%` }}
            />
         </div>
      )}
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="flex gap-2 mb-3 relative">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-brand-400 transition-colors">
            <Play fill="black" size={14} className="ml-1" />
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white text-gray-400 hover:text-white transition-colors">
            <Plus size={14} />
          </div>
          
          {/* Download Button */}
          <button 
             onClick={handleDownloadClick}
             className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                 downloadStatus === 'success' 
                   ? 'border-green-500 text-green-500 bg-green-500/10 cursor-default' 
                   : 'border-gray-400 hover:border-white text-gray-400 hover:text-white'
             }`}
             title={downloadStatus === 'success' ? 'Downloaded' : 'Download'}
          >
             {downloadStatus === 'downloading' ? (
                 <Loader2 size={14} className="animate-spin" />
             ) : downloadStatus === 'success' ? (
                 <Check size={14} />
             ) : (
                 <Download size={14} />
             )}
          </button>

          {/* Quality Menu */}
          {showQualityMenu && (
              <div 
                 ref={menuRef}
                 className="absolute bottom-full left-0 mb-2 bg-dark-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-30 min-w-[140px] animate-in fade-in slide-in-from-bottom-2"
                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                 <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase bg-gray-950 border-b border-gray-800">
                    Select Quality
                 </div>
                 {[
                    { l: '1080p', s: '2.1 GB' },
                    { l: '720p', s: '850 MB' },
                    { l: '480p', s: '300 MB' }
                 ].map(opt => (
                    <button
                       key={opt.l}
                       onClick={(e) => handleSelectQuality(e, opt.l)}
                       className="w-full text-left px-3 py-2 text-xs text-white hover:bg-brand-600 transition-colors flex justify-between items-center"
                    >
                       <span>{opt.l}</span>
                       <span className="text-[10px] text-gray-500">{opt.s}</span>
                    </button>
                 ))}
              </div>
          )}
        </div>
        
        <h3 className="text-white font-bold text-sm leading-tight mb-1 line-clamp-1">{content.title}</h3>
        <div className="flex items-center gap-2 text-[10px] text-gray-300">
           <span className="text-green-400 font-bold">{content.rating}</span>
           <span>•</span>
           <span>{content.releaseYear}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
           {content.genres.slice(0, 2).map(g => (
              <span key={g} className="text-[10px] text-gray-400 border border-gray-700 px-1 rounded">{g}</span>
           ))}
        </div>
      </div>
    </Link>
  );
};

export default ContentCard;
