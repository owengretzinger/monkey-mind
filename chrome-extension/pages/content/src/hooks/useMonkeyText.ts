import { useState, useCallback, useEffect, useRef } from 'react';
import { HATS } from '@extension/storage';

export function useMonkeyText(selectedHat: string) {
  const [speechText, setSpeechText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timeoutsRef = useRef<{ speaking?: number; text?: number }>({});

  const generateText = useCallback(
    async (mock = false) => {
      // Clear existing timeouts
      if (timeoutsRef.current.speaking) clearTimeout(timeoutsRef.current.speaking);
      if (timeoutsRef.current.text) clearTimeout(timeoutsRef.current.text);

      const pageContent = document.body.innerText;
      const currentHat = HATS.find(h => h.id === selectedHat);
      if (!currentHat) {
        console.error('No hat found for selectedHat:', selectedHat);
        return;
      }
      try {
        if (mock) {
          setIsSpeaking(true);
          setSpeechText("Hello! I'm Monkey Mind. I'm here to give you a new perspective.");
        } else {
          const response = await fetch('http://localhost:3000/api/mascot/cheer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pageContent,
              personality: currentHat.personality_for_prompt,
            }),
          });
          const data = await response.json();
          setIsSpeaking(true);
          setSpeechText(data.message);
        }
      } catch (error) {
        console.error('Error generating text:', error);
      } finally {
        timeoutsRef.current.speaking = setTimeout(() => setIsSpeaking(false), 4000);
        timeoutsRef.current.text = setTimeout(() => setSpeechText(''), 10000);
      }
    },
    [selectedHat],
  );

  useEffect(() => {
    const messageListener = (message: { type: string }) => {
      if (message.type === 'GENERATE_TEXT') {
        generateText();
      }
    };

    // Store the timeouts in a variable that won't change
    const timeouts = timeoutsRef.current;

    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      // Clean up timeouts using the stored variable
      if (timeouts.speaking) clearTimeout(timeouts.speaking);
      if (timeouts.text) clearTimeout(timeouts.text);
    };
  }, [generateText]);

  return {
    speechText,
    isSpeaking,
    generateText,
  };
}
