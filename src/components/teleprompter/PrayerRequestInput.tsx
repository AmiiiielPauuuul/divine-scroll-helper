import { useState } from 'react';
import { useTeleprompter } from '@/contexts/TeleprompterContext';
import { PRAYER_TYPES, PrayerType, PrayerRequest } from '@/types/teleprompter';
import { cn } from '@/lib/utils';
import { Plus, X, GripVertical, ChevronDown } from 'lucide-react';

export function PrayerRequestInput() {
  const { addPrayerRequest, prayerRequests, removePrayerRequest, reorderPrayerRequest, updatePrayerType } = useTeleprompter();
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<PrayerType>('healing');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

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

  const handleDragStart = (e: React.DragEvent, prayer: PrayerRequest) => {
    setDraggedId(prayer.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', prayer.id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (targetId !== draggedId) {
      setDragOverId(targetId);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      reorderPrayerRequest(draggedId, targetId);
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Drop on category header to change type
  const handleDropOnCategory = (e: React.DragEvent, newType: PrayerType) => {
    e.preventDefault();
    if (draggedId) {
      updatePrayerType(draggedId, newType);
    }
    setDraggedId(null);
    setDragOverId(null);
  };

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

      {/* Prayer List by Type - Draggable Tiles */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {groupedPrayers.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">
            No prayer requests yet. Add one above.
          </p>
        ) : (
          groupedPrayers.map(group => (
            <div key={group.id} className="space-y-2">
              {/* Category Header - Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => handleDropOnCategory(e, group.id)}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg transition-colors',
                  group.color,
                  draggedId && 'border-2 border-dashed border-primary/50'
                )}
              >
                <span>{group.icon}</span>
                <h3 className="font-medium">{group.label}</h3>
                <span className="text-xs text-muted-foreground">
                  ({group.prayers.length})
                </span>
                {draggedId && (
                  <span className="text-xs text-primary ml-auto">Drop here to move</span>
                )}
              </div>
              
              {/* Prayer Tiles */}
              <div className="space-y-2 pl-2">
                {group.prayers.map(prayer => (
                  <PrayerTile
                    key={prayer.id}
                    prayer={prayer}
                    isDragging={draggedId === prayer.id}
                    isDragOver={dragOverId === prayer.id}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onRemove={removePrayerRequest}
                    onTypeChange={updatePrayerType}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        {/* Empty drop zones for categories with no prayers */}
        {draggedId && (
          <div className="space-y-2 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Move to another category:</p>
            {PRAYER_TYPES.filter(t => !groupedPrayers.find(g => g.id === t.id)).map(type => (
              <div
                key={type.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => handleDropOnCategory(e, type.id)}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg',
                  'border-2 border-dashed border-primary/30',
                  'hover:border-primary/60 hover:bg-primary/10',
                  'transition-colors cursor-pointer',
                  type.color
                )}
              >
                <span>{type.icon}</span>
                <span className="text-sm">{type.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        Drag tiles to reorder or move between groups.
      </p>
    </div>
  );
}

interface PrayerTileProps {
  prayer: PrayerRequest;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent, prayer: PrayerRequest) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onRemove: (id: string) => void;
  onTypeChange: (id: string, type: PrayerType) => void;
}

function PrayerTile({
  prayer,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onRemove,
  onTypeChange,
}: PrayerTileProps) {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const currentType = PRAYER_TYPES.find(t => t.id === prayer.type);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, prayer)}
      onDragOver={(e) => onDragOver(e, prayer.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, prayer.id)}
      onDragEnd={onDragEnd}
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg',
        'bg-secondary/50 border border-border',
        'cursor-grab active:cursor-grabbing',
        'transition-all duration-200',
        'group hover:bg-secondary/80',
        isDragging && 'opacity-50 scale-95',
        isDragOver && 'border-primary bg-primary/10 scale-[1.02]'
      )}
    >
      {/* Drag Handle */}
      <div className="text-muted-foreground hover:text-foreground transition-colors">
        <GripVertical size={16} />
      </div>

      {/* Content */}
      <span className="text-sm text-foreground flex-1">{prayer.content}</span>

      {/* Type Selector */}
      <div className="relative">
        <button
          onClick={() => setShowTypeMenu(!showTypeMenu)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs',
            'bg-background/50 hover:bg-background transition-colors',
            currentType?.color
          )}
        >
          <span>{currentType?.icon}</span>
          <ChevronDown size={12} />
        </button>

        {showTypeMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowTypeMenu(false)} 
            />
            <div className={cn(
              'absolute right-0 top-full mt-1 z-50',
              'bg-popover border border-border rounded-lg shadow-lg',
              'min-w-[140px] py-1',
              'animate-fade-in'
            )}>
              {PRAYER_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    onTypeChange(prayer.id, type.id);
                    setShowTypeMenu(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm',
                    'hover:bg-accent transition-colors',
                    prayer.type === type.id && 'bg-accent/50'
                  )}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(prayer.id)}
        className={cn(
          'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-destructive/20 text-destructive'
        )}
        aria-label="Remove prayer request"
      >
        <X size={14} />
      </button>
    </div>
  );
}
