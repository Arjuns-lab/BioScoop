import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Content } from '../types';
import ContentCard from './ContentCard';

interface ContentRowProps {
  title: string;
  content: Content[];
}

const ContentRow: React.FC<ContentRowProps> = ({ title, content }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { current } = rowRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth + 200 : current.offsetWidth - 200;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (content.length === 0) return null;

  return (
    <div className="mb-12 relative group/row px-4 md:px-12">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 pl-1 border-l-4 border-brand-500 ml-1">
        {title}
      </h2>
      
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 bg-black/50 hover:bg-black/80 w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-r-lg"
        >
          <ChevronLeft size={32} />
        </button>

        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4"
        >
          {content.map((item) => (
            <ContentCard key={item.id} content={item} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 bg-black/50 hover:bg-black/80 w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-l-lg"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default ContentRow;