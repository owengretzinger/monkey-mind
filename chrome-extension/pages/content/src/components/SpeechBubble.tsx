import React from 'react';

interface SpeechBubbleProps {
  text: string;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '-1.25rem',
        left: '5rem',
        zIndex: 9999,
      }}>
      <div
        style={{
          minWidth: '20rem',
          maxWidth: '20rem',
          height: 'auto',
          borderRadius: '0.5rem',
          backgroundColor: 'white',
          padding: '0.75rem',
          color: '#f59e0b',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          wordWrap: 'break-word',
        }}>
        {text}
      </div>
    </div>
  );
};
