import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { monkeyPreferencesStorage } from '@extension/storage';

const Options = () => {
  const preferences = useStorage(monkeyPreferencesStorage);

  const updatePreference = async (key: string, value: boolean | number) => {
    const current = await monkeyPreferencesStorage.get();
    await monkeyPreferencesStorage.set({ ...current, [key]: value });
  };

  return (
    <div className="App bg-slate-50 p-8 text-gray-900">
      <h1 className="mb-6 text-2xl font-bold">Monkey Settings</h1>

      <div className="space-y-6">
        {/* Random Appearances Toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor="random-appearances" className="font-medium">
            Random Appearances
          </label>
          <input
            id="random-appearances"
            type="checkbox"
            checked={preferences.randomAppearances}
            onChange={e => updatePreference('randomAppearances', e.target.checked)}
            className="relative h-6 w-11 appearance-none rounded-full bg-gray-200 transition-colors duration-200 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] checked:bg-blue-500 checked:after:translate-x-5"
          />
        </div>

        {/* Time Intervals */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-medium">
              Minimum Interval: {(preferences.minInterval / 60000).toFixed(1)} minutes
            </label>
            <input
              type="range"
              min="0.1"
              max="30"
              step="0.1"
              value={preferences.minInterval / 60000}
              onChange={e => updatePreference('minInterval', Number(e.target.value) * 60000)}
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Maximum Interval: {(preferences.maxInterval / 60000).toFixed(1)} minutes
            </label>
            <input
              type="range"
              min="0.2"
              max="60"
              step="0.1"
              value={preferences.maxInterval / 60000}
              onChange={e => updatePreference('maxInterval', Number(e.target.value) * 60000)}
              className="w-full"
            />
          </div>
        </div>

        {/* Appearance Chances */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-medium">
              Appearance Chance: {Math.round(preferences.appearanceChance * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={preferences.appearanceChance * 100}
              onChange={e => updatePreference('appearanceChance', Number(e.target.value) / 100)}
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Tab Switch Chance: {Math.round(preferences.tabSwitchChance * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={preferences.tabSwitchChance * 100}
              onChange={e => updatePreference('tabSwitchChance', Number(e.target.value) / 100)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <div> Loading ... </div>), <div> Error Occur </div>);
