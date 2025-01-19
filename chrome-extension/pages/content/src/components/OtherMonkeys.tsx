import React from 'react';
import { MonkeyVisual } from '@extension/shared';
import { MonkeyState } from '@extension/storage';

interface OtherMonkey {
  position: {
    x: number;
    y: number;
  };
  state: MonkeyState;
  direction?: 'left' | 'right';
  ownerName: string;
  selectedHat?: string;
}

interface OtherMonkeysProps {
  monkeys: Record<string, OtherMonkey>;
}

export const OtherMonkeys: React.FC<OtherMonkeysProps> = ({ monkeys }) => {
  console.log('Rendering OtherMonkeys with:', monkeys);
  return (
    <>
      {Object.entries(monkeys).map(([id, monkey]) => {
        console.log('Rendering monkey:', id, monkey);
        return monkey.state !== 'hiding' && (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: monkey.position.x,
              top: monkey.position.y,
              pointerEvents: 'none',
              zIndex: 9998,
            }}>
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
              }}>
              {monkey.ownerName || 'Anonymous'}
            </div>
            <MonkeyVisual
              selectedHat={monkey.selectedHat}
              direction={monkey.direction || 'left'}
              state={monkey.state}
            />
          </div>
        );
      })}
    </>
  );
}; 