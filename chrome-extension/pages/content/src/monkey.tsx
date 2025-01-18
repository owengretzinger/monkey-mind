import { useEffect, useState } from 'react';
import { useStorage } from '@extension/shared';
import { monkeyStorage } from '@extension/storage';

export default function Monkey() {
  const storedPosition = useStorage(monkeyStorage);
  const [position, setPosition] = useState(storedPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.log('runtime content view loaded');

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX + window.scrollX - dragOffset.x,
          y: e.clientY + window.scrollY - dragOffset.y,
        };
        setPosition(newPosition);
        monkeyStorage.setPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX + window.scrollX - position.x,
      y: e.clientY + window.scrollY - position.y,
    });
  };

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
          cursor: 'move',
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleMouseDown(e as unknown as React.MouseEvent);
          }
        }}>
        <img
          src={chrome.runtime.getURL('monkey.png')}
          alt="Monkey"
          style={{
            width: '64px',
            height: '64px',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
