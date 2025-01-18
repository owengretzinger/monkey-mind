import { useState, useEffect } from 'react';
import type { Position, DragOffset } from '../types/position';

export function useDraggable(initialPosition: Position, onPositionChange: (position: Position) => void) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX + window.scrollX - dragOffset.x,
          y: e.clientY + window.scrollY - dragOffset.y,
        };
        setPosition(newPosition);
        onPositionChange(newPosition);
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
  }, [isDragging, dragOffset, onPositionChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX + window.scrollX - position.x,
      y: e.clientY + window.scrollY - position.y,
    });
  };

  return {
    position,
    setPosition,
    isDragging,
    handleMouseDown,
  };
}
