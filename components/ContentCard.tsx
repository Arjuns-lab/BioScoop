
import React from 'react';
import { Play, Plus, ThumbsUp } from 'lucide-react';
import { Content } from '../types';
import { Link } from 'react-router-dom';

interface ContentCardProps {
  content: Content;
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  return (
    <Link to={`/details/${content.id}`} className="group relative flex-none w-[220px] md:w-[300px] aspect-video cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:z-20">
      <img
        src={content.bannerUrl}
        alt={content.title}
        className="w-full h-full object-cover rounded-lg shadow-lg group-hover:shadow-brand-500/20"
      />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-4">
        <div className="flex gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-brand-400 transition-colors">
            <Play fill="black" size={14} className="ml-1" />
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white text-gray-400 hover:text-white transition-colors">
            <Plus size={14} />
          </div>
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
