import { useEffect, useMemo } from 'react';
import { useStorage, MonkeyVisual } from '@extension/shared';
import { monkeyStateStorage, hatStorage } from '@extension/storage';
import { SpeechBubble } from './components/SpeechBubble';
import { useDraggable } from './hooks/useDraggable';
import { useMonkeyText } from './hooks/useMonkeyText';
import { OtherMonkeys } from './components/OtherMonkeys';
import { useState } from 'react';

const SPEED = 150; // pixels per second
const WALKING_TIME = 5000; // milliseconds
const WS_URL = 'ws://localhost:3000'; // Adjust this URL as needed

export default function Monkey() {
  const storedData = useStorage(monkeyStateStorage);
  const { handleMouseDown } = useDraggable(storedData.position, monkeyStateStorage);
  const selectedHat = useStorage(hatStorage);
  const { speechText, generateText } = useMonkeyText(selectedHat);
  const [otherMonkeys, setOtherMonkeys] = useState<Record<string, any>>({});

  const getTargetPosition = () => {
    const startPosition = storedData.position;
    let targetX;

    if (storedData.state === 'walking') {
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
    } else if (storedData.state === 'leaving') {
      // If leaving, exit through nearest edge
      targetX = startPosition.x < window.innerWidth / 2 ? -100 : window.innerWidth + 100;
    }

    return {
      x: Math.floor(targetX!),
      y: startPosition.y, // Keep same Y position
    };
  };

  const targetPosition = useMemo(getTargetPosition, [storedData.state, storedData.position]);

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
        const distanceX = targetPosition.x - currentX;
        const directionX = distanceX > 0 ? 1 : -1;
        const moveAmount = speed * deltaTime;

        if (Math.abs(distanceX) <= moveAmount) {
          monkeyStateStorage.setPosition(targetPosition);
          if (storedData.state === 'walking') {
            monkeyStateStorage.setState('talking');
            generateText(true);
          } else {
            monkeyStateStorage.setState('hiding');
          }
        } else {
          // Move only horizontally
          monkeyStateStorage.setPosition({
            x: currentX + moveAmount * directionX,
            y: storedData.position.y,
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
    const messageListener = async (message: { type: string }) => {
      if (message.type === 'COME_HERE') {
        const topQuarter = window.scrollY + window.innerHeight * 0.25;
        const bottomQuarter = window.scrollY + window.innerHeight * 0.75;
        const currentY = storedData.position.y;

        let newY = currentY;
        if (currentY < topQuarter) {
          newY = topQuarter;
        } else if (currentY > bottomQuarter) {
          newY = bottomQuarter;
        }

        const newPosition = {
          x: storedData.position.x,
          y: newY,
        };

        await monkeyStateStorage.setPosition(newPosition);

        monkeyStateStorage.setState('walking');
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [storedData.position.x, storedData.position.y]);

  // Add WebSocket connection and position tracking
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('WebSocket Connected');
      // Send initial presence with a unique ID
      const clientId = Math.random().toString(36).substring(7);
      ws.send(JSON.stringify({
        type: 'monkey_position',
        data: {
          id: clientId,
          position: storedData.position,
          state: storedData.state,
          url: window.location.href
        }
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'monkey_position') {
        const { id, position, state } = message.data;
        setOtherMonkeys(prev => ({
          ...prev,
          [id]: { position, state }
        }));
      } else if (message.type === 'monkey_left') {
        const { id } = message.data;
        setOtherMonkeys(prev => {
          const newMonkeys = { ...prev };
          delete newMonkeys[id];
          return newMonkeys;
        });
      }
    };

    // Function to send position updates
    const sendPositionUpdate = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'monkey_position',
          data: {
            position: storedData.position,
            state: storedData.state,
            url: window.location.href
          }
        }));
      }
    };

    // Send position updates whenever position or state changes
    sendPositionUpdate();

    // Set up position update interval
    const updateInterval = setInterval(sendPositionUpdate, 1000);

    // Cleanup
    return () => {
      clearInterval(updateInterval);
      ws.close();
    };
  }, [storedData.position, storedData.state]);

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
        WebkitUserSelect: 'none',
      }}
      draggable={false}
      onDragStart={e => e.preventDefault()}>
      <OtherMonkeys monkeys={otherMonkeys} />
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
                  handleMouseDown(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        onDragStart={e => e.preventDefault()}>
        {(speechText || storedData.state === 'thinking') && (
          <SpeechBubble text={speechText} isThinking={storedData.state === 'thinking'} />
        )}
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
        {/* <div className="pt-4">{storedData.state}</div> */}
      </div>
    </div>
  );
}
