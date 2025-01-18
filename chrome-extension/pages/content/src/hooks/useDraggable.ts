import { useState, useCallback, useEffect } from 'react';
import type { MonkeyStorage, Position } from '@extension/storage';

interface DragOffset {
  x: number;
  y: number;
}

export function useDraggable(initialPosition: Position, storage: MonkeyStorage) {
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });

  // Cleanup function to ensure we always reset dragging state
  const cleanup = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    storage.setState('idle');
  }, [storage]);

  useEffect(() => {
    const handleMouseMove = async (e: MouseEvent) => {
      try {
        const newPosition = {
          x: e.clientX + window.scrollX - dragOffset.x,
          y: e.clientY + window.scrollY - dragOffset.y,
        };
        await storage.setPosition(newPosition);
        await storage.setState('dragging');
      } catch (error) {
        console.error('Error during drag:', error);
        cleanup();
      }
    };

    const handleMouseUp = () => {
      cleanup();
    };

    // Also handle mouse leave to prevent stuck states
    const handleMouseLeave = () => {
      cleanup();
    };

    if (dragOffset.x !== 0 || dragOffset.y !== 0) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mouseleave', handleMouseLeave);
        cleanup();
      };
    }
    return undefined;
  }, [dragOffset, storage, cleanup]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Cancel any walking/leaving animations
      storage.setState('dragging');
      setDragOffset({
        x: e.clientX + window.scrollX - initialPosition.x,
        y: e.clientY + window.scrollY - initialPosition.y,
      });
    },
    [initialPosition.x, initialPosition.y, storage],
  );

  return { handleMouseDown };
}
