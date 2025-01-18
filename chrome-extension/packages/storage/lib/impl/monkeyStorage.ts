import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

interface Position {
  x: number;
  y: number;
}

type MonkeyStorage = BaseStorage<Position> & {
  setPosition: (position: Position) => Promise<void>;
};

const storage = createStorage<Position>(
  'monkey-position',
  { x: -100, y: Math.floor(window.innerHeight * 0.25) },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const monkeyStorage: MonkeyStorage = {
  ...storage,
  setPosition: async (position: Position) => {
    await storage.set(position);
  },
};
