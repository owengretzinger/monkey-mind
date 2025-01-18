import React from 'react';
import { MonkeyVisual } from '@extension/shared';
import { MonkeyState } from '@extension/storage';

interface OtherMonkey {
  position: {
    x: number;
    y: number;
  };
  state: MonkeyState;
}

interface OtherMonkeysProps {
  monkeys: Record<string, OtherMonkey>;
}

export const OtherMonkeys: React.FC<OtherMonkeysProps> = ({ monkeys }) => {
  return (
    <>
      {Object.entries(monkeys).map(([id, monkey]) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            left: monkey.position.x,
            top: monkey.position.y,
            pointerEvents: 'none',
            zIndex: 9998, // Just below the main monkey
          }}>
          <MonkeyVisual
            direction={monkey.state === 'walking' ? 'right' : 'left'}
            state={monkey.state}
          />
        </div>
      ))}
    </>
  );
}; 