
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, ArrowLeft, Download, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import { dataService } from '../services/dataService';

export interface Chapter {
  id: string;
  title: string;
  startTime: number;
}

interface VideoPlayerProps {
  src: string;
  title: string;
  subTitle?: string;
  poster?: string;
  chapters?: Chapter[];
  contentId?: string; // Add contentId to link downloads
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, subTitle, poster, chapters, contentId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const controlsTimeoutRef = useRef<number | null>(null);
  const downloadTimeoutRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);
  const downloadIntervalRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Quality & Download States
  const [playbackQuality, setPlaybackQuality] = useState('Auto');
  const [availableQualities, setAvailableQualities] = useState<string[]>(['Auto']);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // Check download status on mount
  useEffect(() => {
    if (contentId && dataService.isDownloaded(contentId)) {
       setDownloadStatus('success');
    }
  }, [contentId]);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isHlsSource = src.endsWith('.m3u8');

    // Reset previous HLS instance if exists
    if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
    }

    if (Hls.isSupported() && isHlsSource) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
        });
        hlsRef.current = hls;

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data: any) => {
            // Extract qualities
            const levels = data.levels.map((l: any) => `${l.height}p`);
            // Remove duplicates and sort
            const uniqueLevels = Array.from(new Set(levels)).sort((a: any, b: any) => parseInt(b) - parseInt(a));
            setAvailableQualities(['Auto', ...(uniqueLevels as string[])]);
            
            // Ensure we start in Auto mode for adaptive streaming
            hls.currentLevel = -1;
            setPlaybackQuality('Auto');

            video.play().catch(() => {
                // Autoplay might be blocked
                setIsPlaying(false);
            });
            setIsPlaying(true);
        });

    } else if (video.canPlayType('application/vnd.apple.mpegurl') && isHlsSource) {
        // Native HLS support (Safari)
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
            setDuration(video.duration);
            video.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
        });
    } else {
        // Direct file playback (MP4)
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
             setDuration(video.duration);
        });
        // Basic fake qualities for MP4
        setAvailableQualities(['Auto', '1080p', '720p', '480p']);
    }

    return () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }
    };
  }, [src]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
        const d = videoRef.current.duration;
        const t = videoRef.current.currentTime;
        
        // Ensure duration is set if it wasn't caught by loadedmetadata (sometimes happens with HLS)
        if (d && d !== duration && isFinite(d)) {
            setDuration(d);
        }

        // Avoid division by zero
        const safeDuration = d || 1; 
        const progress = (t / safeDuration) * 100;
        setProgress(progress);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const manualChange = Number(e.target.value);
    if (videoRef.current) {
      const duration = videoRef.current.duration || 0;
      videoRef.current.currentTime = (duration / 100) * manualChange;
      setProgress(manualChange);
    }
  };

  const handleChapterSeek = (startTime: number) => {
     if (videoRef.current) {
         videoRef.current.currentTime = startTime;
         // Optimistic update
         if(duration > 0) {
             setProgress((startTime / duration) * 100);
         }
         if (!isPlaying) {
             videoRef.current.play();
             setIsPlaying(true);
         }
     }
  };

  const changeQuality = (quality: string) => {
      setPlaybackQuality(quality);
      setShowQualityMenu(false);

      if (hlsRef.current) {
          if (quality === 'Auto') {
              // Enable adaptive bitrate by setting currentLevel to -1
              hlsRef.current.currentLevel = -1; 
          } else {
              const levelIndex = hlsRef.current.levels.findIndex((l: any) => `${l.height}p` === quality);
              if (levelIndex !== -1) {
                  hlsRef.current.currentLevel = levelIndex;
              }
          }
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

  const getEstimatedSize = (qualityLabel: string) => {
      if (!duration || !isFinite(duration)) return 'Unknown size';
      
      // Approximate bitrates (Mbps) for OTT content
      let bitrateMbps = 2.0;
      if (qualityLabel.includes('1080p')) bitrateMbps = 4.5;
      else if (qualityLabel.includes('720p')) bitrateMbps = 2.2;
      else if (qualityLabel.includes('480p')) bitrateMbps = 1.0;
      
      // Size in Megabytes = (Mbps * duration_seconds) / 8
      const sizeMB = (bitrateMbps * duration) / 8;
      
      if (sizeMB > 1024) {
          return `${(sizeMB / 1024).toFixed(1)} GB`;
      }
      return `${Math.round(sizeMB)} MB`;
  };

  const handleDownload = (quality: string) => {
    setShowDownloadMenu(false);
    setDownloadStatus('downloading');
    setDownloadProgress(0);
    
    // Clear any pending resets/downloads
    if (downloadTimeoutRef.current) window.clearTimeout(downloadTimeoutRef.current);
    if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
    if (downloadIntervalRef.current) window.clearInterval(downloadIntervalRef.current);

    // Simulate download progress
    let currentProgress = 0;
    downloadIntervalRef.current = window.setInterval(() => {
        // Random increment between 2% and 8%
        currentProgress += Math.random() * 6 + 2;
        
        if (currentProgress >= 100) {
            currentProgress = 100;
            if (downloadIntervalRef.current) window.clearInterval(downloadIntervalRef.current);
            setDownloadProgress(100);
            setDownloadStatus('success');
            
            // Save to Downloads
            if(contentId) {
              dataService.addDownload({
                 contentId: contentId,
                 title: title,
                 posterUrl: poster || '',
                 quality: quality,
                 size: getEstimatedSize(quality),
                 downloadedAt: new Date().toISOString(),
                 type: subTitle ? 'series' : 'movie'
              });
            }

            // Auto reset to idle after 3 seconds of success message
            resetTimeoutRef.current = window.setTimeout(() => {
                setDownloadStatus('idle');
            }, 3000);
        } else {
            setDownloadProgress(currentProgress);
        }
    }, 200);
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
        if (downloadIntervalRef.current) window.clearInterval(downloadIntervalRef.current);
      };
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '00:00';
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
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onClick={handlePlayPause}
        onEnded={() => setIsPlaying(false)}
        playsInline
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
        
        {/* Progress Bar & Chapters */}
        <div className="flex items-center gap-4 mb-4 group/progress relative">
           <span className="text-xs font-medium text-gray-300 w-10 text-right tabular-nums">{formatTime(videoRef.current?.currentTime || 0)}</span>
          
          <div className="relative w-full h-1 group-hover/progress:h-2 transition-all bg-gray-600/50 rounded-lg cursor-pointer">
              {/* Buffer Bar (Simulated) */}
              <div className="absolute top-0 left-0 h-full bg-gray-400/30 rounded-lg w-[60%]"></div>
              
              {/* Play Progress */}
              <div 
                className="absolute top-0 left-0 h-full bg-brand-500 rounded-lg relative"
                style={{ width: `${progress}%` }}
              >
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow-lg transform scale-0 group-hover/progress:scale-100 transition-all z-20"></div>
              </div>

              {/* Chapter Markers */}
              {chapters && duration > 0 && chapters.map((chapter) => {
                  const position = (chapter.startTime / duration) * 100;
                  if (position < 0 || position > 100) return null;
                  return (
                      <div 
                        key={chapter.id}
                        className="absolute top-0 bottom-0 w-1 bg-white/50 hover:bg-white z-20 hover:scale-x-150 transition-all group/marker"
                        style={{ left: `${position}%` }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleChapterSeek(chapter.startTime);
                        }}
                      >
                         <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-xl">
                            {chapter.title}
                         </div>
                      </div>
                  );
              })}

              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
          </div>
           <span className="text-xs font-medium text-gray-300 w-10 tabular-nums">{formatTime(duration)}</span>
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
                    flex items-center gap-2 transition-all duration-300 rounded-full p-2 relative overflow-hidden
                    ${downloadStatus === 'idle' ? 'hover:bg-white/10 text-white hover:text-brand-500' : ''}
                    ${downloadStatus === 'downloading' ? 'text-brand-400 pr-4 border border-brand-500/30' : ''}
                    ${downloadStatus === 'success' ? 'bg-green-500/20 text-green-400 pr-4 cursor-default' : ''}
                  `}
                  title="Download"
                  disabled={downloadStatus !== 'idle'}
                >
                    {downloadStatus === 'downloading' && (
                        <div 
                            className="absolute left-0 top-0 bottom-0 bg-brand-600/20 transition-all duration-200 ease-linear"
                            style={{ width: `${downloadProgress}%` }}
                        />
                    )}

                    {downloadStatus === 'idle' && <Download size={24} className="relative z-10" />}
                    
                    {downloadStatus === 'downloading' && (
                        <div className="relative z-10 flex items-center gap-2">
                            <Loader2 size={24} className="animate-spin" />
                            <span className="text-sm font-bold tabular-nums w-10 text-center">{Math.round(downloadProgress)}%</span>
                        </div>
                    )}
                    
                    {downloadStatus === 'success' && (
                        <div className="relative z-10 flex items-center gap-2">
                            <Check size={24} />
                            <span className="text-sm font-bold">Saved</span>
                        </div>
                    )}
                </button>
                
                {showDownloadMenu && downloadStatus === 'idle' && (
                    <div className="absolute bottom-14 right-0 bg-black/90 border border-gray-700 rounded-lg overflow-hidden min-w-[200px] z-30 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                        <div className="px-4 py-3 bg-white/5 border-b border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Download size={12} /> Select Download Quality
                        </div>
                        {[
                            { label: '1080p' }, 
                            { label: '720p' }, 
                            { label: '480p' }
                        ].map((opt) => (
                            <button
                                key={opt.label}
                                onClick={() => handleDownload(opt.label)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-brand-600 hover:text-white flex justify-between items-center transition-colors group"
                            >
                                <span className="font-medium">{opt.label}</span>
                                <span className="text-[10px] opacity-60 group-hover:opacity-100 bg-white/10 px-1.5 py-0.5 rounded">
                                    {getEstimatedSize(opt.label)}
                                </span>
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
                   <div className="absolute bottom-14 right-0 bg-black/90 border border-gray-700 rounded-lg min-w-[100px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-30 max-h-64 overflow-y-auto no-scrollbar">
                      {availableQualities.map(q => (
                         <button 
                           key={q} 
                           onClick={() => changeQuality(q)}
                           className={`text-left text-sm px-4 py-2 hover:bg-brand-600 hover:text-white flex justify-between items-center ${playbackQuality === q ? 'text-brand-500 font-bold' : 'text-gray-300'}`}
                         >
                            {q} {playbackQuality === q && <Check size={14} />}
                         </button>
                      ))}
                   </div>
                )}
             </div>

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
