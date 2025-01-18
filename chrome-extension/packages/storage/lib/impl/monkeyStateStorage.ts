import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

type MonkeyState = 'hiding' | 'walking' | 'talking' | 'dragging' | 'idle' | 'leaving' | 'thinking';

interface Position {
  x: number;
  y: number;
}

interface MonkeyData {
  position: Position;
  state: MonkeyState;
}

type MonkeyStorage = BaseStorage<MonkeyData> & {
  setPosition: (position: Position) => Promise<void>;
  setState: (state: MonkeyState) => Promise<void>;
};

const storage = createStorage<MonkeyData>(
  'monkey-data',
  {
    position: {
      x: Math.floor(window.innerWidth / 4),
      y: Math.floor(window.innerHeight * 0.25),
    },
    state: 'idle',
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
  setState: async (state: MonkeyState) => {
    const current = await storage.get();
    await storage.set({ ...current, state });
  },
};

export type { MonkeyState, Position, MonkeyData, MonkeyStorage };
