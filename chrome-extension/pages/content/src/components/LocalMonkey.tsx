import React, { useEffect, useMemo } from 'react';
import { useStorage, MonkeyVisual } from '@extension/shared';
import { monkeyStateStorage } from '@extension/storage';
import { SpeechBubble } from './SpeechBubble';
import { useDraggable } from '../hooks/useDraggable';
import { useMonkeyText } from '../hooks/useMonkeyText';

const SPEED = 150; // pixels per second
const WALKING_TIME = 5000; // milliseconds

export const LocalMonkey: React.FC = () => {
  const monkey = useStorage(monkeyStateStorage);
  const { handleMouseDown } = useDraggable(monkey.position, monkeyStateStorage);
  const { speechText, generateText } = useMonkeyText(monkey.hatId);

  const getTargetPosition = () => {
    const startPosition = monkey.position;
    let targetX;

    if (monkey.currentAction === 'walking') {
      // If walking in, go to nearest quarter horizontally
      const leftQuarter = window.innerWidth * 0.25;
      const rightQuarter = window.innerWidth * 0.75;

      // Determine horizontal position
      if (startPosition.x < 0) {
        targetX = leftQuarter;
      } else if (startPosition.x > window.innerWidth) {
        targetX = rightQuarter;
      } else {
        targetX = startPosition.x < window.innerWidth / 2 ? leftQuarter : rightQuarter;
      }
    } else if (monkey.currentAction === 'leaving') {
      // If leaving, exit through nearest edge
      targetX = startPosition.x < window.innerWidth / 2 ? -100 : window.innerWidth + 100;
    }

    return {
      x: Math.floor(targetX!),
      y: startPosition.y, // Keep same Y position
    };
  };

  const targetPosition = useMemo(getTargetPosition, [monkey.currentAction, monkey.position]);

  // Add timer for idle state
  useEffect(() => {
    if (monkey.currentAction === 'idle') {
      const timer = setTimeout(() => {
        monkeyStateStorage.setAction('leaving');
      }, WALKING_TIME);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [monkey.currentAction]);

  // Handle walking animation
  useEffect(() => {
    if (monkey.currentAction === 'walking' || monkey.currentAction === 'leaving') {
      let animationFrameId: number;
      const speed = SPEED;
      let lastTime = performance.now();

      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        const currentX = monkey.position.x;
        const distanceX = targetPosition.x - currentX;
        const directionX = distanceX > 0 ? 1 : -1;

        const moveAmount = speed * deltaTime;

        if (Math.abs(distanceX) <= moveAmount) {
          monkeyStateStorage.setPosition(targetPosition);
          if (monkey.currentAction === 'walking') {
            monkeyStateStorage.setAction('talking');
            generateText(true);
          } else {
            monkeyStateStorage.setAction('hiding');
          }
        } else {
          monkeyStateStorage.setPosition({
            x: currentX + moveAmount * directionX,
            y: monkey.position.y,
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
  }, [generateText, monkey.currentAction, monkey.position, targetPosition]);

  // Handle "come here" message
  useEffect(() => {
    const messageListener = async (message: { type: string }) => {
      if (message.type === 'COME_HERE') {
        const topQuarter = window.scrollY + window.innerHeight * 0.25;
        const bottomQuarter = window.scrollY + window.innerHeight * 0.75;
        const currentY = monkey.position.y;

        let newY = currentY;
        if (currentY < topQuarter) {
          newY = topQuarter;
        } else if (currentY > bottomQuarter) {
          newY = bottomQuarter;
        }

        const newPosition = {
          x: monkey.position.x,
          y: newY,
        };

        await monkeyStateStorage.setPosition(newPosition);
        monkeyStateStorage.setAction('walking');
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [monkey.position.x, monkey.position.y]);

  // Don't render if hiding
  if (monkey.currentAction === 'hiding') {
    return null;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Draggable monkey"
      style={{
        position: 'absolute',
        left: monkey.position.x,
        top: monkey.position.y,
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
      onMouseDown={handleMouseDown}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleMouseDown(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
      onDragStart={e => e.preventDefault()}>
      {(speechText || monkey.currentAction === 'thinking') && (
        <SpeechBubble
          text={speechText}
          isThinking={monkey.currentAction === 'thinking'}
          isOnRightSide={monkey.position.x > window.innerWidth / 2}
        />
      )}
      <MonkeyVisual state={monkey} />
    </div>
  );
};
