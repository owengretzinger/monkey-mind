import { useState, useCallback, useEffect, useRef } from 'react';
import { HATS, monkeyStateStorage } from '@extension/storage';
import { SERVER_URL } from '@extension/shared';

export function useMonkeyText(selectedHat: string) {
  const [speechText, setSpeechText] = useState<string>('');
  const timeoutsRef = useRef<{ speech?: number; state?: number }>({});

  const generateText = useCallback(async () => {
    // Clear existing timeouts
    if (timeoutsRef.current.speech) clearTimeout(timeoutsRef.current.speech);
    if (timeoutsRef.current.state) clearTimeout(timeoutsRef.current.state);

    await monkeyStateStorage.setAction('thinking');

    const pageContent = document.body.innerText;
    const currentHat = HATS.find(h => h.id === selectedHat);
    if (!currentHat) {
      console.error('No hat found for selectedHat:', selectedHat);
      return;
    }

    try {
      console.log('generating');
      const response = await fetch(SERVER_URL + '/api/mascot/cheer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageContent,
          personality: currentHat.personality_for_prompt,
        }),
      });
      const data = await response.json();
      console.log('Generated text:', data.message);
      setSpeechText(data.message);
      await monkeyStateStorage.setAction('talking');

      // Set timeout to stop talking animation after 4 seconds
      timeoutsRef.current.state = window.setTimeout(() => {
        monkeyStateStorage.setAction('idle');
      }, 4000);

      // Set timeout to clear speech bubble after 10 seconds
      timeoutsRef.current.speech = window.setTimeout(() => {
        setSpeechText('');
      }, 10000);
    } catch (error) {
      console.error('Error generating text:', error);
      monkeyStateStorage.setAction('idle');
    }
  }, [selectedHat]);

  useEffect(() => {
    const messageListener = (message: { type: string }) => {
      if (message.type === 'GENERATE_TEXT') {
        generateText();
      }
    };

    // Store timeouts reference that won't change
    const timeouts = timeoutsRef.current;

    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      if (timeouts.speech) clearTimeout(timeouts.speech);
      if (timeouts.state) clearTimeout(timeouts.state);
    };
  }, [generateText]);

  return { speechText, generateText };
}
