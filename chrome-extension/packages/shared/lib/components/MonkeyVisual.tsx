import { HATS } from '@extension/storage';

interface MonkeyVisualProps {
  selectedHat?: string;
  direction?: 'left' | 'right';
  speaking?: boolean;
  isWalking?: boolean;
  className?: string;
}

export const MonkeyVisual = ({
  selectedHat,
  direction = 'left',
  speaking = false,
  isWalking = false,
  className = '',
}: MonkeyVisualProps) => {
  const currentHat = HATS.find(hat => hat.id === selectedHat);

  const getMonkeyImage = () => {
    if (isWalking) return 'animations/walking.GIF';
    if (speaking) return 'animations/speaking.GIF';
    return 'animations/idle.GIF';
  };

  return (
    <div className={`relative ${className}`} style={{ transform: `scaleX(${direction === 'left' ? -1 : 1})` }}>
      <img
        src={chrome.runtime.getURL(getMonkeyImage())}
        alt="Monkey"
        style={{
          width: `64px`,
          height: `64px`,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        draggable={false}
      />
      {currentHat && (
        <img
          src={chrome.runtime.getURL(`hats/${currentHat.id}.PNG`)}
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
