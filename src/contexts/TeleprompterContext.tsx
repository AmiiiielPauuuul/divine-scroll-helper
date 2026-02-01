import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  TabId,
  Tab,
  PrayerType,
  PrayerTypeInfo,
  PrayerRequest,
  TeleprompterState,
  TeleprompterContextValue,
  DEFAULT_TABS,
  DEFAULT_PRAYER_TYPES,
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
            prayerTypes: parsed.prayerTypes || DEFAULT_PRAYER_TYPES,
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
      prayerTypes: DEFAULT_PRAYER_TYPES,
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

  const reorderPrayerRequest = useCallback((draggedId: string, targetId: string) => {
    setState(prev => {
      const prayers = [...prev.prayerRequests];
      const draggedIndex = prayers.findIndex(p => p.id === draggedId);
      const targetIndex = prayers.findIndex(p => p.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      const [dragged] = prayers.splice(draggedIndex, 1);
      prayers.splice(targetIndex, 0, dragged);
      
      return { ...prev, prayerRequests: prayers };
    });
  }, []);

  const updatePrayerType = useCallback((id: string, type: PrayerType) => {
    setState(prev => ({
      ...prev,
      prayerRequests: prev.prayerRequests.map(p =>
        p.id === id ? { ...p, type } : p
      ),
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

  // Prayer Type Management
  const addPrayerType = useCallback((type: Omit<PrayerTypeInfo, 'id'>) => {
    const id = `type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setState(prev => ({
      ...prev,
      prayerTypes: [...prev.prayerTypes, { ...type, id }],
    }));
  }, []);

  const updatePrayerTypeInfo = useCallback((id: string, updates: Partial<Omit<PrayerTypeInfo, 'id'>>) => {
    setState(prev => ({
      ...prev,
      prayerTypes: prev.prayerTypes.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  }, []);

  const removePrayerType = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      prayerTypes: prev.prayerTypes.filter(t => t.id !== id),
      // Move prayers of deleted type to 'other' or first available type
      prayerRequests: prev.prayerRequests.map(p =>
        p.type === id
          ? { ...p, type: prev.prayerTypes.find(t => t.id !== id)?.id || 'other' }
          : p
      ),
    }));
  }, []);

  const value: TeleprompterContextValue = {
    ...state,
    setActiveTab,
    setDisplayTab,
    updateTabContent,
    addPrayerType,
    updatePrayerTypeInfo,
    removePrayerType,
    addPrayerRequest,
    removePrayerRequest,
    reorderPrayerRequest,
    updatePrayerType,
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
