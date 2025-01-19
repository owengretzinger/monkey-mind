import { useEffect } from 'react';
import { useStorage } from '@extension/shared';
import { monkeyStateStorage, hatStorage } from '@extension/storage';
import { OtherMonkeys } from './components/OtherMonkeys';
import { LocalMonkey } from './components/LocalMonkey';
import { useState } from 'react';

const WS_URL = 'ws://localhost:3000';

export default function Monkey() {
  const storedData = useStorage(monkeyStateStorage);
  const [otherMonkeys, setOtherMonkeys] = useState<Record<string, any>>({});
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Anonymous');
  const selectedHat = useStorage(hatStorage);
  const [prevPositions, setPrevPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Add effect to get user name
  useEffect(() => {
    chrome.storage.local.get(['userName'], result => {
      if (result.userName) {
        setUserName(result.userName);
      }
    });
  }, []);

  // Email effect
  useEffect(() => {
    chrome.storage.local.get(['userEmail'], result => {
      if (result.userEmail) {
        setUserEmail(result.userEmail);
      } else {
        const tempId = 'temp_' + Math.random().toString(36).substring(7);
        setUserEmail(tempId);
      }
    });
  }, []);

  // WebSocket effect
  useEffect(() => {
    if (!userEmail) return;

    const ws = new WebSocket(WS_URL);

    const isOutOfBounds = (position: { x: number; y: number }) => {
      return (
        position.x < -100 ||
        position.x > window.innerWidth + 100 ||
        position.y < -100 ||
        position.y > window.innerHeight + 100
      );
    };

    const calculateDirection = (currentPos: { x: number; y: number }, prevPos: { x: number; y: number }) => {
      if (Math.abs(currentPos.x - prevPos.x) > 1) {
        return currentPos.x > prevPos.x ? 'right' : 'left';
      }
      return null; // Keep existing direction if not moving horizontally
    };

    ws.onopen = () => {
      console.log('WebSocket Connected');
      const isHiding = storedData.state === 'hiding' || isOutOfBounds(storedData.position);
      ws.send(
        JSON.stringify({
          type: 'monkey_position',
          data: {
            id: userEmail,
            position: storedData.position,
            state: storedData.state,
            direction: storedData.state === 'walking' ? 'right' : 'left',
            url: window.location.href,
            ownerName: userName,
            selectedHat: selectedHat,
            isHiding,
          },
        }),
      );
      setPrevPositions({ [userEmail]: storedData.position });
    };

    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.type === 'monkey_position') {
        const { id, position, state, direction, ownerName, selectedHat, isHiding } = message.data;
        if (id !== userEmail) {
          if (!isHiding && !isOutOfBounds(position)) {
            setOtherMonkeys(prev => {
              const prevMonkey = prev[id];
              const prevPos = prevPositions[id] || position;
              const newDirection =
                calculateDirection(position, prevPos) || prevMonkey?.direction || direction || 'left';

              setPrevPositions(prev => ({ ...prev, [id]: position }));

              return {
                ...prev,
                [id]: {
                  position,
                  state,
                  direction: newDirection,
                  ownerName,
                  selectedHat,
                },
              };
            });
          } else {
            setOtherMonkeys(prev => {
              const newMonkeys = { ...prev };
              delete newMonkeys[id];
              return newMonkeys;
            });
            setPrevPositions(prev => {
              const newPositions = { ...prev };
              delete newPositions[id];
              return newPositions;
            });
          }
        }
      } else if (message.type === 'monkey_left') {
        const { id } = message.data;
        setOtherMonkeys(prev => {
          const newMonkeys = { ...prev };
          delete newMonkeys[id];
          return newMonkeys;
        });
        setPrevPositions(prev => {
          const newPositions = { ...prev };
          delete newPositions[id];
          return newPositions;
        });
      }
    };

    const sendPositionUpdate = () => {
      if (ws.readyState === WebSocket.OPEN) {
        const isHiding = storedData.state === 'hiding' || isOutOfBounds(storedData.position);
        const prevPos = prevPositions[userEmail] || storedData.position;
        const newDirection =
          calculateDirection(storedData.position, prevPos) || (storedData.state === 'walking' ? 'right' : 'left');

        setPrevPositions(prev => ({ ...prev, [userEmail]: storedData.position }));

        ws.send(
          JSON.stringify({
            type: 'monkey_position',
            data: {
              id: userEmail,
              position: storedData.position,
              state: storedData.state,
              direction: newDirection,
              url: window.location.href,
              ownerName: userName,
              selectedHat: selectedHat,
              isHiding,
              isThinking: storedData.state === 'thinking',
            },
          }),
        );

        if (isHiding) {
          ws.send(
            JSON.stringify({
              type: 'monkey_left',
              data: { id: userEmail },
            }),
          );
        }
      }
    };

    sendPositionUpdate();
    const updateInterval = setInterval(sendPositionUpdate, 1000);

    return () => {
      clearInterval(updateInterval);
      ws.close();
    };
  }, [storedData.position, storedData.state, userEmail, userName, selectedHat]);

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
      <LocalMonkey />
    </div>
  );
}
