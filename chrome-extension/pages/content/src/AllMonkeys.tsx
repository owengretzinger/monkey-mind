import { MonkeyComponent, useStorage } from '@extension/shared';
import { monkeyStateStorage } from '@extension/storage';
import type { MonkeyData } from '@extension/storage';
import type { ChromeMessage } from '@extension/shared/types/messages';
import { useState, useEffect } from 'react';
import { LocalMonkey } from './components/LocalMonkey';

export default function AllMonkeys() {
  const { user } = useStorage(monkeyStateStorage);
  const [allMonkeys, setAllMonkeys] = useState<MonkeyData[]>([] as MonkeyData[]);
  const monkeyState: MonkeyData = useStorage(monkeyStateStorage);

  useEffect(() => {
    const messageListener = (message: ChromeMessage) => {
      if (message.type === 'WS_MESSAGE') {
        const wsMessage = message.data;

        switch (wsMessage.type) {
          case 'update': {
            const monkeyData = wsMessage.data as MonkeyData;
            setAllMonkeys(current => {
              const filtered = current.filter(m => m.user?.id !== monkeyData.user?.id);
              return [...filtered, monkeyData];
            });
            break;
          }
          case 'disconnect': {
            const { userId } = wsMessage.data as { userId: string };
            setAllMonkeys(current => current.filter(m => m.user?.id !== userId));
            break;
          }
        }
      }
    };

    // Send initial state when component mounts
    if (user) {
      chrome.runtime.sendMessage({
        type: 'WS_SEND',
        data: { type: 'update', data: monkeyState },
      });
    }

    // Add chrome runtime message listener
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      chrome.runtime.sendMessage({
        type: 'WS_SEND',
        data: { type: 'update', data: monkeyState },
      });
    }
  }, [monkeyState, user]);

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
      draggable={false}>
      <LocalMonkey />
      {allMonkeys
        .filter(monkey => monkey.user?.id !== user?.id)
        .map(monkey => (
          <div
            key={monkey.user!.id}
            style={{
              position: 'absolute',
              left: monkey.position.x,
              top: monkey.position.y,
              // cursor: 'move',
              userSelect: 'none',
              pointerEvents: 'auto',
              width: '64px',
              height: '64px',
              zIndex: 1,
              WebkitUserSelect: 'none',
            }}
            draggable={false}
            className="relative">
            <MonkeyComponent state={monkey} />
            <div style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: '-1.5rem',
              whiteSpace: 'nowrap',
              borderRadius: '0.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'black'
            }}>
              {monkey.user!.displayName}
            </div>
          </div>
        ))}
    </div>
  );
}
