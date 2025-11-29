
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import ContentRow from '../components/ContentRow';
import { dataService } from '../services/dataService';
import { Content, User } from '../types';

interface HomeProps {
   user: User | null;
   logout: () => void;
}

const Home: React.FC<HomeProps> = ({ user, logout }) => {
  const [trending, setTrending] = useState<Content[]>([]);
  const [continueWatching, setContinueWatching] = useState<Content[]>([]);
  const [watchlist, setWatchlist] = useState<Content[]>([]);
  const [teluguMovies, setTeluguMovies] = useState<Content[]>([]);
  const [hindiMovies, setHindiMovies] = useState<Content[]>([]);
  const [action, setAction] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Parallel data fetching for efficiency
      const [allContent, trend, tel, hin, cw, wl] = await Promise.all([
         dataService.getAllContent(),
         dataService.getTrending(),
         dataService.getByLanguage('Telugu'),
         dataService.getByLanguage('Hindi'),
         dataService.getContinueWatchingContent(),
         dataService.getWatchlistContent()
      ]);
      
      const actionContent = allContent.filter(c => c.genres.includes('Action'));

      setTrending(trend);
      setTeluguMovies(tel);
      setHindiMovies(hin);
      setAction(actionContent);
      setContinueWatching(cw);
      setWatchlist(wl);
      setIsLoading(false);
    };

    fetchData();
  }, [user]); // Re-fetch if user changes (e.g. login/logout)

  if (isLoading) {
     return <div className="h-screen w-full flex items-center justify-center bg-dark-950 text-brand-500 text-2xl font-bold">Loading BioScoop...</div>;
  }

  return (
    <div className="min-h-screen pb-20">
      <Navbar user={user} onLogout={logout} />
      <HeroSlider content={trending.slice(0, 5)} />
      
      <div className="-mt-32 relative z-10 space-y-4">
        {continueWatching.length > 0 && (
           <ContentRow title="Continue Watching" content={continueWatching} />
        )}

        {watchlist.length > 0 && (
           <ContentRow title="My List" content={watchlist} />
        )}
        
        <ContentRow title="Trending Now" content={trending} />
        <ContentRow title="Blockbuster Telugu Movies" content={teluguMovies} />
        <ContentRow title="Hit Hindi Movies" content={hindiMovies} />
        <ContentRow title="Action Packed" content={action} />
      </div>
      
      <footer className="mt-20 py-10 border-t border-gray-800 text-center text-gray-500 text-sm">
         <p>© 2024 BioScoop. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
