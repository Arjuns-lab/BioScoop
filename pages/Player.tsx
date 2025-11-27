import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
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
  if(!src) src = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  return (
    <VideoPlayer 
      src={src} 
      title={title} 
      subTitle={subTitle}
      poster={content.bannerUrl}
    />
  );
};

export default PlayerPage;