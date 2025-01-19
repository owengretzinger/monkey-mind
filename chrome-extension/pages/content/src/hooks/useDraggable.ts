import { useState, useCallback, useEffect, useRef } from 'react';
import type { MonkeyStorage, Position } from '@extension/storage';

interface DragOffset {
  x: number;
  y: number;
}

export function useDraggable(initialPosition: Position, storage: MonkeyStorage) {
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const elementRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  // Cleanup function to ensure we always reset dragging state
  const cleanup = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    storage.setAction('idle');
  }, [storage]);

  useEffect(() => {
    const handleMouseMove = async (e: MouseEvent) => {
      try {
        const newPosition = {
          x: e.clientX + window.scrollX - elementRef.current.width / 2,
          y: e.clientY + window.scrollY,
        };
        await storage.setPosition(newPosition);
        await storage.setAction('dragging');
      } catch (error) {
        console.log('Error during drag:', error);
        cleanup();
      }
    };

    const handleMouseUp = () => {
      try {
        cleanup();
      } catch (error) {
        console.log('Error during mouse up:', error);
        storage.setAction('idle');
      }
    };

    const handleMouseLeave = () => {
      try {
        cleanup();
      } catch (error) {
        console.log('Error during mouse leave:', error);
        storage.setAction('idle');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget === null) {
        try {
          cleanup();
        } catch (error) {
          console.log('Error during mouse out:', error);
          storage.setAction('idle');
        }
      }
    };

    if (dragOffset.x !== 0 || dragOffset.y !== 0) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mouseout', handleMouseOut);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('mouseout', handleMouseOut);
        cleanup();
      };
    }
    return undefined;
  }, [dragOffset, storage, cleanup]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const element = e.currentTarget as HTMLDivElement;
      elementRef.current = {
        width: element.offsetWidth,
        height: element.offsetHeight,
      };

      storage.setAction('dragging');
      setDragOffset({
        x: elementRef.current.width / 2,
        y: elementRef.current.height / 2,
      });
    },
    [storage],
  );

  return { handleMouseDown };
}
