import { Link } from 'react-router-dom';
import { Monitor, Tablet, ChevronRight, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col dark">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo/Icon */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20">
                <Heart className="text-primary" size={40} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Church Teleprompter
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-md mx-auto">
            Simple, reliable teleprompter for prayer requests, announcements, and more.
          </p>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
            {/* Controller Card */}
            <Link
              to="/controller"
              className={cn(
                'group flex flex-col items-center p-8 rounded-2xl transition-all duration-300',
                'bg-card border border-border hover:border-primary/50',
                'hover:shadow-lg hover:shadow-primary/10',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-16 h-16 rounded-xl mb-4 transition-all duration-300',
                'bg-secondary group-hover:bg-primary/20'
              )}>
                <Monitor className="text-foreground group-hover:text-primary transition-colors" size={28} />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Controller</h2>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Manage content from PC
              </p>
              <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Open</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </Link>

            {/* Display Card */}
            <Link
              to="/display"
              className={cn(
                'group flex flex-col items-center p-8 rounded-2xl transition-all duration-300',
                'bg-card border border-border hover:border-primary/50',
                'hover:shadow-lg hover:shadow-primary/10',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-16 h-16 rounded-xl mb-4 transition-all duration-300',
                'bg-secondary group-hover:bg-primary/20'
              )}>
                <Tablet className="text-foreground group-hover:text-primary transition-colors" size={28} />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Display</h2>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Pastor's iPad view
              </p>
              <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Open</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </Link>
          </div>

          {/* Instructions */}
          <div className="mt-12 p-6 rounded-xl bg-card/50 border border-border text-left">
            <h3 className="font-semibold text-foreground mb-3">Quick Start</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium shrink-0">1</span>
                <span>Open <strong className="text-foreground">Controller</strong> on your PC to manage content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium shrink-0">2</span>
                <span>Open <strong className="text-foreground">Display</strong> on the pastor's iPad</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium shrink-0">3</span>
                <span>Type content in the editor — it syncs automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium shrink-0">4</span>
                <span>Use tabs to switch between Prayer Requests, Birthdays, and more</span>
              </li>
            </ol>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <p className="text-center text-sm text-muted-foreground">
          Built with care for worship services
        </p>
      </footer>
    </div>
  );
};

export default Index;
