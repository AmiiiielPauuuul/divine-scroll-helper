import { useTeleprompter } from '@/contexts/TeleprompterContext';
import { cn } from '@/lib/utils';
import { Play, Pause, Minus, Plus } from 'lucide-react';

interface ScrollControlsProps {
  className?: string;
  showSpeedValue?: boolean;
}

export function ScrollControls({ className, showSpeedValue = true }: ScrollControlsProps) {
  const { scrollSpeed, setScrollSpeed, isAutoScrolling, toggleAutoScroll } = useTeleprompter();

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Play/Pause Button */}
      <button
        onClick={toggleAutoScroll}
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/50',
          isAutoScrolling
            ? 'bg-primary text-primary-foreground animate-pulse-glow'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        )}
        aria-label={isAutoScrolling ? 'Pause auto-scroll' : 'Start auto-scroll'}
      >
        {isAutoScrolling ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Speed Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setScrollSpeed(scrollSpeed - 10)}
          disabled={scrollSpeed <= 0}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-primary/50'
          )}
          aria-label="Decrease scroll speed"
        >
          <Minus size={18} />
        </button>

        {showSpeedValue && (
          <div className="w-16 text-center">
            <span className="text-lg font-medium text-foreground">{scrollSpeed}</span>
            <span className="text-xs text-muted-foreground ml-1">%</span>
          </div>
        )}

        <button
          onClick={() => setScrollSpeed(scrollSpeed + 10)}
          disabled={scrollSpeed >= 100}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-primary/50'
          )}
          aria-label="Increase scroll speed"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Speed Slider */}
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={scrollSpeed}
        onChange={e => setScrollSpeed(Number(e.target.value))}
        className={cn(
          'w-32 h-2 bg-secondary rounded-lg appearance-none cursor-pointer',
          'accent-primary'
        )}
        aria-label="Scroll speed"
      />
    </div>
  );
}
