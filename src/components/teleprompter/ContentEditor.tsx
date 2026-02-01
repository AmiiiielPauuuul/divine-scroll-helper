import { useTeleprompter } from '@/contexts/TeleprompterContext';
import { cn } from '@/lib/utils';

interface ContentEditorProps {
  className?: string;
}

export function ContentEditor({ className }: ContentEditorProps) {
  const { tabs, activeTab, updateTabContent } = useTeleprompter();
  const currentTab = tabs.find(t => t.id === activeTab);

  if (!currentTab) return null;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{currentTab.icon}</span>
        <h2 className="text-xl font-semibold text-foreground">{currentTab.label}</h2>
      </div>
      
      <textarea
        value={currentTab.content}
        onChange={e => updateTabContent(activeTab, e.target.value)}
        placeholder={currentTab.placeholder}
        className={cn(
          'flex-1 w-full p-4 rounded-lg resize-none',
          'bg-card text-card-foreground',
          'border border-border',
          'placeholder:text-muted-foreground/60',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          'text-lg leading-relaxed',
          'font-mono'
        )}
        aria-label={`Edit ${currentTab.label} content`}
      />

      <p className="mt-2 text-sm text-muted-foreground">
        Type content here. Use short lines for easy reading.
      </p>
    </div>
  );
}
