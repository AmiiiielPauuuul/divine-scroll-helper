import { useRef } from 'react';
import { TeleprompterProvider, useTeleprompter } from '@/contexts/TeleprompterContext';
import {
  TeleprompterDisplay,
  FullscreenButton,
} from '@/components/teleprompter';
import { cn } from '@/lib/utils';

function DisplayContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setDisplayTab, tabs, displayTab } = useTeleprompter();

  // Touch handling for swipe between tabs
  const handleSwipe = (direction: 'left' | 'right') => {
    const currentIndex = tabs.findIndex(t => t.id === displayTab);
    if (direction === 'left' && currentIndex < tabs.length - 1) {
      setDisplayTab(tabs[currentIndex + 1].id);
    } else if (direction === 'right' && currentIndex > 0) {
      setDisplayTab(tabs[currentIndex - 1].id);
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen bg-teleprompter-bg flex flex-col dark"
    >
      {/* Top Control Bar - Minimal for iPad */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-teleprompter-bg via-teleprompter-bg/80 to-transparent">
        <div className="flex items-center gap-3 ml-auto">
          <FullscreenButton />
        </div>
      </div>

      {/* Main Display Area */}
      <div
        className="flex-1 pt-16 sm:pt-18"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          (e.currentTarget as any)._touchStartX = touch.clientX;
        }}
        onTouchEnd={(e) => {
          const startX = (e.currentTarget as any)._touchStartX;
          const endX = e.changedTouches[0].clientX;
          const diff = startX - endX;
          if (Math.abs(diff) > 50) {
            handleSwipe(diff > 0 ? 'left' : 'right');
          }
        }}
      >
        <TeleprompterDisplay className="h-full" />
      </div>

    </div>
  );
}

export default function Display() {
  return (
    <TeleprompterProvider>
      <DisplayContent />
    </TeleprompterProvider>
  );
}
