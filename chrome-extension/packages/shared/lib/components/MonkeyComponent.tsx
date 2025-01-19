import { HATS } from '@extension/storage';
import type { MonkeyData } from '@extension/storage';
import { useState, useEffect } from 'react';

interface MonkeyVisualProps {
  state: MonkeyData;
}
export const MonkeyComponent = ({ state }: MonkeyVisualProps) => {
  const [prevPosition, setPrevPosition] = useState(state.position);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const { currentAction, color, hatId } = state;
  const hat = HATS.find(hat => hat.id === hatId);

  useEffect(() => {
    if (state.position.x !== prevPosition.x) {
      setDirection(state.position.x > prevPosition.x ? 'right' : 'left');
      setPrevPosition(state.position);
    }
  }, [prevPosition.x, state.position]);

  const getMonkeyImages = () => {
    switch (currentAction) {
      case 'walking':
      case 'leaving':
        return {
          bodyDark: 'monkey-animations/body-dark/walking.GIF',
          bodyLight: 'monkey-animations/body-light/walking.GIF',
          skin: 'monkey-animations/skin/walking.GIF',
        };
      case 'dragging':
        return {
          bodyDark: 'monkey-animations/body-dark/flailing.GIF',
          bodyLight: 'monkey-animations/body-light/flailing.GIF',
          skin: 'monkey-animations/skin/flailing.GIF',
        };
      case 'talking':
        return {
          bodyDark: 'monkey-animations/body-dark/speaking.GIF',
          bodyLight: 'monkey-animations/body-light/speaking.GIF',
          skin: 'monkey-animations/skin/speaking.GIF',
        };
      case 'thinking':
      default:
        return {
          bodyDark: 'monkey-animations/body-dark/idle.GIF',
          bodyLight: 'monkey-animations/body-light/idle.GIF',
          skin: 'monkey-animations/skin/idle.GIF',
        };
    }
  };

  const images = getMonkeyImages();

  return (
    <>
      <div
        className={`relative`}
        style={{
          transform: `scaleX(${direction === 'left' ? -1 : 1})`,
          pointerEvents: 'none',
          WebkitUserSelect: 'none',
        }}
        draggable={false}
        onDragStart={e => e.preventDefault()}>
        <img
          src={chrome.runtime.getURL(color?.isDark ? images.bodyDark : images.bodyLight)}
          alt="Monkey Body"
          style={{
            position: 'absolute',
            width: `64px`,
            height: `64px`,
            pointerEvents: 'none',
            userSelect: 'none',
            filter: color?.isDark
              ? `hue-rotate(${color.hue}deg)`
              : `sepia(100%) saturate(1000%) brightness(50%) hue-rotate(${color?.hue}deg)`,
          }}
          draggable={false}
        />
        <img
          src={chrome.runtime.getURL(images.skin)}
          alt="Monkey Body"
          style={{
            position: 'absolute',
            width: `64px`,
            height: `64px`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          draggable={false}
        />
        {hat && currentAction !== 'dragging' && (
          <img
            src={chrome.runtime.getURL(`hats/on-monkey/${hat.id}.PNG`)}
            alt={hat.name}
            style={{
              position: 'absolute',
              inset: 0,
              width: `64px`,
              height: `64px`,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
            draggable={false}
          />
        )}
      </div>
    </>
  );
};
