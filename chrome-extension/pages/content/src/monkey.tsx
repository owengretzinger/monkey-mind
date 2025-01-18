import { useEffect, useMemo } from 'react';
import { useStorage, MonkeyVisual } from '@extension/shared';
import { monkeyStateStorage, hatStorage } from '@extension/storage';
import { SpeechBubble } from './components/SpeechBubble';
import { useDraggable } from './hooks/useDraggable';
import { useMonkeyText } from './hooks/useMonkeyText';

const SPEED = 150; // pixels per second
const WALKING_TIME = 8000; // milliseconds

export default function Monkey() {
  const storedData = useStorage(monkeyStateStorage);
  const { handleMouseDown } = useDraggable(storedData.position, monkeyStateStorage);
  const selectedHat = useStorage(hatStorage);
  const { speechText, generateText } = useMonkeyText(selectedHat);

  // Move startPosition out of the effect so it can be used in JSX
  const startPosition = storedData.position;

  const getTargetPosition = () => {
    let targetX;
    let targetY;

    if (storedData.state === 'leaving') {
      // If leaving, exit through nearest edge
      targetX = startPosition.x < window.innerWidth / 2 ? -100 : window.innerWidth + 100;
      targetY = startPosition.y;
    } else {
      // If walking in, go to nearest quarter horizontally and ensure visible vertically
      const leftQuarter = window.innerWidth * 0.25;
      const rightQuarter = window.innerWidth * 0.75;
      const quarterHeight = Math.floor(window.innerHeight * 0.25);

      // Determine horizontal position
      if (startPosition.x < 0) {
        targetX = leftQuarter;
      } else if (startPosition.x > window.innerWidth) {
        targetX = rightQuarter;
      } else {
        targetX = startPosition.x < window.innerWidth / 2 ? leftQuarter : rightQuarter;
      }

      // Set vertical position to quarter height regardless of scroll position
      targetY = window.scrollY + quarterHeight;
    }

    return {
      x: Math.floor(targetX),
      y: Math.floor(targetY),
    };
  };

  const targetPosition = useMemo(getTargetPosition, [storedData.state, startPosition]);

  // Add timer for idle state
  useEffect(() => {
    if (storedData.state === 'idle') {
      const timer = setTimeout(() => {
        monkeyStateStorage.setState('leaving');
      }, WALKING_TIME);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [storedData.state]);

  useEffect(() => {
    if (storedData.state === 'walking' || storedData.state === 'leaving') {
      let animationFrameId: number;
      const speed = SPEED; // pixels per second
      let lastTime = performance.now();

      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        const currentX = storedData.position.x;
        const currentY = storedData.position.y;

        // Calculate distances for both x and y
        const distanceX = targetPosition.x - currentX;
        const distanceY = targetPosition.y - currentY;
        const directionX = distanceX > 0 ? 1 : -1;
        const moveAmount = speed * deltaTime;

        if (Math.abs(distanceX) <= moveAmount && Math.abs(distanceY) <= moveAmount) {
          monkeyStateStorage.setPosition(targetPosition);
          if (storedData.state === 'walking') {
            monkeyStateStorage.setState('talking');
            generateText(true);
          } else {
            monkeyStateStorage.setState('hiding');
          }
        } else {
          // Move both x and y towards target
          monkeyStateStorage.setPosition({
            x: currentX + (Math.abs(distanceX) <= moveAmount ? distanceX : moveAmount * directionX),
            y: currentY + (distanceY * moveAmount) / Math.max(Math.abs(distanceX), 1), // proportional y movement
          });
          animationFrameId = requestAnimationFrame(animate);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
    return undefined;
  }, [generateText, storedData.state, storedData.position, targetPosition]);

  useEffect(() => {
    const messageListener = (message: { type: string }) => {
      if (message.type === 'COME_HERE') {
        monkeyStateStorage.setState('walking');
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 9999,
        WebkitUserSelect: 'none',
      }}
      draggable={false}
      onDragStart={e => e.preventDefault()}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Draggable monkey"
        style={{
          position: 'absolute',
          left: storedData.position.x,
          top: storedData.position.y,
          cursor: 'move',
          userSelect: 'none',
          pointerEvents: 'auto',
          width: '64px',
          height: '64px',
          zIndex: 1,
          WebkitUserSelect: 'none',
        }}
        draggable={false}
        className="relative"
        onMouseDown={storedData.state !== 'hiding' ? handleMouseDown : undefined}
        onKeyDown={
          storedData.state !== 'hiding'
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleMouseDown(e as unknown as React.MouseEvent);
                }
              }
            : undefined
        }
        onDragStart={e => e.preventDefault()}>
        {speechText && <SpeechBubble text={speechText} />}
        <MonkeyVisual
          selectedHat={selectedHat}
          direction={
            storedData.state === 'walking' || storedData.state === 'leaving'
              ? storedData.position.x < targetPosition.x
                ? 'right'
                : 'left'
              : 'left'
          }
          state={storedData.state}
        />
      </div>
    </div>
  );
}
