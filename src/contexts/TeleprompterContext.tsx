import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
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
// Optional WebSocket sync for cross-device communication
const WS_ENV_KEY = 'VITE_SYNC_SERVER_URL';

interface TeleprompterProviderProps {
  children: ReactNode;
}

export function TeleprompterProvider({ children }: TeleprompterProviderProps) {
  const clientIdRef = useRef(`client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const wsRef = useRef<WebSocket | null>(null);
  const skipWsBroadcastRef = useRef(false);
  const wsRetryRef = useRef<number | null>(null);
  const wsAttemptsRef = useRef(0);
  const stateRef = useRef<TeleprompterState | null>(null);
  const pendingWsSyncRef = useRef(false);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'disabled'>(() => (
    wsUrlFromEnv ? 'connecting' : 'disabled'
  ));
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
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

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // BroadcastChannel for cross-tab sync
  const [channel] = useState(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      return new BroadcastChannel(CHANNEL_NAME);
    }
    return null;
  });

  const wsUrlFromEnv = typeof import.meta !== 'undefined'
    ? (import.meta as { env?: Record<string, string> }).env?.[WS_ENV_KEY]
    : undefined;

  const normalizeWsUrl = (raw?: string) => {
    if (!raw) return undefined;
    let url = raw.trim();
    if (url.startsWith('https://')) url = `wss://${url.slice('https://'.length)}`;
    if (url.startsWith('http://')) url = `ws://${url.slice('http://'.length)}`;
    return url.replace(/\/+$/, '');
  };

  const wsUrl = normalizeWsUrl(wsUrlFromEnv) || (
    typeof window !== 'undefined'
      ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:5174`
      : undefined
  );

  // WebSocket connection for cross-device sync (optional)
  useEffect(() => {
    if (!wsUrl) {
      setWsStatus('disabled');
      return;
    }

    let isActive = true;

    const connect = () => {
      if (!isActive) return;
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      setWsStatus('connecting');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const handleMessage = async (event: MessageEvent) => {
        try {
          let rawData: string;
          if (event.data instanceof Blob) {
            rawData = await event.data.text();
          } else if (event.data instanceof ArrayBuffer) {
            rawData = new TextDecoder().decode(event.data);
          } else {
            rawData = String(event.data);
          }

          const payload = JSON.parse(rawData);
          if (payload?.type !== 'STATE_UPDATE') return;
          if (payload?.origin === clientIdRef.current) return;

          skipWsBroadcastRef.current = true;
          setState(prev => {
            const incoming = payload.state as TeleprompterState;
            if (!incoming) return prev;
            if (JSON.stringify(prev) === JSON.stringify(incoming)) return prev;
            return incoming;
          });
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      const scheduleReconnect = () => {
        if (!isActive) return;
        wsAttemptsRef.current += 1;
        const delay = Math.min(10000, 1000 * wsAttemptsRef.current);
        if (wsRetryRef.current) window.clearTimeout(wsRetryRef.current);
        wsRetryRef.current = window.setTimeout(connect, delay);
      };

      ws.addEventListener('open', () => {
        wsAttemptsRef.current = 0;
        setWsStatus('connected');
        const currentState = stateRef.current;
        if (currentState) {
          ws.send(JSON.stringify({
            type: 'STATE_UPDATE',
            origin: clientIdRef.current,
            state: currentState,
          }));
          setLastSyncAt(Date.now());
          pendingWsSyncRef.current = false;
        }
      });

      ws.addEventListener('message', handleMessage);
      ws.addEventListener('message', () => setLastSyncAt(Date.now()));

      ws.addEventListener('error', scheduleReconnect);
      ws.addEventListener('close', () => {
        setWsStatus('disconnected');
        scheduleReconnect();
      });

      return () => {
        ws.removeEventListener('message', handleMessage);
        ws.removeEventListener('error', scheduleReconnect);
        ws.removeEventListener('close', scheduleReconnect);
        ws.close();
      };
    };

    const cleanup = connect();

    return () => {
      isActive = false;
      setWsStatus('disconnected');
      if (wsRetryRef.current) window.clearTimeout(wsRetryRef.current);
      wsRetryRef.current = null;
      wsAttemptsRef.current = 0;
      if (cleanup) cleanup();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [wsUrl]);

  // Save state to localStorage and broadcast changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    channel?.postMessage({ type: 'STATE_UPDATE', state });

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (skipWsBroadcastRef.current) {
        skipWsBroadcastRef.current = false;
      } else {
        ws.send(JSON.stringify({
          type: 'STATE_UPDATE',
          origin: clientIdRef.current,
          state,
        }));
        setLastSyncAt(Date.now());
      }
    } else if (ws) {
      pendingWsSyncRef.current = true;
    } else if (skipWsBroadcastRef.current) {
      skipWsBroadcastRef.current = false;
    }
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

  const addPrayerRequest = useCallback((type: PrayerType, content: string, specificPrayer?: string) => {
    const newRequest: PrayerRequest = {
      id: `prayer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      specificPrayer,
      completed: false,
      createdAt: Date.now(),
    };
    setState(prev => ({
      ...prev,
      prayerRequests: [...prev.prayerRequests, newRequest],
    }));
  }, []);

  const updatePrayerRequest = useCallback((id: string, updates: Partial<Omit<PrayerRequest, 'id' | 'createdAt'>>) => {
    setState(prev => ({
      ...prev,
      prayerRequests: prev.prayerRequests.map(p =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  }, []);

  const removePrayerRequest = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      prayerRequests: prev.prayerRequests.filter(p => p.id !== id),
    }));
  }, []);

  const clearPrayerRequests = useCallback(() => {
    setState(prev => ({
      ...prev,
      prayerRequests: [],
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
    wsStatus,
    lastSyncAt,
    ...state,
    setActiveTab,
    setDisplayTab,
    updateTabContent,
    addPrayerType,
    updatePrayerTypeInfo,
    removePrayerType,
    addPrayerRequest,
    removePrayerRequest,
    clearPrayerRequests,
    updatePrayerRequest,
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
