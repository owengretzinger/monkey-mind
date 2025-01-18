import { useEffect, useState } from 'react';
import { useStorage, MonkeyVisual } from '@extension/shared';
import { monkeyStorage, hatStorage } from '@extension/storage';
import { SpeechBubble } from './components/SpeechBubble';
import { useDraggable } from './hooks/useDraggable';
import { useMonkeyText } from './hooks/useMonkeyText';
import { INITIAL_MONKEY_POSITION, FINAL_MONKEY_POSITION } from '@extension/storage/lib/constants';

export default function Monkey() {
  const storedPosition = useStorage(monkeyStorage);
  const { position, setPosition, handleMouseDown } = useDraggable(storedPosition, monkeyStorage.setPosition);
  const selectedHat = useStorage(hatStorage);
  const [isWalking, setIsWalking] = useState(true);

  const { speechText, isSpeaking, generateText } = useMonkeyText(selectedHat);

  // initial walk-in animation
  useEffect(() => {
    if (isWalking) {
      const targetX = FINAL_MONKEY_POSITION.x;
      const duration = 300;
      const startTime = Date.now();
      const startX = INITIAL_MONKEY_POSITION.x;
      const fixedY = INITIAL_MONKEY_POSITION.y;

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
          setPosition(FINAL_MONKEY_POSITION);
          monkeyStorage.setPosition(FINAL_MONKEY_POSITION);
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
