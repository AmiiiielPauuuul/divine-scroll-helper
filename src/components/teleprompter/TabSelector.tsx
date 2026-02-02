import { TabId } from '@/types/teleprompter';
import { useTeleprompter } from '@/contexts/TeleprompterContext';
import { cn } from '@/lib/utils';

interface TabSelectorProps {
  variant?: 'compact' | 'full';
  className?: string;
  showIcons?: boolean;
}

export function TabSelector({ variant = 'full', className, showIcons = true }: TabSelectorProps) {
  const { tabs, activeTab, setActiveTab } = useTeleprompter();

  return (
    <div className={cn('flex gap-2 overflow-x-auto flex-nowrap pb-1', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 shrink-0 whitespace-nowrap',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground tab-glow'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            variant === 'compact' && 'px-3 py-2 text-sm'
          )}
          aria-pressed={activeTab === tab.id}
        >
          {showIcons && (
            <span className="text-lg" role="img" aria-label={tab.label}>
              {tab.icon}
            </span>
          )}
          {variant === 'full' && (
            <span className="max-w-[8.5rem] truncate" title={tab.label}>{tab.label}</span>
          )}
        </button>
      ))}
    </div>
  );
}
