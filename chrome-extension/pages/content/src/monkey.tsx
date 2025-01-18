import { useEffect, useState, useCallback } from 'react';
import { useStorage, MonkeyVisual } from '@extension/shared';
import { monkeyStorage, hatStorage, HATS } from '@extension/storage';
import { SpeechBubble } from './components/SpeechBubble';

export default function Monkey() {
  const storedPosition = useStorage(monkeyStorage);
  const [position, setPosition] = useState(storedPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [speechText, setSpeechText] = useState<string>(
    'Hello I am monkey and i am very pleased to meet you :) my name is monkey and what is yours ?',
  );
  const selectedHat = useStorage(hatStorage);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    console.log('runtime content view loaded');

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX + window.scrollX - dragOffset.x,
          y: e.clientY + window.scrollY - dragOffset.y,
        };
        setPosition(newPosition);
        monkeyStorage.setPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX + window.scrollX - position.x,
      y: e.clientY + window.scrollY - position.y,
    });
  };

  const generateText = useCallback(async () => {
    const pageContent = document.body.innerText;
    const currentHat = HATS.find(h => h.id === selectedHat);
    try {
      const response = await fetch('http://localhost:3000/api/mascot/cheer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageContent,
          hat: currentHat,
        }),
      });
      const data = await response.json();
      setSpeechText(data.message);
      setIsSpeaking(true);
    } catch (error) {
      console.error('Error generating text:', error);
    } finally {
      setTimeout(() => setIsSpeaking(false), 4000);
    }
  }, [selectedHat]);

  // Add message listener
  useEffect(() => {
    const messageListener = (message: { type: string }) => {
      if (message.type === 'GENERATE_TEXT') {
        generateText();
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [generateText, selectedHat]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Draggable monkey"
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          cursor: 'move',
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
        className="relative"
        onMouseDown={handleMouseDown}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleMouseDown(e as unknown as React.MouseEvent);
          }
        }}>
        {speechText && <SpeechBubble text={speechText} />}
        <MonkeyVisual selectedHat={selectedHat} size={64} speaking={isSpeaking} />
      </div>
    </div>
  );
}
