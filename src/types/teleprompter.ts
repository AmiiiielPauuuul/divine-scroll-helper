// Teleprompter types for church service application

export type TabId = 'prayers' | 'birthdays' | 'weddings' | 'announcements';

// Prayer request types/categories
export type PrayerType = string;

export interface PrayerTypeInfo {
  id: PrayerType;
  label: string;
  icon: string;
  color: string; // Tailwind color class
}

export const DEFAULT_PRAYER_TYPES: PrayerTypeInfo[] = [
  { id: 'healing', label: 'Healing', icon: '💚', color: 'text-green-400' },
  { id: 'spiritual', label: 'Spiritual Growth', icon: '✨', color: 'text-purple-400' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: 'text-blue-400' },
  { id: 'financial', label: 'Financial', icon: '💰', color: 'text-yellow-400' },
  { id: 'thanksgiving', label: 'Thanksgiving', icon: '🙌', color: 'text-orange-400' },
  { id: 'other', label: 'Other', icon: '🙏', color: 'text-muted-foreground' },
];

export interface PrayerRequest {
  id: string;
  type: PrayerType;
  content: string;
  createdAt: number;
}

export interface Tab {
  id: TabId;
  label: string;
  icon: string;
  content: string;
  placeholder: string;
}

export interface TeleprompterState {
  activeTab: TabId;      // Tab being edited on controller
  displayTab: TabId;     // Tab shown on pastor's display
  tabs: Tab[];
  prayerTypes: PrayerTypeInfo[];  // Dynamic prayer categories
  prayerRequests: PrayerRequest[];  // Typed prayer requests
  scrollSpeed: number; // 0-100, 0 = paused
  isAutoScrolling: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface TeleprompterContextValue extends TeleprompterState {
  setActiveTab: (tabId: TabId) => void;
  setDisplayTab: (tabId: TabId) => void;
  updateTabContent: (tabId: TabId, content: string) => void;
  addPrayerType: (type: Omit<PrayerTypeInfo, 'id'>) => void;
  updatePrayerTypeInfo: (id: string, updates: Partial<Omit<PrayerTypeInfo, 'id'>>) => void;
  removePrayerType: (id: string) => void;
  addPrayerRequest: (type: PrayerType, content: string) => void;
  removePrayerRequest: (id: string) => void;
  reorderPrayerRequest: (draggedId: string, targetId: string) => void;
  updatePrayerType: (id: string, type: PrayerType) => void;
  setScrollSpeed: (speed: number) => void;
  toggleAutoScroll: () => void;
  setFontSize: (size: TeleprompterState['fontSize']) => void;
}

// Default content for each tab
export const DEFAULT_TABS: Tab[] = [
  {
    id: 'prayers',
    label: 'Prayer Requests',
    icon: '🙏',
    content: '',
    placeholder: `Enter prayer requests here...

Each request on a new line
for easy reading.

Example:
• Please pray for the Johnson family
  as they navigate health challenges.

• Lift up our youth group
  preparing for mission trip.

• Remember those grieving
  the loss of loved ones.`,
  },
  {
    id: 'birthdays',
    label: 'Birthdays',
    icon: '🎂',
    content: '',
    placeholder: `Happy Birthday wishes...

• John Smith - January 15
• Mary Johnson - January 18
• The Williams Family
  celebrates three birthdays this week!

May God bless you
with another wonderful year.`,
  },
  {
    id: 'weddings',
    label: 'Weddings',
    icon: '💒',
    content: '',
    placeholder: `Wedding Announcements...

This week we celebrate:

• Michael & Sarah Thompson
  Married Saturday, January 20th
  at Grace Chapel

• Congratulations to David & Emily
  on their upcoming wedding!

"What God has joined together,
let no one separate."
- Matthew 19:6`,
  },
  {
    id: 'announcements',
    label: 'Announcements',
    icon: '📢',
    content: '',
    placeholder: `General Announcements...

• Sunday School begins at 9:30 AM
  Classes for all ages.

• Wednesday Night Bible Study
  Join us at 7:00 PM
  in Fellowship Hall.

• Volunteer sign-ups available
  in the church lobby.

• Next week: Potluck Dinner
  Bring a dish to share!`,
  },
];

export const STORAGE_KEY = 'church-teleprompter-state';
