import { useRef, useEffect, useCallback } from 'react';
import { useTeleprompter } from '@/contexts/TeleprompterContext';
import { cn } from '@/lib/utils';

const FONT_SIZE_CLASSES = {
  sm: 'text-teleprompter-sm',
  md: 'text-teleprompter-md',
  lg: 'text-teleprompter-lg',
  xl: 'text-teleprompter-xl',
  '2xl': 'text-teleprompter-2xl',
};

interface TeleprompterDisplayProps {
  className?: string;
  showTabIndicator?: boolean;
}

export function TeleprompterDisplay({ className, showTabIndicator = true }: TeleprompterDisplayProps) {
  const { tabs, activeTab, fontSize, scrollSpeed, isAutoScrolling } = useTeleprompter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const currentTab = tabs.find(t => t.id === activeTab);
  const displayContent = currentTab?.content || currentTab?.placeholder || '';

  // Auto-scroll logic
  const scroll = useCallback(() => {
    if (!scrollRef.current || !isAutoScrolling || scrollSpeed === 0) {
      animationRef.current = null;
      return;
    }

    // Speed: pixels per frame. At 100%, scroll ~3px/frame. At 50%, ~1.5px/frame.
    const pixelsPerFrame = (scrollSpeed / 100) * 3;
    scrollRef.current.scrollTop += pixelsPerFrame;

    // Check if we've reached the bottom
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 1) {
      // Optional: reset to top or pause
      // For now, just continue (user can manually reset)
    }

    animationRef.current = requestAnimationFrame(scroll);
  }, [isAutoScrolling, scrollSpeed]);

  useEffect(() => {
    if (isAutoScrolling && scrollSpeed > 0) {
      animationRef.current = requestAnimationFrame(scroll);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAutoScrolling, scrollSpeed, scroll]);

  // Reset scroll position when tab changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  return (
    <div
      className={cn(
        'relative flex flex-col h-full bg-teleprompter-bg overflow-hidden',
        className
      )}
    >
      {/* Tab Indicator */}
      {showTabIndicator && currentTab && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teleprompter-active/20 backdrop-blur-sm">
            <span className="text-lg">{currentTab.icon}</span>
            <span className="text-sm font-medium text-teleprompter-text/80">
              {currentTab.label}
            </span>
          </div>
        </div>
      )}

      {/* Scrolling Content */}
      <div
        ref={scrollRef}
        className={cn(
          'flex-1 overflow-y-auto teleprompter-scroll teleprompter-fade-both',
          'px-8 py-24 touch-pan-y'
        )}
        style={{ scrollBehavior: isAutoScrolling ? 'auto' : 'smooth' }}
      >
        <div
          className={cn(
            'max-w-4xl mx-auto teleprompter-text',
            FONT_SIZE_CLASSES[fontSize],
            'text-teleprompter-text leading-relaxed whitespace-pre-wrap',
            'animate-slide-up'
          )}
        >
          {displayContent}
        </div>
        
        {/* Extra padding at bottom for scroll */}
        <div className="h-[50vh]" aria-hidden="true" />
      </div>

      {/* Scroll Progress Indicator */}
      <div className="absolute bottom-4 right-4 z-10">
        {isAutoScrolling && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teleprompter-active/20 backdrop-blur-sm animate-pulse-glow">
            <div className="w-2 h-2 rounded-full bg-teleprompter-active" />
            <span className="text-xs text-teleprompter-text/80">Scrolling</span>
          </div>
        )}
      </div>
    </div>
  );
}
