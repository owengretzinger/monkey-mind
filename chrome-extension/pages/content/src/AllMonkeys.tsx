import { useEffect, useState } from 'react';
import { LocalMonkey } from './components/LocalMonkey';
import { monkeyStateStorage } from '@extension/storage';
import { MonkeyVisual, useStorage } from '@extension/shared';
import type { MonkeyData } from '@extension/storage';

// const WS_URL = 'ws://localhost:3000';

export default function Monkey() {
  const { user } = useStorage(monkeyStateStorage);
  const [otherMonkeys] = useState<MonkeyData[]>([] as MonkeyData[]);

  // WebSocket effect
  useEffect(() => {
    if (!user) return;

    // const ws = new WebSocket(WS_URL);

    // websocket events
  }, [user]);

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
      {otherMonkeys.map(monkey => (
        <MonkeyVisual key={monkey.user!.id} state={monkey} />
      ))}
    </div>
  );
}
