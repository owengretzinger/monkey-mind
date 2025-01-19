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

  // Add effect to get user name
  useEffect(() => {
    chrome.storage.local.get(['userName'], (result) => {
      if (result.userName) {
        setUserName(result.userName);
      }
    });
  }, []);

  // Email effect
  useEffect(() => {
    chrome.storage.local.get(['userEmail'], (result) => {
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
    
    ws.onopen = () => {
      console.log('WebSocket Connected');
      ws.send(JSON.stringify({
        type: 'monkey_position',
        data: {
          id: userEmail,
          position: storedData.position,
          state: storedData.state,
          direction: storedData.state === 'walking' ? 'right' : 'left',
          url: window.location.href,
          ownerName: userName,
          selectedHat: selectedHat
        }
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'monkey_position') {
        const { id, position, state, direction, ownerName, selectedHat } = message.data;
        if (id !== userEmail) {
          setOtherMonkeys(prev => ({
            ...prev,
            [id]: { 
              position, 
              state,
              direction: direction || 'left',
              ownerName,
              selectedHat
            }
          }));
        }
      } else if (message.type === 'monkey_left') {
        const { id } = message.data;
        setOtherMonkeys(prev => {
          const newMonkeys = { ...prev };
          delete newMonkeys[id];
          return newMonkeys;
        });
      }
    };

    const sendPositionUpdate = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'monkey_position',
          data: {
            id: userEmail,
            position: storedData.position,
            state: storedData.state,
            direction: storedData.state === 'walking' ? 'right' : 'left',
            url: window.location.href,
            ownerName: userName,
            selectedHat: selectedHat
          }
        }));
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
