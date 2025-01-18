import { createStorage } from '../base/base';
import { StorageEnum } from '../base/enums';

interface MonkeyPreferences {
  randomAppearances: boolean;
  minInterval: number; // milliseconds
  maxInterval: number;
  appearanceChance: number;
  tabSwitchChance: number;
}

export const monkeyPreferencesStorage = createStorage<MonkeyPreferences>(
  'monkey-preferences',
  {
    randomAppearances: false,
    minInterval: 5 * 60 * 1000,
    maxInterval: 15 * 60 * 1000,
    appearanceChance: 0,
    tabSwitchChance: 0,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);
