
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, ArrowLeft, Download, Check, Loader2, FastForward, WifiOff, RotateCw, Monitor, Scan, Settings, FolderCheck } from 'lucide-react';
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
  contentId?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, subTitle, poster, chapters, contentId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const controlsTimeoutRef = useRef<number | null>(null);
  const downloadIntervalRef = useRef<number | null>(null);
  const progressSaveRef = useRef<number | null>(null);

  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [resumed, setResumed] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [showToast, setShowToast] = useState('');
  
  // Screen Modes: contain (Fit), cover (Zoom), fill (Stretch)
  const [screenMode, setScreenMode] = useState<'contain' | 'cover' | 'fill'>('contain');
  
  // Quality
  const [playbackQuality, setPlaybackQuality] = useState('Auto');
  const [availableQualities, setAvailableQualities] = useState<string[]>(['Auto']);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  
  // Download State
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState('0 MB');

  // Check download status on mount
  useEffect(() => {
    if (contentId && dataService.isDownloaded(contentId)) {
       setDownloadStatus('success');
       setIsOfflineMode(true);
    }
  }, [contentId]);

  // HLS Setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset state
    setAvailableQualities(['Auto']);
    setPlaybackQuality('Auto');

    if (Hls.isSupported() && (src.endsWith('.m3u8') || !src.endsWith('.mp4'))) {
      const hls = new Hls({
         capLevelToPlayerSize: true,
         autoStartLoad: true,
      });
      
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels = data.levels.map((l: any) => `${l.height}p`);
        // Filter unique and sort (cast to string[] to satisfy TS)
        const unique = Array.from(new Set(levels as string[])).sort((a, b) => parseInt(b) - parseInt(a));
        setAvailableQualities(['Auto', ...unique]);
        // Default to Auto (-1)
        hls.currentLevel = -1; 
        
        if (!resumed) video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
              switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                      hls.startLoad();
                      break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                      hls.recoverMediaError();
                      break;
                  default:
                      hls.destroy();
                      break;
              }
          }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari)
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
         if(!resumed) video.play().catch(() => {});
      });
    } else {
      // Direct MP4
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
         if(!resumed) video.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  // Progress Saving for Continue Watching
  useEffect(() => {
     if (!contentId || !videoRef.current) return;
     
     const saveProgress = () => {
         const vid = videoRef.current;
         if (vid && !vid.paused && vid.currentTime > 5) {
             dataService.updateWatchProgress(contentId, vid.currentTime, vid.duration);
         }
     };

     // Throttle saves to every 5 seconds
     progressSaveRef.current = window.setInterval(saveProgress, 5000);

     return () => {
         if (progressSaveRef.current) clearInterval(progressSaveRef.current);
         if (videoRef.current && videoRef.current.currentTime > 5) {
            dataService.updateWatchProgress(contentId, videoRef.current.currentTime, videoRef.current.duration);
         }
     };
  }, [contentId]);

  // Handle Controls Visibility
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Resume Logic
  const handleMetadataLoaded = () => {
      const video = videoRef.current;
      if (!video) return;
      
      setDuration(video.duration);

      // Estimate File Size for Download based on duration
      if (video.duration) {
         const hours = video.duration / 3600;
         setEstimatedSize(`${(hours * 1.5).toFixed(1)} GB`); // Approx 1.5GB per hour for 1080p
      }

      // Check for saved position
      if (contentId && !resumed) {
          const savedTime = dataService.getWatchPosition(contentId);
          if (savedTime > 10 && savedTime < video.duration - 60) {
             const userWantsResume = true; // Could prompt user here, but auto-resume is standard OTT
             if (userWantsResume) {
                 video.currentTime = savedTime;
                 setResumed(true);
                 // Toast or indication could go here
             }
          }
      }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      setProgress((current / videoRef.current.duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
      if (!newMuted) {
          videoRef.current.volume = volume || 1;
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

  const changeQuality = (quality: string) => {
    setPlaybackQuality(quality);
    if (hlsRef.current) {
        if (quality === 'Auto') {
            hlsRef.current.currentLevel = -1;
        } else {
            const levels = hlsRef.current.levels;
            const levelIndex = levels.findIndex((l: any) => `${l.height}p` === quality);
            if (levelIndex !== -1) {
                hlsRef.current.currentLevel = levelIndex;
            }
        }
    }
    setShowQualityMenu(false);
  };

  const handleDownloadSelect = (quality: string) => {
      setShowDownloadMenu(false);
      setDownloadStatus('downloading');
      setDownloadProgress(0);

      if (downloadIntervalRef.current) clearInterval(downloadIntervalRef.current);

      // Simulate download with variable speed
      downloadIntervalRef.current = window.setInterval(() => {
          setDownloadProgress(prev => {
              const increment = Math.random() * 8 + 2; // Random speed
              const next = prev + increment;
              if (next >= 100) {
                  clearInterval(downloadIntervalRef.current!);
                  finishDownload(quality);
                  return 100;
              }
              return next;
          });
      }, 500);
  };

  const finishDownload = (quality: string) => {
      setDownloadStatus('success');
      setIsOfflineMode(true);
      
      // 1. Persist metadata to app storage
      if (contentId) {
          dataService.addDownload({
              contentId: contentId,
              title: title,
              posterUrl: poster || '',
              quality: quality,
              size: quality === '1080p' ? '2.1 GB' : quality === '720p' ? '1.2 GB' : '500 MB',
              downloadedAt: new Date().toISOString(),
              type: 'movie'
          });
      }

      // 2. Trigger Real Download if applicable
      if (src && !src.endsWith('.m3u8')) {
          dataService.triggerBrowserDownload(src, title);
          setShowToast('Saved to device Download folder');
          setTimeout(() => setShowToast(''), 4000);
      } else {
          setShowToast('Saved to App Offline Storage');
          setTimeout(() => setShowToast(''), 4000);
      }
      
      // Note: We do NOT reset to idle here, to persist the 'Downloaded' state for this session/content
  };

  const handleSkipIntro = () => {
      if (videoRef.current) {
          videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 85, duration);
      }
  };

  const handleChapterSeek = (time: number) => {
      if (videoRef.current) videoRef.current.currentTime = time;
  };

  const handleScreenModeToggle = () => {
      const modes: ('contain' | 'cover' | 'fill')[] = ['contain', 'cover', 'fill'];
      const nextIndex = (modes.indexOf(screenMode) + 1) % modes.length;
      setScreenMode(modes[nextIndex]);
  };

  const handleRotate = () => {
      setIsRotated(!isRotated);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate generic file sizes based on duration
  const getFileSize = (q: string) => {
      if (!duration) return 'Unknown';
      const hours = duration / 3600;
      if (q === '1080p') return `${(hours * 2.5).toFixed(1)} GB`;
      if (q === '720p') return `${(hours * 1.2).toFixed(1)} GB`;
      return `${(hours * 0.5).toFixed(1)} GB`;
  };

  return (
    <div 
        ref={containerRef} 
        className="relative bg-black w-full h-screen overflow-hidden group select-none flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        onTouchStart={handleMouseMove}
    >
      <video
        ref={videoRef}
        className={`w-full h-full transition-all duration-300 ${isRotated ? 'rotate-90 scale-[1.3]' : ''}`}
        style={{ objectFit: screenMode }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleMetadataLoaded}
        playsInline
      />

      {/* Offline Watermark */}
      {isOfflineMode && (
         <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full text-xs text-green-400 border border-green-500/30 z-0 pointer-events-none">
             <WifiOff size={14} />
             <span>Offline Mode</span>
         </div>
      )}

      {/* Download Toast Notification */}
      {showToast && (
          <div className="absolute top-20 right-1/2 translate-x-1/2 z-50 bg-brand-600 text-white px-4 py-2 rounded-lg shadow-xl animate-in slide-in-from-top-4 fade-in flex items-center gap-2">
              <FolderCheck size={18} />
              <span className="text-sm font-bold">{showToast}</span>
          </div>
      )}

      {/* Skip Intro Button */}
      {currentTime > 0 && currentTime < 35 && (
          <button 
             onClick={handleSkipIntro}
             className="absolute bottom-24 right-8 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all animate-in fade-in slide-in-from-bottom-4"
          >
             Skip Intro <FastForward size={16} />
          </button>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 transition-opacity duration-300 flex flex-col justify-between z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 cursor-none'
        }`}
      >
        {/* Top Bar */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-white hover:text-brand-500 transition-colors">
              <ArrowLeft size={28} />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight md:text-xl">{title}</h1>
              {subTitle && <p className="text-gray-400 text-xs md:text-sm">{subTitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
              {/* Screen Rotation */}
              <button onClick={handleRotate} className="text-gray-300 hover:text-white hidden md:block" title="Rotate Screen">
                 <RotateCw size={22} className={isRotated ? 'text-brand-500' : ''} />
              </button>

              {/* Screen Mode */}
              <button onClick={handleScreenModeToggle} className="text-gray-300 hover:text-white" title={`Screen Mode: ${screenMode}`}>
                 {screenMode === 'contain' && <Monitor size={22} />}
                 {screenMode === 'cover' && <Scan size={22} />}
                 {screenMode === 'fill' && <Maximize size={22} />}
              </button>

              {/* Quality Settings */}
              <div className="relative">
                  <button 
                     onClick={() => setShowQualityMenu(!showQualityMenu)}
                     className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md text-sm font-bold text-white transition-colors border border-white/10 flex items-center gap-2"
                  >
                      <Settings size={16} /> {playbackQuality}
                  </button>
                  {showQualityMenu && (
                      <div className="absolute top-full right-0 mt-2 bg-dark-900 border border-gray-700 rounded-lg overflow-hidden shadow-xl min-w-[120px]">
                          {availableQualities.map(q => (
                              <button
                                  key={q}
                                  onClick={() => changeQuality(q)}
                                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${playbackQuality === q ? 'text-brand-500 font-bold' : 'text-gray-300'}`}
                              >
                                  {q}
                              </button>
                          ))}
                      </div>
                  )}
              </div>
          </div>
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!isPlaying && (
            <div className="bg-black/50 p-6 rounded-full border-2 border-white/20 backdrop-blur-sm animate-in zoom-in duration-300">
               <Play size={48} fill="white" className="ml-2" />
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="p-6 space-y-4 bg-gradient-to-t from-black via-black/80 to-transparent">
          {/* Timeline & Chapters */}
          <div className="relative group/timeline py-2">
             {/* Chapter Markers */}
             {chapters && duration > 0 && chapters.map((chapter) => (
                 <div 
                    key={chapter.id}
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-brand-400 hover:h-5 hover:w-1.5 transition-all z-20 cursor-pointer"
                    style={{ left: `${(chapter.startTime / duration) * 100}%` }}
                    onClick={(e) => { e.stopPropagation(); handleChapterSeek(chapter.startTime); }}
                    title={chapter.title}
                 >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/timeline:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                       {chapter.title}
                    </div>
                 </div>
             ))}

             <input
               type="range"
               min="0"
               max="100"
               value={progress}
               onChange={handleSeek}
               className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:h-2 transition-all"
               style={{ backgroundSize: `${progress}% 100%` }}
             />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={togglePlay} className="text-white hover:text-brand-500 transition-colors">
                {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
              </button>

              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="text-white hover:text-brand-500">
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              <div className="text-sm font-medium text-gray-300 tracking-wide font-mono">
                {formatTime(currentTime)} <span className="text-gray-500">/</span> {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-6">
               {/* Download Button */}
               <div className="relative">
                  <button 
                     onClick={() => {
                        if (downloadStatus === 'idle') setShowDownloadMenu(!showDownloadMenu);
                     }}
                     disabled={downloadStatus !== 'idle'}
                     className={`relative flex items-center gap-3 px-5 py-2.5 rounded-full font-bold transition-all overflow-hidden ${
                         downloadStatus === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/50 cursor-default' : 
                         downloadStatus === 'downloading' ? 'bg-gray-800 text-white border border-gray-600 cursor-wait' :
                         'bg-gray-800/80 hover:bg-gray-700 text-white border border-gray-600 hover:border-white'
                     }`}
                  >
                     {/* Progress Bar Background */}
                     {downloadStatus === 'downloading' && (
                         <div className="absolute inset-0 bg-brand-900/50 z-0">
                            <div 
                               className="h-full bg-brand-600/30 transition-all duration-300"
                               style={{ width: `${downloadProgress}%` }}
                            />
                            {/* Bottom Line Progress */}
                            <div className="absolute bottom-0 left-0 h-[3px] bg-brand-500 shadow-[0_0_10px_rgba(118,82,214,0.8)] transition-all duration-300" 
                                 style={{ width: `${downloadProgress}%` }} 
                            />
                         </div>
                     )}

                     <div className="relative z-10 flex items-center gap-2">
                        {downloadStatus === 'downloading' ? (
                            <>
                              <Loader2 size={18} className="animate-spin text-brand-400" />
                              <span className="text-sm">Downloading... {Math.round(downloadProgress)}%</span>
                            </>
                        ) : downloadStatus === 'success' ? (
                            <>
                              <Check size={18} />
                              <span className="text-sm">Downloaded</span>
                            </>
                        ) : (
                            <>
                              <Download size={18} />
                              <span className="text-sm hidden md:inline">Download</span>
                            </>
                        )}
                     </div>
                  </button>

                  {/* Quality Dropdown for Download */}
                  {showDownloadMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-dark-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl min-w-[180px] animate-in slide-in-from-bottom-2 fade-in">
                          <div className="px-4 py-3 bg-gray-950/50 border-b border-gray-800">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Quality</p>
                          </div>
                          {['1080p', '720p', '480p'].map(q => (
                              <button
                                  key={q}
                                  onClick={() => handleDownloadSelect(q)}
                                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-b border-gray-800/50 last:border-0"
                              >
                                  <span className="font-medium">{q}</span>
                                  <span className="text-xs text-gray-500">{getFileSize(q)}</span>
                              </button>
                          ))}
                      </div>
                  )}
               </div>

              <button onClick={toggleFullscreen} className="text-white hover:text-brand-500 transition-colors">
                {isFullscreen ? <Minimize size={28} /> : <Maximize size={28} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
