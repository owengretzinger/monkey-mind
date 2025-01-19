import React, { useState, useRef, useEffect } from 'react';
import { Note as NoteType, pastelColors, } from '../notes';
import { useAuth0 } from '@src/auth/Auth0Provider';

const tiltAngles = [-2, -1, 0, 1, 2]

const formatDate = () => {
    const now = new Date();
    return now.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  

interface NoteProps extends NoteType {
    onDelete: () => void;
}

const Note = (props: NoteProps) => {
  const { user } = useAuth0();
  const [position, setPosition] = useState({ x: props.positionX, y: props.positionY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [noteTitle, setNoteTitle] = useState(props.title);
  const [noteContent, setNoteContent] = useState(props.content);
  const noteRef = useRef<HTMLDivElement>(null);

  const color = props.color;
  const author = user?.email || "ll";
  const date = props.date;
  const profilePic = user?.picture || props.profilePic;
  const hat = props.hat;

  const colorIndex = color % pastelColors.length;
  const bgColor = pastelColors[colorIndex];
  const tiltAngle = tiltAngles[color % tiltAngles.length];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (noteRef.current) {
      setIsDragging(true);
      const rect = noteRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoteTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
  };

  const handleDeletion = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dragging when clicking delete
    props.onDelete(); // Call the onDelete function passed from parent
  }


  const handleBlur = () => {
    console.log('Note content saved:', noteContent);
    // Here you would typically save the note content to your backend/storage
    // For example:
    // saveNote({ ...props, content: noteContent });
  };





  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {  console.log(user)
  }, [])



  return (
    <div
      ref={noteRef}
      style={{
        position: 'absolute',
        cursor: 'move',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${tiltAngle}deg)`,
        zIndex: 2147483646,
        outline: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div style={{
        width: '12rem',
        height: '12rem',
        padding: '0.5rem',
        borderRadius: '1px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        position: 'relative',
        backgroundColor: bgColor === 'bg-yellow-100' ? '#fef9c3' :
                       bgColor === 'bg-pink-100' ? '#fce7f3' :
                       bgColor === 'bg-blue-100' ? '#dbeafe' :
                       bgColor === 'bg-green-100' ? '#dcfce7' :
                       '#f8fafc'
      }}>
        <button
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
            justifyContent: 'center'
          }}
          onClick={handleDeletion}
        />
          
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '9999px',
            overflow: 'hidden',
            flexShrink: 0,
            backgroundColor: '#e5e7eb'
          }}>
            <img 
              src={profilePic} 
              alt="Profile" 
              style={{
                width: '100%',
                height: '100%',
                paddingTop: '2.5rem',
                objectFit: 'cover'
              }}
            />
          </div>
          
          <div style={{
            flex: '1',
            minWidth: '0'
          }}>
            <input
              type="text"
              value={noteTitle}
              onChange={handleTitleChange}
              placeholder="Untitled Note"
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                fontWeight: '500',
                fontSize: '0.875rem',
                lineHeight: '1rem',
                outline: 'none',
                border: 'none',
              }}
            />
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              <div style={{
                fontWeight: '500',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                <div style={{
                  fontSize: '0.625rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {formatDate()}
                </div>
                {author}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          width: '100%',
          height: 'calc(100% - 2.75rem)',
          borderRadius: '1px',
          position: 'relative'
        }}>
          <div style={{
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
            backgroundPosition: '0 2px'
          }}>
            <textarea
              onBlur={handleBlur}
              onChange={handleContentChange}
              placeholder="Type your note here..."
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
                border:'none'
              }}
            />
          </div>
        </div>
     
     
     
      </div>
    </div>
  );
};

export default Note;