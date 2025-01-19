import { HATS } from '@extension/storage';
import type { MonkeyState } from '@extension/storage';

interface MonkeyVisualProps {
  selectedHat: string;
  direction?: 'left' | 'right';
  state: MonkeyState;
  className?: string;
  color: { hue: number; isDark: boolean };
}

export const MonkeyVisual = ({ selectedHat, direction = 'left', state, className = '', color }: MonkeyVisualProps) => {
  const currentHat = HATS.find(hat => hat.id === selectedHat);

  const getMonkeyImages = () => {
    switch (state) {
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
    <div
      className={`relative ${className}`}
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
      {currentHat && state !== 'dragging' && (
        <img
          src={chrome.runtime.getURL(`hats/on-monkey/${currentHat.id}.PNG`)}
          alt={currentHat.name}
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
  );
};
