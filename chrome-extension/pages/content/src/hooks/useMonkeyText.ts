import { useState, useCallback, useEffect } from 'react';
import { HATS } from '@extension/storage';

export function useMonkeyText(selectedHat: string) {
  const [speechText, setSpeechText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const generateText = useCallback(
    async (mock = false) => {
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
        setTimeout(() => setIsSpeaking(false), 4000);
        setTimeout(() => setSpeechText(''), 10000);
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
    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [generateText]);

  return {
    speechText,
    isSpeaking,
    generateText,
  };
}
