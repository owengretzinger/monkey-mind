import 'webextension-polyfill';
import { monkeyPreferencesStorage } from '@extension/storage';

async function triggerMonkey(tabId: number) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab?.url || tab.url.startsWith('chrome://')) {
      return;
    }

    // Inject content script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/index.iife.js'],
    });

    // Send message to content script
    await chrome.tabs.sendMessage(tabId, { type: 'COME_HERE' });
  } catch (error) {
    console.error('Error triggering monkey:', error);
  }
}

async function scheduleNext() {
  const prefs = await monkeyPreferencesStorage.get();
  if (!prefs.randomAppearances) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await triggerMonkey(tab.id);
  }

  // Schedule next appearance with random interval
  const randomInterval = Math.floor(Math.random() * (prefs.maxInterval - prefs.minInterval) + prefs.minInterval);
  setTimeout(scheduleNext, randomInterval);
}

// Start the scheduling loop
scheduleNext();





// Handle tab activation
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const prefs = await monkeyPreferencesStorage.get();
  if (prefs.randomAppearances && Math.random() < prefs.tabSwitchChance) {
    await triggerMonkey(tabId);
  }
});
