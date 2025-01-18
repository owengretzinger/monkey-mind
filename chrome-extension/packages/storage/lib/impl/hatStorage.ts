import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

export interface HatInfo {
  id: string;
  name: string;
  description: string;
}

export const HATS: HatInfo[] = [
  { id: 'none', name: 'No Hat', description: 'Default friendly monkey personality' },
  { id: 'thinking', name: 'Thinking Cap', description: 'Makes insightful comments' },
  { id: 'propeller', name: 'Propeller Hat', description: 'Playful and silly' },
  { id: 'grad', name: 'Grad Cap', description: 'Academic and studious' },
  { id: 'banana', name: 'Banana Hat', description: 'monke, only say oo oo aa aa and ba na na' },
  { id: 'chef', name: 'Chef Hat', description: 'Shares recipes or food-related tips' },
  { id: 'crown', name: 'Crown', description: 'Regal and commanding' },
  { id: 'pirate', name: 'Pirate Hat', description: 'Speaks in pirate lingo, adventurous' },
  { id: 'jester', name: 'Jester Hat', description: 'Constantly joking and humorous' },
  { id: 'wizard', name: 'Wizard Hat', description: 'Mystical, offers riddles or spells' },
  { id: 'party', name: 'Party Hat', description: 'Excitable, festive, and celebratory' },
  { id: 'top', name: 'Top Hat', description: 'Sophisticated, formal, and polite' },
  { id: 'sports', name: 'Sports Cap', description: 'Competitive, energetic, and team-oriented' },
  { id: 'heart', name: 'Love Heart Hat', description: 'Affectionate and caring, gives compliments' },
];

type HatId = (typeof HATS)[number]['id'];

type HatStorage = BaseStorage<HatId> & {
  setHat: (hat: HatId) => Promise<void>;
};

const storage = createStorage<HatId>('hat-storage-key', 'none', {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const hatStorage: HatStorage = {
  ...storage,
  setHat: async (hat: HatId) => {
    console.log('Selected hat:', hat);
    await storage.set(hat);
  },
};
