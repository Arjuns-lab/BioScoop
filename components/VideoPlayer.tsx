import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, ArrowLeft, Download, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VideoPlayerProps {
  src: string;
  title: string;
  subTitle?: string;
  poster?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, subTitle, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number>();
  const downloadTimeoutRef = useRef<number>();
  const resetTimeoutRef = useRef<number>();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Quality & Download States
  const [playbackQuality, setPlaybackQuality] = useState('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success'>('idle');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const manualChange = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = (videoRef.current.duration / 100) * manualChange;
      setProgress(manualChange);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !showQualityMenu && !showDownloadMenu) setShowControls(false);
    }, 3000);
  };

  const handleDownload = (quality: string) => {
    setShowDownloadMenu(false);
    setDownloadStatus('downloading');
    
    // Clear any pending resets/downloads
    if (downloadTimeoutRef.current) window.clearTimeout(downloadTimeoutRef.current);
    if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);

    // Simulate download delay
    downloadTimeoutRef.current = window.setTimeout(() => {
        setDownloadStatus('success');
        
        // Auto reset to idle after 3 seconds of success message
        resetTimeoutRef.current = window.setTimeout(() => {
            setDownloadStatus('idle');
        }, 3000);
    }, 2000);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        if(e.code === 'Space') {
            e.preventDefault(); // Prevent scrolling
            handlePlayPause();
        }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
        window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPlaying]);

  // Separate useEffect for cleanup of timers to prevent clearing on re-renders
  useEffect(() => {
      return () => {
        if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
        if (downloadTimeoutRef.current) window.clearTimeout(downloadTimeoutRef.current);
        if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
      };
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden group font-sans select-none"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onClick={handlePlayPause}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Header */}
      <div className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => navigate(-1)} className="text-white hover:text-brand-500 mb-4 transition-colors">
          <ArrowLeft size={32} />
        </button>
        <h2 className="text-2xl font-bold text-white drop-shadow-md">{title}</h2>
        {subTitle && <p className="text-gray-300 drop-shadow-md">{subTitle}</p>}
      </div>

      {/* Center Play Button Overlay */}
      {!isPlaying && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-24 h-24 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-2xl animate-pulse">
               <Play size={48} fill="white" className="ml-2 text-white" />
            </div>
         </div>
      )}

      {/* Controls Container */}
      <div className={`absolute bottom-0 left-0 right-0 px-6 pb-8 pt-24 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-4 group/progress">
           <span className="text-xs font-medium text-gray-300 w-10 text-right tabular-nums">{formatTime(videoRef.current?.currentTime || 0)}</span>
          <div className="relative w-full h-1 group-hover/progress:h-2 transition-all bg-gray-600/50 rounded-lg cursor-pointer">
              {/* Buffer Bar (Simulated) */}
              <div className="absolute top-0 left-0 h-full bg-gray-400/30 rounded-lg w-[60%]"></div>
              {/* Play Progress */}
              <div 
                className="absolute top-0 left-0 h-full bg-brand-500 rounded-lg relative"
                style={{ width: `${progress}%` }}
              >
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow-lg transform scale-0 group-hover/progress:scale-100 transition-all"></div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
          </div>
           <span className="text-xs font-medium text-gray-300 w-10 tabular-nums">{formatTime(videoRef.current?.duration || 0)}</span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={handlePlayPause} className="text-white hover:text-brand-500 transition-transform active:scale-90">
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
            
            <button onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)} className="text-gray-300 hover:text-white flex flex-col items-center group/skip">
               <span className="text-xl leading-none -mb-1 group-hover/skip:-translate-x-1 transition-transform">«</span>
               <span className="text-[10px] font-bold">10s</span>
            </button>
            <button onClick={() => videoRef.current && (videoRef.current.currentTime += 10)} className="text-gray-300 hover:text-white flex flex-col items-center group/skip">
               <span className="text-xl leading-none -mb-1 group-hover/skip:translate-x-1 transition-transform">»</span>
               <span className="text-[10px] font-bold">10s</span>
            </button>

            <div className="flex items-center gap-2 group/vol">
              <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-gray-300">
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setVolume(v);
                      if(videoRef.current) videoRef.current.volume = v;
                    }}
                    className="w-24 h-1 bg-gray-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-500"
                  />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Download Button */}
             <div className="relative">
                <button 
                  onClick={() => {
                     if(downloadStatus === 'idle') setShowDownloadMenu(!showDownloadMenu);
                     setShowQualityMenu(false);
                  }} 
                  className={`
                    flex items-center gap-2 transition-all duration-300 rounded-full p-2 
                    ${downloadStatus === 'idle' ? 'hover:bg-white/10 text-white hover:text-brand-500' : ''}
                    ${downloadStatus === 'downloading' ? 'bg-brand-600/20 text-brand-400 pr-4' : ''}
                    ${downloadStatus === 'success' ? 'bg-green-500/20 text-green-400 pr-4' : ''}
                  `}
                  title="Download"
                >
                    {downloadStatus === 'idle' && <Download size={24} />}
                    
                    {downloadStatus === 'downloading' && (
                        <>
                            <Loader2 size={24} className="animate-spin" />
                            <span className="text-sm font-bold">Downloading...</span>
                        </>
                    )}
                    
                    {downloadStatus === 'success' && (
                        <>
                            <Check size={24} />
                            <span className="text-sm font-bold">Success</span>
                        </>
                    )}
                </button>
                
                {showDownloadMenu && downloadStatus === 'idle' && (
                    <div className="absolute bottom-14 right-0 bg-black/90 border border-gray-700 rounded-lg overflow-hidden min-w-[160px] z-30 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                        <div className="px-4 py-3 bg-white/5 border-b border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Download size={12} /> Download Quality
                        </div>
                        {[
                            { label: '1080p', size: '2.1GB' }, 
                            { label: '720p', size: '1.2GB' }, 
                            { label: '480p', size: '600MB' }
                        ].map((opt) => (
                            <button
                                key={opt.label}
                                onClick={() => handleDownload(opt.label)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-brand-600 hover:text-white flex justify-between items-center transition-colors group"
                            >
                                <span className="font-medium">{opt.label}</span>
                                <span className="text-[10px] opacity-60 group-hover:opacity-100">{opt.size}</span>
                            </button>
                        ))}
                    </div>
                )}
             </div>

             {/* Playback Quality Selector */}
             <div className="relative">
                <button 
                  onClick={() => {
                     setShowQualityMenu(!showQualityMenu);
                     setShowDownloadMenu(false);
                  }}
                  className="text-white hover:text-brand-500 font-bold text-sm px-2 py-1 rounded hover:bg-white/10 transition-all"
                >
                   {playbackQuality}
                </button>
                {showQualityMenu && (
                   <div className="absolute bottom-14 right-0 bg-black/90 border border-gray-700 rounded-lg min-w-[100px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-30">
                      {['1080p', '720p', '480p', 'Auto'].map(q => (
                         <button 
                           key={q} 
                           onClick={() => { setPlaybackQuality(q); setShowQualityMenu(false); }}
                           className={`text-left text-sm px-4 py-2 hover:bg-brand-600 hover:text-white flex justify-between items-center ${playbackQuality === q ? 'text-brand-500 font-bold' : 'text-gray-300'}`}
                         >
                            {q} {playbackQuality === q && <Check size={14} />}
                         </button>
                      ))}
                   </div>
                )}
             </div>

            <button className="text-white hover:text-brand-500 p-2 rounded-full hover:bg-white/10 transition-colors">
              <Settings size={24} />
            </button>
            <button onClick={toggleFullscreen} className="text-white hover:text-brand-500 p-2 rounded-full hover:bg-white/10 transition-colors">
              {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;