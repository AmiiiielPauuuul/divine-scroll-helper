import { useTeleprompter } from '@/contexts/TeleprompterContext';
import { cn } from '@/lib/utils';
import { TeleprompterState } from '@/types/teleprompter';

const FONT_SIZES: { value: TeleprompterState['fontSize']; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: '2xl', label: '2XL' },
];

interface FontSizeControlProps {
  className?: string;
}

export function FontSizeControl({ className }: FontSizeControlProps) {
  const { fontSize, setFontSize } = useTeleprompter();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="text-sm text-muted-foreground mr-2">Size:</span>
      {FONT_SIZES.map(size => (
        <button
          key={size.value}
          onClick={() => setFontSize(size.value)}
          className={cn(
            'px-3 py-2 rounded-md font-medium text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            fontSize === size.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
          aria-pressed={fontSize === size.value}
        >
          {size.label}
        </button>
      ))}
    </div>
  );
}
