import { HATS } from '@extension/storage';

interface MonkeyVisualProps {
  selectedHat?: string;
  size?: number;
  className?: string;
  speaking?: boolean;
}

export const MonkeyVisual = ({ selectedHat, size = 64, className = '', speaking = false }: MonkeyVisualProps) => {
  const currentHat = HATS.find(hat => hat.id === selectedHat);

  return (
    <div className={`relative ${className}`}>
      <img
        src={chrome.runtime.getURL(speaking ? 'animations/speaking.GIF' : 'animations/idle.GIF')}
        alt="Monkey"
        style={{
          width: `${size}px`,
          height: `${size}px`,
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
            width: `${size}px`,
            height: `${size}px`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          draggable={false}
        />
      )}
    </div>
  );
};
