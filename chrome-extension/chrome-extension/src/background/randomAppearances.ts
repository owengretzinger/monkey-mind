import { monkeyPreferencesStorage } from '@extension/storage';

export async function triggerMonkey(tabId: number) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab?.url || tab.url.startsWith('chrome://')) {
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/index.iife.js'],
    });

    await chrome.tabs.sendMessage(tabId, { type: 'COME_HERE' });
  } catch (error) {
    console.log('Error triggering monkey:', error);
  }
}

export async function scheduleNext() {
  const prefs = await monkeyPreferencesStorage.get();
  if (!prefs.randomAppearances) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await triggerMonkey(tab.id);
  }

  const randomInterval = Math.floor(Math.random() * (prefs.maxInterval - prefs.minInterval) + prefs.minInterval);
  setTimeout(scheduleNext, randomInterval);
}

export function initializeRandomAppearances() {
  // Start the scheduling loop
  scheduleNext();

  // Handle tab activation
  chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const prefs = await monkeyPreferencesStorage.get();
    if (prefs.randomAppearances && Math.random() < prefs.tabSwitchChance) {
      await triggerMonkey(tabId);
    }
  });
}
