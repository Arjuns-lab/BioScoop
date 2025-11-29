
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import VideoPlayer, { Chapter } from '../components/VideoPlayer';
import { dataService } from '../services/dataService';
import { Content } from '../types';

const PlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState<Content | null>(null);
  
  const season = searchParams.get('s');
  const episode = searchParams.get('e');

  useEffect(() => {
    const fetch = async () => {
      if (id) {
        const item = await dataService.getContentById(id);
        setContent(item || null);
      }
    };
    fetch();
  }, [id]);

  if (!content) return <div className="bg-black text-white h-screen flex items-center justify-center">Loading Content...</div>;

  let src = content.videoUrl || '';
  let title = content.title;
  let subTitle = '';

  if (content.type === 'series' && season && episode && content.seasons) {
     const s = content.seasons.find(sea => sea.seasonNumber === Number(season));
     const e = s?.episodes.find(ep => ep.episodeNumber === Number(episode));
     if (e) {
        src = e.videoUrl;
        title = e.title;
        subTitle = `${content.title} - S${season} E${episode}`;
     }
  }

  // Fallback video if API key missing/mock data empty for video
  // Using a robust HLS test stream (Big Buck Bunny)
  if(!src || src.includes('commondatastorage.googleapis.com')) {
      src = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  }

  // Mock Chapters for Demo (timestamps based on Big Buck Bunny approx)
  const mockChapters: Chapter[] = [
      { id: '1', title: 'Intro', startTime: 0 },
      { id: '2', title: 'The Butterfly', startTime: 45 },
      { id: '3', title: 'The Encounter', startTime: 95 },
      { id: '4', title: 'Revenge Planning', startTime: 250 },
      { id: '5', title: 'The Trap', startTime: 380 },
      { id: '6', title: 'Credits', startTime: 580 }
  ];

  return (
    <VideoPlayer 
      src={src} 
      title={title} 
      subTitle={subTitle}
      poster={content.bannerUrl}
      chapters={mockChapters}
      contentId={content.id}
    />
  );
};

export default PlayerPage;
