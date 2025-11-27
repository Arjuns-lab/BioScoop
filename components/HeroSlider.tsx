import React, { useState, useEffect } from 'react';
import { Play, Info, Plus } from 'lucide-react';
import { Content } from '../types';
import { useNavigate } from 'react-router-dom';

interface HeroSliderProps {
  content: Content[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ content }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (content.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % content.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [content]);

  if (content.length === 0) return null;

  const current = content[currentIndex];

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(current.type === 'movie' && current.videoUrl) {
      navigate(`/watch/${current.id}`);
    } else if (current.type === 'series' && current.seasons?.[0]?.episodes?.[0]) {
      // Play first episode
      navigate(`/watch/${current.id}?s=1&e=1`);
    } else {
       navigate(`/details/${current.id}`);
    }
  };

  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
         <img
           key={current.id}
           src={current.bannerUrl}
           alt={current.title}
           className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out opacity-80"
         />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-20">
          <div className="max-w-2xl space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
               <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {current.type}
               </span>
               <span className="text-green-400 font-bold text-sm">
                  {current.rating * 10}% Match
               </span>
               <span className="text-gray-300 text-sm">{current.releaseYear}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight drop-shadow-xl">
              {current.title}
            </h1>
            
            <p className="text-gray-200 text-lg line-clamp-3 md:line-clamp-none drop-shadow-md">
              {current.description}
            </p>

            <div className="flex items-center gap-4 pt-4">
              <button 
                onClick={handlePlay}
                className="bg-white text-black px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Play fill="black" size={24} />
                Play Now
              </button>
              
              <button 
                onClick={() => navigate(`/details/${current.id}`)}
                className="bg-gray-600/60 backdrop-blur-md text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-500/60 transition-colors"
              >
                <Info size={24} />
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 right-8 flex gap-2 z-10">
        {content.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-brand-500 w-6' : 'bg-gray-500/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;