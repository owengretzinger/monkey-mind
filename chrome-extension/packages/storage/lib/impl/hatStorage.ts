import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

const HAT_NAMES = {
  NONE: 'none',
  THINKING: 'thinking cap',
  JESTER: 'jester hat',
  LOVE_HEART: 'love heart hat',
  BANANA: 'banana hat',
  CROWN: 'crown hat',
  WIZARD: 'wizard hat',
  PIRATE: 'pirate hat',
  COWBOY: 'cowboy hat',
  CHEF: 'chef hat',
  PARTY: 'party hat',
  SANTA: 'santa hat',
  BASEBALL: 'baseball cap',
  TOP: 'top hat',
  BOWLER: 'bowler hat',
} as const;

type Hat = (typeof HAT_NAMES)[keyof typeof HAT_NAMES];

export const HATS: Hat[] = Object.values(HAT_NAMES);

type HatStorage = BaseStorage<Hat> & {
  setHat: (hat: Hat) => Promise<void>;
};

const storage = createStorage<Hat>('hat-storage-key', 'none', {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const hatStorage: HatStorage = {
  ...storage,
  setHat: async (hat: Hat) => {
    await storage.set(hat);
  },
};
