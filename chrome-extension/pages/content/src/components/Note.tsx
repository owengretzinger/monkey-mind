import React, { useState, useRef, useEffect } from 'react';
import { pastelColors } from '../notes';
import type { Note as NoteType } from '../notes';

const tiltAngles = [-2, -1, 0, 1, 2];

const formatDate = () => {
  const now = new Date();
  return now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface NoteProps extends NoteType {
  onDelete: () => void;
  newIDs: Set<string>;
}

const Note = (props: NoteProps) => {
  const apiURL = 'http://localhost:3000/api/notes';

  const [position, setPosition] = useState({ x: props.positionX, y: props.positionY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [noteTitle, setNoteTitle] = useState(props.title);
  const [noteContent, setNoteContent] = useState(props.content);
  const noteRef = useRef<HTMLDivElement>(null);
  const newIDs = props.newIDs;


  const color = props.color;
  const author = props.author;
  // const date = props.date;
  const profilePic = props.profilePic;
  const hat = props.hat;

  const colorIndex = color % pastelColors.length;
  const bgColor = pastelColors[colorIndex];
  const tiltAngle = tiltAngles[color % tiltAngles.length];
  const [firstTime, setFirstTime] = useState(true);
  const handleMouseDown = (e: React.MouseEvent) => {
    if (noteRef.current) {
      setIsDragging(true);
      const rect = noteRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (noteRef.current) {
      setIsDragging(true);
      const touch = e.touches[0];
      const rect = noteRef.current.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragOffset.x,
        y: touch.clientY - dragOffset.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      handleDeletion(e as unknown as React.MouseEvent);
    }
  };



  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
  };

  // DATA FLOW
  const handleDeletion = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${apiURL}/${props.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add any auth headers if needed
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.statusText}`);
      }
  
    
    } catch (error) {
      console.error('Error deleting note:', error);
      // Optionally add user feedback here
    }finally{
      props.onDelete();
    }
  };

  const handleBlur = async () => {
    try {
      const updateData = {
        id: props.id,
        title: noteTitle,
        content: noteContent,
        positionX: Math.round(position.x),
        positionY: Math.round(position.y),
        color: color,
        author: author,
        date: formatDate(),
        tilt: tiltAngle,
        profilePic: profilePic,
        hat: hat,
        link: window.location.href,
      };
  
      const response = await fetch(`${apiURL}/${props.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update note: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };


  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoteTitle(e.target.value);
  };

  const handleTitleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // POST request
      try {
        await fetch(`${apiURL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idSpecial: props.id,
            title: noteTitle,
            content: noteContent,
            positionX: position.x,
            positionY: position.y,
            color: color,
            author: author,
            date: formatDate(),
            tilt: tiltAngle,
            profilePic: profilePic,
            hat: hat,
            link: window.location.href,
          }),
        });
      } catch (error) {
        console.error('Error creating note:', error);
      }

      // PUT request
      try {
        await fetch(`${apiURL}/${props.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: props.id,
            title: noteTitle,
            content: noteContent,
            positionX: Math.round(position.x),
            positionY: Math.round(position.y),
            color: color,
            author: author,
            date: formatDate(),
            tilt: tiltAngle,
            profilePic: profilePic,
            hat: hat,
            link: window.location.href,
          }),
        });
      } catch (error) {
        console.error('Error updating note:', error);
      }
    }
  };

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTitleKeyDown(e as unknown as React.KeyboardEvent<HTMLInputElement>);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={noteRef}
      role="article"
      aria-label={`Note: ${noteTitle}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${tiltAngle}deg)`,
        zIndex: 2147483643,
      }}>
      <div style={{ position: 'relative' }}>
      <button
          aria-label="Drag note"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '6rem', // Changed from 100% to 3rem to match profile pic width
            height: '6rem', // Changed from 1.5rem to 3rem to match profile pic height
            cursor: 'move',
            backgroundColor: 'transparent',
            border: 'none',
            zIndex: 2147483646,
            //border: '1px solid red',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onKeyDown={handleKeyDown}
        />
        <div
          style={{
            width: '12rem',
            height: '12rem',
            padding: '0.5rem',
            borderRadius: '1px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            position: 'relative',
            backgroundColor:
              bgColor === 'bg-yellow-100'
                ? '#fef9c3'
                : bgColor === 'bg-pink-100'
                  ? '#fce7f3'
                  : bgColor === 'bg-blue-100'
                    ? '#dbeafe'
                    : bgColor === 'bg-green-100'
                      ? '#dcfce7'
                      : '#f8fafc',
          }}>
          <button
            aria-label="Delete note"
            tabIndex={0}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 2147483647,
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={handleDeletion}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleDeletion(e);
              }
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
            }}>
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '9999px',
                flexShrink: 0,
                backgroundColor: '#e5e7eb',
                position: 'relative',
              }}>
              <img
                src={profilePic}
                alt="Profile"
                style={{
                  width: '100%',
                  borderRadius: '9999px',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <img
                src={chrome.runtime.getURL(`hats/icons/${hat}.PNG`)}
                alt="Hat"
                style={{
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: -20,
                  right: 4,
                  width: 40,
                  height: 40,
                  userSelect: 'none',
                }}
                draggable={false}
              />
            </div>

            <div
              style={{
                flex: '1',
                minWidth: '0',
              }}>
              <input
                type="text"
                value={noteTitle}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyDown}
                placeholder="Untitled Note"
                aria-label="Note title"
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  fontWeight: '500',
                  paddingLeft: '-0.5rem',
                  fontSize: '0.875rem',
                  lineHeight: '1rem',
                  outline: 'none',
                  border: 'none',
                  color: '#374151', // Adding dark gray color for text
                  zIndex: 2147483647,

                }}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  fontSize: '0.65rem',
                  color: '#6b7280',
                }}>
                <div
                  style={{
                    fontWeight: '500',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                    {author}
                  </div>
                  {formatDate()}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              width: '100%',
              height: 'calc(100% - 2.75rem)',
              borderRadius: '1px',
              position: 'relative',
            }}>
            <div
              style={{
                width: '90%',
                height: '100%',
                padding: '0 0.5rem',
                backgroundImage: `
              repeating-linear-gradient(
                transparent,
                transparent 20px,
                #6b728080 20px,
                #6b728080 21px
              )
            `,
                backgroundPosition: '0 2px',
              }}>
              <textarea
                value={noteContent}
                onBlur={handleBlur}
                onChange={handleContentChange}
                onKeyDown={handleContentKeyDown}
                placeholder="Type your note here..."
                aria-label="Note content"
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'transparent',
                  resize: 'none',
                  outline: 'none',
                  fontSize: '0.5rem',
                  lineHeight: '21px',
                  paddingTop: '2px',
                  paddingLeft: '0.25rem',
                  paddingRight: '0.25rem',
                  WebkitMask: 'linear-gradient(transparent, black 10px)',
                  overflowY: 'auto',
                  border: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Note;
