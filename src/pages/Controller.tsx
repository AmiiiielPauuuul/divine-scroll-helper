import { TeleprompterProvider, useTeleprompter } from '@/contexts/TeleprompterContext';
import {
  TabSelector,
  DisplayTabSelector,
  ContentEditor,
  TeleprompterDisplay,
  PrayerRequestInput,
} from '@/components/teleprompter';
import { cn } from '@/lib/utils';
import { Monitor, Tablet, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

function ControllerContent() {
  const { activeTab, displayTab, tabs } = useTeleprompter();
  const currentTab = tabs.find(t => t.id === activeTab);
  const displayTabData = tabs.find(t => t.id === displayTab);

  return (
    <div className="min-h-screen bg-background flex flex-col dark">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
                <Monitor className="text-primary" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Church Teleprompter</h1>
                <p className="text-sm text-muted-foreground">Controller Interface</p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Link
                to="/display"
                target="_blank"
                className={cn(
                  'flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 w-full sm:w-auto',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50'
                )}
              >
                <Tablet size={18} />
                <span>Open Display</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 h-auto lg:h-[calc(100vh-12rem)]">
          {/* Left Panel - Editor */}
          <div className="flex flex-col bg-card rounded-xl border border-border overflow-hidden min-h-[70vh] lg:min-h-0 lg:col-span-3">
            {/* Tab Selector for Editing */}
            <div className="p-4 border-b border-border bg-card/50">
              <p className="text-xs text-muted-foreground mb-2">Edit content for:</p>
              <TabSelector />
            </div>

            {/* Content Editor - Show PrayerRequestInput for prayers tab */}
            <div className="flex-1 p-4 overflow-auto">
              {activeTab === 'prayers' ? (
                <PrayerRequestInput />
              ) : (
                <ContentEditor className="h-full" />
              )}
            </div>

            {/* Editor Footer */}
            <div className="p-4 border-t border-border bg-card/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Changes sync automatically
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {currentTab?.content.length || 0} characters
              </div>
            </div>
          </div>

          {/* Right Panel - Preview & Display Control */}
          <div className="flex flex-col bg-card rounded-xl border border-border overflow-hidden min-h-[60vh] lg:min-h-0 lg:col-span-1">
            {/* Display Tab Selector */}
            <div className="p-4 border-b border-border bg-card/50">
              <DisplayTabSelector />
            </div>

            {/* Preview Header */}
            <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{displayTabData?.icon}</span>
                <h2 className="text-sm font-medium text-foreground">
                  Showing: {displayTabData?.label}
                </h2>
              </div>
            </div>

            {/* Preview Display */}
            <div className="flex-1 overflow-hidden rounded-b-xl min-h-[50vh] lg:min-h-0">
              <TeleprompterDisplay showTabIndicator={false} />
            </div>

            {/* Font Size Control */}
            <div className="p-4 border-t border-border bg-card/50" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3">
        <div className="container max-w-7xl mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Controller() {
  return (
    <TeleprompterProvider>
      <ControllerContent />
    </TeleprompterProvider>
  );
}
