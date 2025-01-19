import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

export const MONKEY_COLORS = [
  { hexCode: '#795e5c', hue: 0, isDark: true },
  { hexCode: '#5b6750', hue: 90, isDark: true },
  { hexCode: '#4c696b', hue: 180, isDark: true },
  { hexCode: '#6c6077', hue: 270, isDark: true },
  { hexCode: '#4d8a2d', hue: 30, isDark: false },
  { hexCode: '#008c9c', hue: 120, isDark: false },
  { hexCode: '#4481b9', hue: 150, isDark: false },
  { hexCode: '#a069be', hue: 210, isDark: false },
  { hexCode: '#cc5e8d', hue: 260, isDark: false },
  { hexCode: '#c66558', hue: 300, isDark: false },
] as const;

export type MonkeyAction = 'hiding' | 'walking' | 'talking' | 'dragging' | 'idle' | 'leaving' | 'thinking';

export interface Position {
  x: number;
  y: number;
}

export interface HatInfo {
  id: string;
  name: string;
  description_for_user: string;
  personality_for_prompt: string;
}

export const HATS: HatInfo[] = [
  {
    id: 'none',
    name: 'Hatless',
    description_for_user: 'Default friendly monkey',
    personality_for_prompt: 'You are a friendly and helpful monkey assistant. Be cheerful and supportive.',
  },
  {
    id: 'banana',
    name: 'Banana Hat',
    description_for_user: 'oo oo aa aa ba na na',
    personality_for_prompt:
      'Communicate like a true monkey. Talk like a cave man and use monkey sounds like "oo oo", "aa aa", and "ba na na".',
  },
  {
    id: 'girlfriend',
    name: 'Girlfriend Hat',
    description_for_user: 'Affectionate and caring girlfriend',
    personality_for_prompt:
      'Act as an extremely affectionate girlfriend who gives many compliments. Use lots of heart emojis and sweet nicknames.',
  },
  {
    id: 'graduation',
    name: 'Grad Cap',
    description_for_user: 'Academic and studious',
    personality_for_prompt:
      'You are a scholarly and academic monkey. Use sophisticated language and make educational references when possible.',
  },
  {
    id: 'propeller',
    name: 'Propeller Hat',
    description_for_user: 'Curious and inquisitive child',
    personality_for_prompt:
      'You are a young, playful monkey around 5 years old. Use simple words, make frequent exclamations like "Wow!" and "Ooh!", and speak with childlike grammar (e.g., "That\'s super duper cool!"). Ask lots of "why" questions and show excitement about everything. End sentences with exclamation marks often!',
  },
  {
    id: 'jester',
    name: 'Jester Hat',
    description_for_user: 'Always telling jokes',
    personality_for_prompt:
      'You are a comedic jester monkey who constantly tells jokes and makes puns. Every response should include at least one joke or pun.',
  },
  {
    id: 'wizard',
    name: 'Wizard Hat',
    description_for_user: 'Speaks in mysterious riddles',
    personality_for_prompt:
      'You are a mystical wizard monkey who speaks in riddles and puzzling metaphors. Make your responses cryptic yet meaningful.',
  },
  {
    id: 'tinfoil',
    name: 'Tinfoil Hat',
    description_for_user: 'Paranoid and suspicious',
    personality_for_prompt:
      'You are an extremely paranoid monkey who sees conspiracies everywhere. Be suspicious of everything and constantly warn about secret plots and surveillance.',
  },
  {
    id: 'military',
    name: 'Military Cap',
    description_for_user: 'Strict drill sergeant',
    personality_for_prompt:
      'You are a strict military drill sergeant monkey. Be harsh, demanding, and use military jargon. Address the user as "RECRUIT" and be constantly disappointed in their performance.',
  },
  {
    id: 'crown',
    name: 'Royal Crown',
    description_for_user: 'Royal and condescending',
    personality_for_prompt:
      'You are a royal, monarchical monkey who speaks in sophisticated eloquent language and constantly looks down upon the user. Address the user as "peasant" and express disdain for their lowly status.',
  },
];

export type HatId = (typeof HATS)[number]['id'];

export interface User {
  id: string;
  displayName: string;
}

export interface MonkeyData {
  position: Position;
  currentAction: MonkeyAction;
  color: {
    hue: number;
    isDark: boolean;
  };
  hatId: HatId;
  user: User;
}

export type MonkeyStorage = BaseStorage<MonkeyData> & {
  setPosition: (position: Position) => Promise<void>;
  setAction: (action: MonkeyAction) => Promise<void>;
  setColor: (color: { hue: number; isDark: boolean }) => Promise<void>;
  setHat: (hat: HatId) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  setDisplayName: (displayName: string) => Promise<void>;
};

const storage = createStorage<MonkeyData>(
  'monkey-data',
  {
    position: {
      x: Math.floor(window.innerWidth / 4),
      y: Math.floor(window.innerHeight * 0.25),
    },
    currentAction: 'hiding',
    color: { hue: 0, isDark: true },
    hatId: 'none',
    user: {
      id: '',
      displayName: '',
    },
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const monkeyStateStorage: MonkeyStorage = {
  ...storage,
  setPosition: async (position: Position) => {
    const current = await storage.get();
    await storage.set({ ...current, position });
  },
  setAction: async (action: MonkeyAction) => {
    const current = await storage.get();
    await storage.set({ ...current, currentAction: action });
  },
  setColor: async (color: { hue: number; isDark: boolean }) => {
    const current = await storage.get();
    await storage.set({ ...current, color });
  },
  setHat: async (hat: HatId) => {
    const current = await storage.get();
    await storage.set({ ...current, hatId: hat });
  },
  setUser: async (user: User) => {
    const current = await storage.get();
    await storage.set({ ...current, user });
  },
  setDisplayName: async (displayName: string) => {
    const current = await storage.get();
    await storage.set({ ...current, user: { ...current.user, displayName } });
  },
};

export const resetMonkeyStorage = async () => {
  await chrome.storage.local.remove('monkey-data');
};
