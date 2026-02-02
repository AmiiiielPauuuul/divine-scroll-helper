import { useState } from 'react';
import { useTeleprompter } from '@/contexts/TeleprompterContext';
import { PrayerType, PrayerRequest, PrayerTypeInfo } from '@/types/teleprompter';
import { cn } from '@/lib/utils';
import { Plus, X, GripVertical, Settings, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Available colors for prayer types
const TYPE_COLORS = [
  { label: 'Red', value: 'text-red-500' },
  { label: 'Yellow', value: 'text-yellow-500' },
  { label: 'Blue', value: 'text-blue-500' },
];

export function PrayerRequestInput() {
  const {
    addPrayerRequest,
    prayerRequests,
    prayerTypes,
    removePrayerRequest,
    updatePrayerRequest,
    reorderPrayerRequest,
    updatePrayerType,
    addPrayerType,
    removePrayerType,
    clearPrayerRequests,
  } = useTeleprompter();

  const [content, setContent] = useState('');
  const [specificPrayer, setSpecificPrayer] = useState('');
  const [selectedType, setSelectedType] = useState<PrayerType>(prayerTypes[0]?.id || '');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const [showTypeManager, setShowTypeManager] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeColor, setNewTypeColor] = useState('text-blue-500');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && selectedType) {
      addPrayerRequest(selectedType, content.trim(), specificPrayer.trim() || undefined);
      setContent('');
      setSpecificPrayer('');
    }
  };

  const handleAddType = () => {
    if (newTypeName.trim()) {
      addPrayerType({
        label: newTypeName.trim(),
        icon: '🙏',
        color: newTypeColor,
      });
      setNewTypeName('');
      setNewTypeColor('text-blue-500');
    }
  };

  // Group prayers by type
  const groupedPrayers = prayerTypes.map(type => ({
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

  const handleDragOverCategory = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (groupId !== dragOverGroupId) {
      setDragOverGroupId(groupId);
    }
  };

  const handleDragLeaveCategory = () => {
    setDragOverGroupId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedId && draggedId !== targetId) {
      reorderPrayerRequest(draggedId, targetId);
    }
    setDraggedId(null);
    setDragOverId(null);
    setDragOverGroupId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    setDragOverGroupId(null);
  };

  const handleDropOnCategory = (e: React.DragEvent, newType: PrayerType) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedId) {
      updatePrayerType(draggedId, newType);
    }
    setDraggedId(null);
    setDragOverId(null);
    setDragOverGroupId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Type Manager Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🙏</span>
          <h2 className="text-xl font-semibold text-foreground">Prayer Requests</h2>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={!prayerRequests.length}
                className={cn(
                  'flex items-center justify-center p-2 rounded-lg text-sm transition-all',
                  'bg-destructive/10 text-destructive hover:bg-destructive/20',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
                aria-label="Clear all prayer requests"
                title="Clear all"
              >
                <Trash2 size={14} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all prayer requests?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove all prayer requests from the controller and display.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => clearPrayerRequests()}
                >
                  Yes, clear all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <button
            onClick={() => setShowTypeManager(!showTypeManager)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all',
              showTypeManager
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            <Settings size={14} />
            <span>Categories</span>
          </button>
        </div>
      </div>

      {/* Type Manager Panel */}
      {showTypeManager && (
        <div className="mb-4 p-4 rounded-lg bg-muted/50 border border-border animate-fade-in">
          <h3 className="text-sm font-medium text-foreground mb-3">Manage Categories</h3>

          {/* Add New Type */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              placeholder="Category name..."
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-sm',
                'bg-card border border-border',
                'placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
            />
            <select
              value={newTypeColor}
              onChange={e => setNewTypeColor(e.target.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm',
                'bg-card border border-border',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
            >
              {TYPE_COLORS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddType}
              disabled={!newTypeName.trim()}
              className={cn(
                'px-3 py-2 rounded-lg text-sm transition-all',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Existing Types */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {prayerTypes.map(type => (
              <div
                key={type.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-card/50"
              >
                <span className={cn('flex-1 text-sm', type.color)}>{type.label}</span>
                <button
                  onClick={() => removePrayerType(type.id)}
                  disabled={prayerTypes.length <= 1}
                  className={cn(
                    'p-1 rounded hover:bg-destructive/20 text-destructive transition-colors',
                    'disabled:opacity-30 disabled:cursor-not-allowed'
                  )}
                  aria-label={`Remove ${type.label}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Prayer Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        {/* Type Selector */}
        <div className="flex flex-wrap gap-2 mb-3">
          {prayerTypes.map(type => (
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
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Person's name or request..."
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
              disabled={!content.trim() || !selectedType}
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
          <textarea
            value={specificPrayer}
            onChange={e => setSpecificPrayer(e.target.value)}
            placeholder="Specific prayer (optional): scripture, healing from surgery, guidance for decisions..."
            rows={2}
            className={cn(
              'w-full px-4 py-2 rounded-lg resize-none',
              'bg-card text-card-foreground',
              'border border-border',
              'placeholder:text-muted-foreground/60',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
              'text-sm'
            )}
          />
        </div>
      </form>

      {/* Prayer List by Type - Draggable Tiles */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 sm:px-3">
        {groupedPrayers.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">
            No prayer requests yet. Add one above.
          </p>
        ) : (
          groupedPrayers.map(group => (
            <div
              key={group.id}
              className={cn(
                'space-y-2 rounded-lg p-3 -m-3 transition-colors',
                dragOverGroupId === group.id && 'bg-primary/10'
              )}
              onDragOver={(e) => handleDragOverCategory(e, group.id)}
              onDragLeave={handleDragLeaveCategory}
              onDrop={(e) => handleDropOnCategory(e, group.id)}
            >
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
              <div className="space-y-2">
                {group.prayers.map(prayer => (
                  <PrayerTile
                    key={prayer.id}
                    prayer={prayer}
                    prayerTypes={prayerTypes}
                    isDragging={draggedId === prayer.id}
                    isDragOver={dragOverId === prayer.id}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onRemove={removePrayerRequest}
                    onTypeChange={updatePrayerType}
                    onUpdatePrayer={updatePrayerRequest}
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
            {prayerTypes.filter(t => !groupedPrayers.find(g => g.id === t.id)).map(type => (
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
        Drag tiles to reorder or drop on a category to reassign. Click "Categories" to add/remove types.
      </p>
    </div>
  );
}

interface PrayerTileProps {
  prayer: PrayerRequest;
  prayerTypes: PrayerTypeInfo[];
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent, prayer: PrayerRequest) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onRemove: (id: string) => void;
  onTypeChange: (id: string, type: PrayerType) => void;
  onUpdatePrayer: (id: string, updates: Partial<Omit<PrayerRequest, 'id' | 'createdAt'>>) => void;
}

function PrayerTile({
  prayer,
  prayerTypes,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onRemove,
  onTypeChange,
  onUpdatePrayer,
}: PrayerTileProps) {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [isEditingPrayer, setIsEditingPrayer] = useState(false);
  const [editedSpecificPrayer, setEditedSpecificPrayer] = useState(prayer.specificPrayer || '');
  const currentType = prayerTypes.find(t => t.id === prayer.type);

  const handleSaveSpecificPrayer = () => {
    onUpdatePrayer(prayer.id, { specificPrayer: editedSpecificPrayer.trim() || undefined });
    setIsEditingPrayer(false);
  };

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
        prayer.completed && 'opacity-60',
        isDragging && 'opacity-50 scale-95',
        isDragOver && 'border-primary bg-primary/10 scale-[1.02]'
      )}
    >
      {/* Drag Handle */}
      <div className="text-muted-foreground hover:text-foreground transition-colors">
        <GripVertical size={16} />
      </div>

      {/* Done Checkbox */}
      <input
        type="checkbox"
        checked={!!prayer.completed}
        onChange={(e) => onUpdatePrayer(prayer.id, { completed: e.target.checked })}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        draggable={false}
        className={cn(
          'h-4 w-4 rounded border-border',
          'text-primary focus:ring-2 focus:ring-primary/50'
        )}
        aria-label={`Mark ${prayer.content} as prayed`}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className={cn(
          'text-sm font-semibold text-foreground',
          prayer.completed && 'line-through text-muted-foreground'
        )}>
          {prayer.content}
        </span>
        {isEditingPrayer ? (
          <div className="mt-1 flex gap-1 pl-4">
            <input
              type="text"
              value={editedSpecificPrayer}
              onChange={e => setEditedSpecificPrayer(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveSpecificPrayer();
                if (e.key === 'Escape') setIsEditingPrayer(false);
              }}
              placeholder="Add specific prayer..."
              className={cn(
                'flex-1 px-2 py-1 rounded text-[11px]',
                'bg-background border border-border',
                'focus:outline-none focus:ring-1 focus:ring-primary/50'
              )}
              autoFocus
            />
            <button
              onClick={handleSaveSpecificPrayer}
              className="px-2 py-1 rounded text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingPrayer(true)}
            className={cn(
              'text-[11px] mt-0.5 cursor-pointer hover:text-primary transition-colors pl-4',
              prayer.specificPrayer ? 'text-muted-foreground italic' : 'text-muted-foreground/50',
              prayer.completed && 'line-through text-muted-foreground/70'
            )}
          >
            {prayer.specificPrayer || 'Click to add specific prayer...'}
          </div>
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
