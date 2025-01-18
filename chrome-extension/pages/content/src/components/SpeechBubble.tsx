import React from 'react';

interface SpeechBubbleProps {
  text: string;
  isThinking?: boolean;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, isThinking }) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '30px',
        left: '100%',
        marginLeft: '1rem',
        zIndex: 9998,
      }}>
      <div
        style={{
          width: isThinking ? '5rem' : '20rem',
          height: isThinking ? '1.85rem' : 'auto',
          borderRadius: '0.5rem',
          backgroundColor: 'white',
          padding: '0.5rem',
          color: '#78350f',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          wordWrap: 'break-word',
          border: '1px solid #78350f',
        }}>
        {isThinking ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              marginTop: '0.2rem',
            }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: '#78350f',
                  animation: `waveDot 1s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
            <style>
              {`
                @keyframes waveDot {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-4px); }
                }
              `}
            </style>
          </div>
        ) : (
          text
        )}
      </div>
    </div>
  );
};
