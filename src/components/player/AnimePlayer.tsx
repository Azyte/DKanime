import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  FastForward,
  Settings,
  Check,
  Tv,
  Moon,
  Sun,
  PictureInPicture2,
  ChevronRight,
  Layers,
  Server
} from 'lucide-react';
import type { AnimeEpisode, AnimeFormat, VideoQuality, VideoSource } from '../../types/anime';
import { useSettings } from '../../context/SettingsContext';
import { useWatch } from '../../context/WatchContext';
import { formatTime } from '../../utils/formatters';

interface AnimePlayerProps {
  animeId: number;
  animeTitle: string;
  format?: AnimeFormat;
  episode: AnimeEpisode;
  totalEpisodes: number;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
  isTheaterMode: boolean;
  setIsTheaterMode: (val: boolean) => void;
  isLightsOff: boolean;
  setIsLightsOff: (val: boolean) => void;
}

export const AnimePlayer: React.FC<AnimePlayerProps> = ({
  animeId,
  animeTitle,
  format,
  episode,
  totalEpisodes,
  onNextEpisode,
  onPrevEpisode,
  isTheaterMode,
  setIsTheaterMode,
  isLightsOff,
  setIsLightsOff,
}) => {
  const { settings, updateSettings } = useSettings();
  const { saveProgress, getProgress } = useWatch();

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>(
    settings.preferredQuality || '1080p'
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState<'main' | 'quality' | 'speed' | 'server'>('main');
  const [activeServer, setActiveServer] = useState<'server1' | 'server2' | 'embed'>('server1');
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [showNextCountdown, setShowNextCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const [introToast, setIntroToast] = useState(false);

  // HLS Instance ref & parsed levels
  const hlsRef = useRef<Hls | null>(null);
  const [hlsLevels, setHlsLevels] = useState<{ id: number; height: number; bitrate: number }[]>([]);

  // Get current active video source based on active server & selected quality
  const currentSource: VideoSource = (() => {
    if (activeServer === 'server2' && episode.sources.length > 1) {
      return episode.sources[1];
    }
    const found = episode.sources.find((s) => s.quality === selectedQuality);
    return found || episode.sources[0] || {
      quality: '1080p',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      format: 'mp4'
    };
  })();

  // Initialize and attach HLS stream or native video source
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (activeServer === 'embed') {
      return;
    }

    const currentUrl = currentSource.url;
    const isHls = currentSource.format === 'hls' || currentUrl.includes('.m3u8') || currentUrl.includes('/proxy/hls');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsRef.current = hls;

      hls.loadSource(currentUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const levels = data.levels.map((lvl, index) => ({
          id: index,
          height: lvl.height,
          bitrate: lvl.bitrate
        }));
        setHlsLevels(levels);
        if (settings.autoPlay) {
          video.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
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
      video.src = currentUrl;
      if (settings.autoPlay) {
        video.play().catch(() => {});
      }
    } else {
      video.src = currentUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSource.url, currentSource.format, activeServer]);

  // Restore saved progress or initial settings
  useEffect(() => {
    const prevProgress = getProgress(animeId);
    if (prevProgress && prevProgress.episodeNumber === episode.number && videoRef.current) {
      if (prevProgress.currentTime > 5 && prevProgress.currentTime < (prevProgress.duration - 15)) {
        videoRef.current.currentTime = prevProgress.currentTime;
        setCurrentTime(prevProgress.currentTime);
      }
    }
  }, [episode.number, animeId]);

  // Handle Controls Hide Timer
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettingsMenu(false);
      }
    }, 3500);
  };

  // Play / Pause toggle
  // Sync volume with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Skip 10 seconds
  const handleSeekDelta = (delta: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  // Skip Intro (typically 85 seconds in anime OP)
  const handleSkipIntro = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 85);
    setIntroToast(true);
    setTimeout(() => setIntroToast(false), 2500);
  };

  // Seamless Quality Switch (with HLS adaptive levels support)
  const handleQualityChange = (quality: VideoQuality) => {
    setSelectedQuality(quality);
    setShowSettingsMenu(false);

    if (hlsRef.current && hlsLevels.length > 0) {
      if (quality === 'auto') {
        hlsRef.current.currentLevel = -1;
      } else {
        const targetHeight = parseInt(quality.replace('p', ''), 10);
        const levelIdx = hlsLevels.findIndex((l) => l.height === targetHeight);
        if (levelIdx !== -1) {
          hlsRef.current.currentLevel = levelIdx;
        } else {
          hlsRef.current.currentLevel = -1;
        }
      }
      return;
    }

    if (!videoRef.current || quality === selectedQuality) return;
    const prevTime = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = prevTime;
        if (wasPlaying) {
          videoRef.current.play().catch(() => {});
        }
      }
    }, 50);
  };

  // Speed Change
  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettingsMenu(false);
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // PiP Toggle
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.error('PiP failed', e);
    }
  };

  // Scrubber hover preview
  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    setHoverPosition(clampedPos);
    setHoverTime(clampedPos * duration);
  };

  // Scrubber click / seek
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          setIsMuted((prev) => !prev);
          break;
        case 'arrowleft':
          e.preventDefault();
          handleSeekDelta(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          handleSeekDelta(10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume((prev) => Math.min(1, prev + 0.1));
          setIsMuted(false);
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume((prev) => Math.max(0, prev - 0.1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, duration]);

  // Video Time Update & Buffer update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    // Save progress every 5 seconds
    if (Math.floor(cur) % 5 === 0) {
      saveProgress(animeId, episode.number, cur, videoRef.current.duration || duration);
    }

    // Auto skip intro if setting is enabled
    if (settings.autoSkipIntro && cur < 85 && cur > 1) {
      videoRef.current.currentTime = 85;
      setIntroToast(true);
      setTimeout(() => setIntroToast(false), 2000);
    }

    // Buffer percentage
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered(bufferedEnd);
    }
  };

  // Video ended - auto next
  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (settings.autoNext && episode.number < totalEpisodes && onNextEpisode) {
      setShowNextCountdown(true);
      setCountdownSeconds(5);
    }
  };

  // Countdown timer for next episode
  useEffect(() => {
    if (!showNextCountdown) return;
    if (countdownSeconds <= 0) {
      setShowNextCountdown(false);
      onNextEpisode?.();
      return;
    }
    const timer = setTimeout(() => {
      setCountdownSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [showNextCountdown, countdownSeconds, onNextEpisode]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercentage = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
      className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group select-none ${
        isFullscreen ? 'rounded-none border-none' : ''
      }`}
    >
      {/* Video Element (Direct Source) */}
      {activeServer !== 'embed' ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              if (settings.autoPlay) {
                videoRef.current.play().catch(() => {});
              }
            }
          }}
          onEnded={handleVideoEnded}
          playsInline
          crossOrigin="anonymous"
        >
          {episode.subtitles?.map((sub, idx) => (
            <track
              key={idx}
              kind="subtitles"
              src={sub.url}
              srcLang={sub.lang.slice(0, 2).toLowerCase()}
              label={sub.lang}
              default={sub.default}
            />
          ))}
        </video>
      ) : (
        /* Embed / Third Party Iframe Player */
        <iframe
          src={episode.embedUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
          title="Anime Stream Embed"
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      )}

      {/* Intro Skipped Toast */}
      {introToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-brand-cyan text-dark-950 font-bold text-xs shadow-xl animate-bounce flex items-center gap-2">
          <FastForward className="w-4 h-4" />
          Opening Intro Dilewati (+85 detik)
        </div>
      )}

      {/* Auto Next Countdown Overlay */}
      {showNextCountdown && (
        <div className="absolute inset-0 z-30 bg-dark-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-brand-cyan/20 border-2 border-brand-cyan flex items-center justify-center text-brand-cyan text-2xl font-black mb-4 animate-pulse">
            {countdownSeconds}
          </div>
          <h3 className="text-xl font-bold text-white mb-1">
            Episode Selanjutnya: Episode {episode.number + 1}
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Otomatis memutar dalam beberapa detik...
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNextCountdown(false)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Batal
            </button>
            <button
              onClick={() => {
                setShowNextCountdown(false);
                onNextEpisode?.();
              }}
              className="px-6 py-2 rounded-xl bg-brand-cyan text-dark-950 text-xs font-bold hover:bg-brand-cyanGlow transition-colors flex items-center gap-1.5"
            >
              Putar Sekarang <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Center Big Play/Pause Ripple Button (Visible on Pause or tap) */}
      {!isPlaying && activeServer !== 'embed' && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer bg-dark-950/30 backdrop-blur-[2px]"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-cyan to-brand-purple p-1 shadow-2xl shadow-brand-cyan/40 hover:scale-110 active:scale-95 transition-all">
            <div className="w-full h-full bg-dark-900/90 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-brand-cyan fill-brand-cyan ml-1" />
            </div>
          </div>
        </div>
      )}

      {/* Top Gradient & Info Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-white drop-shadow truncate max-w-xs sm:max-w-md">
              {animeTitle}
            </h4>
            <span className="text-xs text-brand-cyan font-medium">
              {format === 'Movie' ? 'Film Layar Lebar (Full Movie)' : episode.title}
            </span>
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Server Switcher Pill */}
          <div className="flex items-center rounded-lg bg-dark-900/80 border border-white/10 p-0.5 text-xs">
            <button
              onClick={() => setActiveServer('server1')}
              className={`px-2 py-1 rounded-md transition-colors ${
                activeServer === 'server1'
                  ? 'bg-brand-cyan text-dark-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Server 1 HD
            </button>
            <button
              onClick={() => setActiveServer('server2')}
              className={`px-2 py-1 rounded-md transition-colors ${
                activeServer === 'server2'
                  ? 'bg-brand-cyan text-dark-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Server 2
            </button>
          </div>

          {/* Lights Off Mode */}
          <button
            onClick={() => setIsLightsOff(!isLightsOff)}
            className={`p-2 rounded-xl backdrop-blur-md border transition-colors ${
              isLightsOff
                ? 'bg-amber-400/20 text-amber-400 border-amber-400/40'
                : 'bg-dark-900/70 text-slate-300 hover:text-white border-white/10'
            }`}
            title="Mode Lampu Mati"
          >
            {isLightsOff ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 space-y-2.5 transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber Progress Bar */}
        <div
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={() => setHoverTime(null)}
          onClick={handleScrubberClick}
          className="relative group/scrub h-2.5 hover:h-4 flex items-center cursor-pointer transition-all duration-150"
        >
          {/* Background Bar */}
          <div className="w-full h-1 group-hover/scrub:h-2 rounded-full bg-white/20 relative overflow-hidden transition-all">
            {/* Buffered Progress */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-white/30 rounded-full"
              style={{ width: `${bufferedPercentage}%` }}
            />
            {/* Current Played Progress */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-brand-cyan to-brand-purple rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Thumb indicator */}
          <div
            className="absolute -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg shadow-brand-cyan/50 scale-0 group-hover/scrub:scale-100 transition-transform"
            style={{ left: `${progressPercentage}%` }}
          />

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-dark-900 text-[11px] font-mono font-semibold text-white border border-white/20 shadow-lg pointer-events-none"
              style={{ left: `${hoverPosition * 100}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          {/* Left Controls: Play, Rewind, Skip, Volume, Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none active:scale-90"
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {/* Skip -10s */}
            <button
              onClick={() => handleSeekDelta(-10)}
              className="p-1.5 text-slate-300 hover:text-white transition-colors hidden sm:block"
              title="Mundur 10 detik"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Skip +10s */}
            <button
              onClick={() => handleSeekDelta(10)}
              className="p-1.5 text-slate-300 hover:text-white transition-colors hidden sm:block"
              title="Maju 10 detik"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Skip Intro Button */}
            <button
              onClick={handleSkipIntro}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-brand-cyan text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
              title="Lewati Opening Intro 85s"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lewati Intro</span>
              <span className="sm:hidden">+85s</span>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 text-slate-300 hover:text-white transition-colors"
                title="Mute / Unmute (M)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-14 sm:w-20 h-1 bg-white/20 accent-brand-cyan rounded-full cursor-pointer hidden sm:block"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-xs font-mono text-slate-300 flex items-center gap-1">
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-500">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Quality, Speed, PiP, Theater, Fullscreen */}
          <div className="flex items-center gap-2 relative">
            {/* Quality Pill Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setActiveMenuTab('quality');
                }}
                className="px-2.5 py-1 rounded-lg bg-dark-900/80 hover:bg-dark-900 border border-brand-cyan/40 text-brand-cyan text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
              >
                <span>{selectedQuality}</span>
              </button>
            </div>

            {/* Settings Dropdown (Quality & Speed) */}
            <button
              onClick={() => {
                setShowSettingsMenu(!showSettingsMenu);
                setActiveMenuTab('main');
              }}
              className={`p-2 rounded-xl text-slate-300 hover:text-white transition-colors ${
                showSettingsMenu ? 'bg-white/20 text-white' : 'hover:bg-white/10'
              }`}
              title="Pengaturan Pemutar"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Picture in Picture */}
            <button
              onClick={togglePiP}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
              title="Picture in Picture"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Theater Mode Toggle */}
            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className={`p-2 rounded-xl transition-colors hidden md:block ${
                isTheaterMode
                  ? 'bg-brand-cyan/20 text-brand-cyan'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Mode Bioskop (Theater)"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Layar Penuh (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Popover Settings Menu */}
            {showSettingsMenu && (
              <div className="absolute right-0 bottom-12 w-56 rounded-xl bg-dark-900/95 backdrop-blur-xl border border-white/10 shadow-2xl p-2 z-50 text-xs text-slate-300 animate-fadeIn space-y-1">
                {activeMenuTab === 'main' && (
                  <>
                    <button
                      onClick={() => setActiveMenuTab('server')}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-emerald-400" /> Server Stream
                      </span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        {activeServer === 'server1' ? 'Server 1 (HLS)' : activeServer === 'server2' ? 'Server 2 (CDN)' : 'Embed'} <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveMenuTab('quality')}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-brand-cyan" /> Kualitas Video
                      </span>
                      <span className="text-brand-cyan font-bold flex items-center gap-1">
                        {selectedQuality} <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveMenuTab('speed')}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FastForward className="w-3.5 h-3.5 text-brand-purple" /> Kecepatan
                      </span>
                      <span className="text-slate-200 font-semibold flex items-center gap-1">
                        {playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}{' '}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                  </>
                )}

                {/* Server Submenu */}
                {activeMenuTab === 'server' && (
                  <div>
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/5 font-bold text-white mb-1">
                      <span>Pilih Server Stream</span>
                      <button
                        onClick={() => setActiveMenuTab('main')}
                        className="text-[10px] text-brand-cyan hover:underline"
                      >
                        Kembali
                      </button>
                    </div>
                    {[
                      { id: 'server1', name: 'Server 1: HLS Stream (HD)', desc: 'Adaptive HLS Master • 1080p/720p' },
                      { id: 'server2', name: 'Server 2: CDN Stream', desc: 'Direct CDN Fast Stream' },
                      { id: 'embed', name: 'Server 3: Embed Player', desc: 'Pemutar pihak ketiga (AniKoto)' }
                    ].map((srv) => (
                      <button
                        key={srv.id}
                        onClick={() => {
                          setActiveServer(srv.id as any);
                          setShowSettingsMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                          activeServer === srv.id
                            ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{srv.name}</div>
                          <div className="text-[10px] text-slate-400">{srv.desc}</div>
                        </div>
                        {activeServer === srv.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Quality Submenu */}
                {activeMenuTab === 'quality' && (
                  <div>
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/5 font-bold text-white mb-1">
                      <span>Pilih Kualitas</span>
                      <button
                        onClick={() => setActiveMenuTab('main')}
                        className="text-[10px] text-brand-cyan hover:underline"
                      >
                        Kembali
                      </button>
                    </div>
                    {(['auto', '1080p', '720p', '480p', '360p'] as VideoQuality[]).map((q) => (
                      <button
                        key={q}
                        onClick={() => handleQualityChange(q)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                          selectedQuality === q
                            ? 'bg-brand-cyan/20 text-brand-cyan font-bold'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <span>{q === 'auto' ? 'Auto (Adaptif)' : `${q} ${q === '1080p' ? '(FHD)' : q === '720p' ? '(HD)' : ''}`}</span>
                        {selectedQuality === q && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Speed Submenu */}
                {activeMenuTab === 'speed' && (
                  <div>
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/5 font-bold text-white mb-1">
                      <span>Kecepatan Pemutaran</span>
                      <button
                        onClick={() => setActiveMenuTab('main')}
                        className="text-[10px] text-brand-cyan hover:underline"
                      >
                        Kembali
                      </button>
                    </div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedChange(s)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                          playbackSpeed === s
                            ? 'bg-brand-purple/20 text-brand-purple font-bold'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <span>{s === 1 ? '1.0x (Normal)' : `${s}x`}</span>
                        {playbackSpeed === s && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
