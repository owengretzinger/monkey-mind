import React from 'react';

interface SpeechBubbleProps {
  text: string;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text }) => {
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
          width: '20rem',
          height: 'auto',
          borderRadius: '0.5rem',
          backgroundColor: 'white',
          padding: '0.5rem',
          color: '#78350f',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          wordWrap: 'break-word',
          border: '1px solid #78350f',
        }}>
        {text}
      </div>
    </div>
  );
};
