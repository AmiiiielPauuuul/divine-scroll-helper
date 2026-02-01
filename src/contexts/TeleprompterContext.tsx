import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  TabId,
  Tab,
  PrayerType,
  PrayerRequest,
  TeleprompterState,
  TeleprompterContextValue,
  DEFAULT_TABS,
  STORAGE_KEY,
} from '@/types/teleprompter';

const TeleprompterContext = createContext<TeleprompterContextValue | null>(null);

// Broadcast channel for cross-tab communication
const CHANNEL_NAME = 'church-teleprompter-sync';

interface TeleprompterProviderProps {
  children: ReactNode;
}

export function TeleprompterProvider({ children }: TeleprompterProviderProps) {
  const [state, setState] = useState<TeleprompterState>(() => {
    // Load initial state from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            activeTab: parsed.activeTab || 'prayers',
            displayTab: parsed.displayTab || 'prayers',
            tabs: parsed.tabs || DEFAULT_TABS,
            prayerRequests: parsed.prayerRequests || [],
            scrollSpeed: parsed.scrollSpeed ?? 30,
            isAutoScrolling: parsed.isAutoScrolling ?? false,
            fontSize: parsed.fontSize || 'lg',
          };
        } catch (e) {
          console.error('Failed to parse saved state:', e);
        }
      }
    }
    return {
      activeTab: 'prayers',
      displayTab: 'prayers',
      tabs: DEFAULT_TABS,
      prayerRequests: [],
      scrollSpeed: 30,
      isAutoScrolling: false,
      fontSize: 'lg',
    };
  });

  // BroadcastChannel for cross-tab sync
  const [channel] = useState(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      return new BroadcastChannel(CHANNEL_NAME);
    }
    return null;
  });

  // Save state to localStorage and broadcast changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    channel?.postMessage({ type: 'STATE_UPDATE', state });
  }, [state, channel]);

  // Listen for updates from other tabs
  useEffect(() => {
    if (!channel) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'STATE_UPDATE') {
        setState(event.data.state);
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => channel.removeEventListener('message', handleMessage);
  }, [channel]);

  // Also poll localStorage for Safari compatibility (no BroadcastChannel)
  useEffect(() => {
    if (channel) return; // Only use polling if BroadcastChannel is unavailable

    const interval = setInterval(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState(prev => {
            // Only update if there are actual changes
            if (JSON.stringify(prev) !== saved) {
              return parsed;
            }
            return prev;
          });
        } catch (e) {
          console.error('Failed to parse saved state:', e);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [channel]);

  const setActiveTab = useCallback((tabId: TabId) => {
    setState(prev => ({ ...prev, activeTab: tabId }));
  }, []);

  const setDisplayTab = useCallback((tabId: TabId) => {
    setState(prev => ({ ...prev, displayTab: tabId }));
  }, []);

  const updateTabContent = useCallback((tabId: TabId, content: string) => {
    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id === tabId ? { ...tab, content } : tab
      ),
    }));
  }, []);

  const addPrayerRequest = useCallback((type: PrayerType, content: string) => {
    const newRequest: PrayerRequest = {
      id: `prayer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      createdAt: Date.now(),
    };
    setState(prev => ({
      ...prev,
      prayerRequests: [...prev.prayerRequests, newRequest],
    }));
  }, []);

  const removePrayerRequest = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      prayerRequests: prev.prayerRequests.filter(p => p.id !== id),
    }));
  }, []);

  const setScrollSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, scrollSpeed: Math.max(0, Math.min(100, speed)) }));
  }, []);

  const toggleAutoScroll = useCallback(() => {
    setState(prev => ({ ...prev, isAutoScrolling: !prev.isAutoScrolling }));
  }, []);

  const setFontSize = useCallback((fontSize: TeleprompterState['fontSize']) => {
    setState(prev => ({ ...prev, fontSize }));
  }, []);

  const value: TeleprompterContextValue = {
    ...state,
    setActiveTab,
    setDisplayTab,
    updateTabContent,
    addPrayerRequest,
    removePrayerRequest,
    setScrollSpeed,
    toggleAutoScroll,
    setFontSize,
  };

  return (
    <TeleprompterContext.Provider value={value}>
      {children}
    </TeleprompterContext.Provider>
  );
}

export function useTeleprompter() {
  const context = useContext(TeleprompterContext);
  if (!context) {
    throw new Error('useTeleprompter must be used within a TeleprompterProvider');
  }
  return context;
}
