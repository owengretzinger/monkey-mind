import { useEffect, useState, useCallback } from 'react';
import { useStorage, MonkeyVisual } from '@extension/shared';
import { monkeyStorage, hatStorage, HATS } from '@extension/storage';
import { SpeechBubble } from './components/SpeechBubble';

export default function Monkey() {
  const storedPosition = useStorage(monkeyStorage);
  const [position, setPosition] = useState(storedPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const selectedHat = useStorage(hatStorage);

  const [speechText, setSpeechText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWalking, setIsWalking] = useState(true);

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

  const generateText = useCallback(
    async (mock = false) => {
      const pageContent = document.body.innerText;
      const currentHat = HATS.find(h => h.id === selectedHat);
      try {
        if (mock) {
          setIsSpeaking(true);
          setSpeechText("Hello! I'm Monkey Mind. I'm here to help you focus.");
        } else {
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

  // initial walk-in animation
  useEffect(() => {
    if (isWalking) {
      const targetX = window.innerWidth / 4;
      const duration = 300;
      // const duration = 8000;
      const startTime = Date.now();
      const startX = -100;
      const fixedY = Math.floor(window.innerHeight * 0.25); // Keep consistent Y position

      const animate = () => {
        const now = Date.now();
        const progress = Math.min(1, (now - startTime) / duration);

        if (progress < 1) {
          const newX = startX + (targetX - startX) * progress;
          const newPosition = { x: newX, y: fixedY };
          setPosition(newPosition);
          monkeyStorage.setPosition(newPosition);
          requestAnimationFrame(animate);
        } else {
          const finalPosition = { x: targetX, y: fixedY };
          setPosition(finalPosition);
          monkeyStorage.setPosition(finalPosition);
          setIsWalking(false);
          generateText(true);
        }
      };
      requestAnimationFrame(animate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalking]); // don't want to re-run this effect on position change

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
          cursor: isWalking ? 'default' : 'move',
          pointerEvents: isWalking ? 'none' : 'auto',
          userSelect: 'none',
        }}
        className="relative"
        onMouseDown={!isWalking ? handleMouseDown : undefined}
        onKeyDown={
          !isWalking
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleMouseDown(e as unknown as React.MouseEvent);
                }
              }
            : undefined
        }>
        {speechText && <SpeechBubble text={speechText} />}
        <MonkeyVisual
          selectedHat={selectedHat}
          direction={isWalking ? 'right' : 'left'}
          speaking={isSpeaking}
          isWalking={isWalking}
        />
      </div>
    </div>
  );
}
