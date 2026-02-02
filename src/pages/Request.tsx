import { useState } from 'react';
import { TeleprompterProvider, useTeleprompter } from '@/contexts/TeleprompterContext';
import { cn } from '@/lib/utils';
import { HeartHandshake } from 'lucide-react';

function RequestContent() {
  const { prayerTypes, addPrayerRequest } = useTeleprompter();
  const [nameOrRequest, setNameOrRequest] = useState('');
  const [specificPrayer, setSpecificPrayer] = useState('');
  const [selectedType, setSelectedType] = useState(prayerTypes[0]?.id || '');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameOrRequest.trim() || !selectedType) return;

    addPrayerRequest(selectedType, nameOrRequest.trim(), specificPrayer.trim() || undefined);
    setNameOrRequest('');
    setSpecificPrayer('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col dark">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15">
              <HeartHandshake className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Submit a Prayer Request</h1>
              <p className="text-sm text-muted-foreground">Your request appears on the controller and display.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Category</label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-sm',
                  'bg-card border border-border',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
              >
                {prayerTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Name or request</label>
              <input
                type="text"
                value={nameOrRequest}
                onChange={e => setNameOrRequest(e.target.value)}
                placeholder="e.g., John Smith" 
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-sm',
                  'bg-card border border-border',
                  'placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Specific prayer (optional)</label>
              <textarea
                value={specificPrayer}
                onChange={e => setSpecificPrayer(e.target.value)}
                placeholder="e.g., healing, guidance, peace"
                rows={3}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-sm',
                  'bg-card border border-border',
                  'placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
              />
            </div>

            <button
              type="submit"
              className={cn(
                'w-full px-4 py-2 rounded-lg text-sm font-medium',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'transition-colors'
              )}
            >
              Submit Request
            </button>

            {submitted && (
              <div className="text-sm text-green-400 text-center">Request submitted.</div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

export default function Request() {
  return (
    <TeleprompterProvider>
      <RequestContent />
    </TeleprompterProvider>
  );
}
