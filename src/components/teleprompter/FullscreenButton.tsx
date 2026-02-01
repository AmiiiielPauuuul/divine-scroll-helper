import { useState, useEffect, useCallback } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullscreenButtonProps {
  targetRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export function FullscreenButton({ targetRef, className }: FullscreenButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const checkFullscreen = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', checkFullscreen);
    return () => document.removeEventListener('fullscreenchange', checkFullscreen);
  }, [checkFullscreen]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const element = targetRef?.current || document.documentElement;
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className={cn(
        'flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200',
        'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        className
      )}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
    </button>
  );
}
