import { useTeleprompter } from '@/contexts/TeleprompterContext';
import { cn } from '@/lib/utils';
import { Monitor } from 'lucide-react';

interface DisplayTabSelectorProps {
  className?: string;
}

export function DisplayTabSelector({ className }: DisplayTabSelectorProps) {
  const { tabs, displayTab, setDisplayTab } = useTeleprompter();

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <Monitor size={14} />
        <span>Pastor's Display</span>
      </div>
      <div className="flex gap-2 overflow-x-auto flex-nowrap pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setDisplayTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 shrink-0 whitespace-nowrap',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              displayTab === tab.id
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
            aria-pressed={displayTab === tab.id}
            title={`Show ${tab.label} on pastor's display`}
          >
            <span role="img" aria-label={tab.label}>
              {tab.icon}
            </span>
            <span className="max-w-[8.5rem] truncate" title={tab.label}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
