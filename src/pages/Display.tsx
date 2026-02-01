import { useRef } from 'react';
import { TeleprompterProvider, useTeleprompter } from '@/contexts/TeleprompterContext';
import {
  TabSelector,
  ScrollControls,
  FontSizeControl,
  TeleprompterDisplay,
  FullscreenButton,
} from '@/components/teleprompter';
import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';

function DisplayContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setActiveTab, tabs, activeTab } = useTeleprompter();

  // Touch handling for swipe between tabs
  const handleSwipe = (direction: 'left' | 'right') => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (direction === 'left' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    } else if (direction === 'right' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen bg-teleprompter-bg flex flex-col dark"
    >
      {/* Top Control Bar - Minimal for iPad */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-teleprompter-bg via-teleprompter-bg/80 to-transparent">
        <TabSelector variant="compact" />
        
        <div className="flex items-center gap-3">
          <ScrollControls showSpeedValue={false} />
          <FontSizeControl />
          <FullscreenButton />
        </div>
      </div>

      {/* Main Display Area */}
      <div
        className="flex-1 pt-20"
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

      {/* Bottom Quick Actions */}
      <div className="absolute bottom-4 left-4 z-20">
        <button
          onClick={() => {
            // Scroll to top
            const scrollArea = document.querySelector('.teleprompter-scroll');
            if (scrollArea) scrollArea.scrollTop = 0;
          }}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full',
            'bg-secondary/50 text-secondary-foreground hover:bg-secondary/80',
            'backdrop-blur-sm transition-all duration-200'
          )}
          aria-label="Scroll to top"
        >
          <RotateCcw size={16} />
          <span className="text-sm">Reset</span>
        </button>
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
