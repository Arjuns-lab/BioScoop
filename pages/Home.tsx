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
  const [teluguMovies, setTeluguMovies] = useState<Content[]>([]);
  const [hindiMovies, setHindiMovies] = useState<Content[]>([]);
  const [action, setAction] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const allContent = await dataService.getAllContent();
      const trend = await dataService.getTrending();
      const tel = await dataService.getByLanguage('Telugu');
      const hin = await dataService.getByLanguage('Hindi');
      
      const actionContent = allContent.filter(c => c.genres.includes('Action'));

      setTrending(trend);
      setTeluguMovies(tel);
      setHindiMovies(hin);
      setAction(actionContent);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
     return <div className="h-screen w-full flex items-center justify-center bg-dark-950 text-brand-500 text-2xl font-bold">Loading BioScoop...</div>;
  }

  return (
    <div className="min-h-screen pb-20">
      <Navbar user={user} onLogout={logout} />
      <HeroSlider content={trending.slice(0, 5)} />
      
      <div className="-mt-32 relative z-10 space-y-4">
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