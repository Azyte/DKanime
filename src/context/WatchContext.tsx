import React, { createContext, useContext, useState, useEffect } from 'react';
import type { WatchHistoryItem } from '../types/anime';

interface WatchContextType {
  watchlist: number[];
  addToWatchlist: (animeId: number) => void;
  removeFromWatchlist: (animeId: number) => void;
  toggleWatchlist: (animeId: number) => void;
  isInWatchlist: (animeId: number) => boolean;
  history: WatchHistoryItem[];
  saveProgress: (animeId: number, episodeNumber: number, currentTime: number, duration: number) => void;
  getProgress: (animeId: number) => WatchHistoryItem | undefined;
  clearHistory: () => void;
}

const WatchContext = createContext<WatchContextType | undefined>(undefined);

export const WatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('dkanime_watchlist');
      return saved ? JSON.parse(saved) : [1, 2, 6];
    } catch {
      return [1, 2, 6];
    }
  });

  const [history, setHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('dkanime_history');
      return saved ? JSON.parse(saved) : [
        {
          animeId: 1,
          episodeNumber: 1,
          currentTime: 620,
          duration: 1455,
          progressPercentage: 42,
          updatedAt: Date.now() - 3600000
        },
        {
          animeId: 2,
          episodeNumber: 3,
          currentTime: 1200,
          duration: 1450,
          progressPercentage: 82,
          updatedAt: Date.now() - 7200000
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dkanime_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error('Error saving watchlist', e);
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem('dkanime_history', JSON.stringify(history));
    } catch (e) {
      console.error('Error saving history', e);
    }
  }, [history]);

  const addToWatchlist = (animeId: number) => {
    setWatchlist((prev) => (prev.includes(animeId) ? prev : [animeId, ...prev]));
  };

  const removeFromWatchlist = (animeId: number) => {
    setWatchlist((prev) => prev.filter((id) => id !== animeId));
  };

  const toggleWatchlist = (animeId: number) => {
    setWatchlist((prev) =>
      prev.includes(animeId) ? prev.filter((id) => id !== animeId) : [animeId, ...prev]
    );
  };

  const isInWatchlist = (animeId: number) => watchlist.includes(animeId);

  const saveProgress = (
    animeId: number,
    episodeNumber: number,
    currentTime: number,
    duration: number
  ) => {
    if (duration <= 0) return;
    const progressPercentage = Math.min(100, Math.round((currentTime / duration) * 100));

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.animeId !== animeId);
      const newItem: WatchHistoryItem = {
        animeId,
        episodeNumber,
        currentTime,
        duration,
        progressPercentage,
        updatedAt: Date.now()
      };
      return [newItem, ...filtered];
    });
  };

  const getProgress = (animeId: number) => {
    return history.find((item) => item.animeId === animeId);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <WatchContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        history,
        saveProgress,
        getProgress,
        clearHistory
      }}
    >
      {children}
    </WatchContext.Provider>
  );
};

export const useWatch = () => {
  const context = useContext(WatchContext);
  if (!context) {
    throw new Error('useWatch must be used within a WatchProvider');
  }
  return context;
};
