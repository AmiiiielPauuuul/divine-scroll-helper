import { useTeleprompter } from '@/contexts/TeleprompterContext';
import { cn } from '@/lib/utils';

const FONT_SIZE_CLASSES = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
  '2xl': 'text-4xl',
};

interface PrayerDisplayProps {
  className?: string;
}

export function PrayerDisplay({ className }: PrayerDisplayProps) {
  const { prayerRequests, prayerTypes, fontSize } = useTeleprompter();

  // Group prayers by type using dynamic prayerTypes
  const groupedPrayers = prayerTypes.map(type => ({
    ...type,
    prayers: prayerRequests.filter(p => p.type === type.id),
  })).filter(group => group.prayers.length > 0);

  if (groupedPrayers.length === 0) {
    return (
      <div className={cn('text-teleprompter-text/60 italic', FONT_SIZE_CLASSES[fontSize], className)}>
        No prayer requests to display...
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {groupedPrayers.map(group => (
        <div key={group.id} className="space-y-4">
          {/* Category Header */}
          <div className={cn(
            'flex items-center gap-3 pb-2 border-b border-teleprompter-text/20',
            group.color
          )}>
            <span className={cn(
              fontSize === 'sm' ? 'text-2xl' :
              fontSize === 'md' ? 'text-3xl' :
              fontSize === 'lg' ? 'text-4xl' :
              fontSize === 'xl' ? 'text-5xl' : 'text-6xl'
            )}>
              {group.icon}
            </span>
            <h2 className={cn(
              'font-semibold text-teleprompter-text',
              fontSize === 'sm' ? 'text-xl' :
              fontSize === 'md' ? 'text-2xl' :
              fontSize === 'lg' ? 'text-3xl' :
              fontSize === 'xl' ? 'text-4xl' : 'text-5xl'
            )}>
              {group.label}
            </h2>
          </div>

          {/* Prayer Items */}
          <div className="space-y-3 pl-4">
            {group.prayers.map(prayer => (
              <div
                key={prayer.id}
                className={cn(
                  'flex items-start gap-3',
                  FONT_SIZE_CLASSES[fontSize],
                  'text-teleprompter-text leading-relaxed'
                )}
              >
                <span className={cn(
                  'flex-shrink-0',
                  fontSize === 'sm' ? 'text-lg' :
                  fontSize === 'md' ? 'text-xl' :
                  fontSize === 'lg' ? 'text-2xl' :
                  fontSize === 'xl' ? 'text-3xl' : 'text-4xl'
                )}>
                  {group.icon}
                </span>
                <span>{prayer.content}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
