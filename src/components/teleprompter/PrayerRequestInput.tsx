import { useState } from 'react';
import { useTeleprompter } from '@/contexts/TeleprompterContext';
import { PRAYER_TYPES, PrayerType } from '@/types/teleprompter';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

export function PrayerRequestInput() {
  const { addPrayerRequest, prayerRequests, removePrayerRequest } = useTeleprompter();
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<PrayerType>('healing');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      addPrayerRequest(selectedType, content.trim());
      setContent('');
    }
  };

  // Group prayers by type
  const groupedPrayers = PRAYER_TYPES.map(type => ({
    ...type,
    prayers: prayerRequests.filter(p => p.type === type.id),
  })).filter(group => group.prayers.length > 0);

  return (
    <div className="flex flex-col h-full">
      {/* Add Prayer Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🙏</span>
          <h2 className="text-xl font-semibold text-foreground">Prayer Requests</h2>
        </div>

        {/* Type Selector */}
        <div className="flex flex-wrap gap-2 mb-3">
          {PRAYER_TYPES.map(type => (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelectedType(type.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all',
                selectedType === type.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Enter prayer request..."
            className={cn(
              'flex-1 px-4 py-2 rounded-lg',
              'bg-card text-card-foreground',
              'border border-border',
              'placeholder:text-muted-foreground/60',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary'
            )}
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Prayer List by Type */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {groupedPrayers.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">
            No prayer requests yet. Add one above.
          </p>
        ) : (
          groupedPrayers.map(group => (
            <div key={group.id} className="space-y-2">
              <div className={cn('flex items-center gap-2', group.color)}>
                <span>{group.icon}</span>
                <h3 className="font-medium">{group.label}</h3>
                <span className="text-xs text-muted-foreground">
                  ({group.prayers.length})
                </span>
              </div>
              
              <div className="space-y-1.5 pl-6">
                {group.prayers.map(prayer => (
                  <div
                    key={prayer.id}
                    className={cn(
                      'flex items-start justify-between gap-2 p-2 rounded-lg',
                      'bg-secondary/50 group'
                    )}
                  >
                    <span className="text-sm text-foreground flex-1">
                      {prayer.content}
                    </span>
                    <button
                      onClick={() => removePrayerRequest(prayer.id)}
                      className={cn(
                        'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
                        'hover:bg-destructive/20 text-destructive'
                      )}
                      aria-label="Remove prayer request"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Prayers are grouped by type on the pastor's display.
      </p>
    </div>
  );
}
