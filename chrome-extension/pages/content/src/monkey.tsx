import { useEffect, useMemo, useState } from 'react';
import { useStorage, MonkeyVisual } from '@extension/shared';
import { monkeyStateStorage, hatStorage } from '@extension/storage';
import { SpeechBubble } from './components/SpeechBubble';
import { useDraggable } from './hooks/useDraggable';
import { useMonkeyText } from './hooks/useMonkeyText';
import { useAuth0 } from '@auth0/auth0-react';


const SPEED = 150; // pixels per second
const WALKING_TIME = 5000; // milliseconds

export const pastelColors = [
  'bg-yellow-100',  // Pastel Yellow
  'bg-pink-100',    // Pastel Pink
  'bg-blue-100',    // Pastel Blue
  'bg-green-100',   // Pastel Green
  'bg-slate-50'     // Pastel White
];

export enum HatType {
  None = 'none',
  Banana = 'banana',
  Girlfriend = 'girlfriend',
  Grad = 'grad',
  Wizard = 'wizard',
  Tinfoil = 'tinfoil',
  Military = 'military'
}

export interface Note {
  color: number;
  author: string;
  date: Date;
  tilt: number;
  title: string;
  content: string;
  positionX: number;
  positionY: number;
  hat: HatType;
  profilePic: string;
}


export const defaultNote: Note = {
  color: Math.floor(Math.random() * pastelColors.length),
  author: 'Anonymous',
  date: new Date(),
  tilt: 0,
  title: 'Untitled Note',
  content: '',
  positionX: Math.random() * (window.innerWidth - 200),
  positionY: Math.random() * (window.innerHeight - 200),
  hat: HatType.None,
  profilePic: 'default-avatar.png'
};


export default function Monkey() {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const storedData = useStorage(monkeyStateStorage);
  const { handleMouseDown } = useDraggable(storedData.position, monkeyStateStorage);
  const selectedHat = useStorage(hatStorage);
  const { speechText, generateText } = useMonkeyText(selectedHat);
  const [allNotes, setAllNotes] = useState<Note[]>([]); // Explicitly type the state array

  const getTargetPosition = () => {
    const startPosition = storedData.position;
    let targetX;

    if (storedData.state === 'walking') {
      // If walking in, go to nearest quarter horizontally
      const leftQuarter = window.innerWidth * 0.25;
      const rightQuarter = window.innerWidth * 0.75;

      // Determine horizontal position
      if (startPosition.x < 0) {
        targetX = leftQuarter;
      } else if (startPosition.x > window.innerWidth) {
        targetX = rightQuarter;
      } else {
        targetX = startPosition.x < window.innerWidth / 2 ? leftQuarter : rightQuarter;
      }
    } else if (storedData.state === 'leaving') {
      // If leaving, exit through nearest edge
      targetX = startPosition.x < window.innerWidth / 2 ? -100 : window.innerWidth + 100;
    }

    return {
      x: Math.floor(targetX!),
      y: startPosition.y, // Keep same Y position
    };
  };

  const targetPosition = useMemo(getTargetPosition, [storedData.state, storedData.position]);

  // Add timer for idle state
  useEffect(() => {
    if (storedData.state === 'idle') {
      const timer = setTimeout(() => {
        monkeyStateStorage.setState('leaving');
      }, WALKING_TIME);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [storedData.state]);

  useEffect(() => {
    if (storedData.state === 'walking' || storedData.state === 'leaving') {
      let animationFrameId: number;
      const speed = SPEED; // pixels per second
      let lastTime = performance.now();

      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        const currentX = storedData.position.x;
        const distanceX = targetPosition.x - currentX;
        const directionX = distanceX > 0 ? 1 : -1;
        const moveAmount = speed * deltaTime;

        if (Math.abs(distanceX) <= moveAmount) {
          monkeyStateStorage.setPosition(targetPosition);
          if (storedData.state === 'walking') {
            monkeyStateStorage.setState('talking');
            generateText(true);
          } else {
            monkeyStateStorage.setState('hiding');
          }
        } else {
          // Move only horizontally
          monkeyStateStorage.setPosition({
            x: currentX + moveAmount * directionX,
            y: storedData.position.y,
          });
          animationFrameId = requestAnimationFrame(animate);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
    return undefined;
  }, [generateText, storedData.state, storedData.position, targetPosition]);

  useEffect(() => {
    // Pulling All of the Existing Notes
    /*
    const renderAllNotes = async () => {
      const note = await fetch()
      setAllNotes([note]); // database call to mongo lmao
    }

    renderAllNotes();
    */
   console.log("HIIIIIIadsl;kfj;laksdjfklsajd;fkl")
    
    const messageListener = async (
      message: { type: string }, 
      sender: chrome.runtime.MessageSender, 
      sendResponse: (response: any) => void
    ) => {
      if (message.type === 'COME_HERE') {
        const topQuarter = window.scrollY + window.innerHeight * 0.25;
        const bottomQuarter = window.scrollY + window.innerHeight * 0.75;
        const currentY = storedData.position.y;

        let newY = currentY;
        if (currentY < topQuarter) {
          newY = topQuarter;
        } else if (currentY > bottomQuarter) {
          newY = bottomQuarter;
        }

        const newPosition = {
          x: storedData.position.x,
          y: newY,
        };

        await monkeyStateStorage.setPosition(newPosition);

        monkeyStateStorage.setState('walking');

      }else if (message.type === "ADD_NOTE") {
        console.log("HIIII");


        const newNote: Note = {
          ...defaultNote,
          author: "",
          date: new Date(),
          positionX: Math.random() * (window.innerWidth - 200),
          positionY: Math.random() * (window.innerHeight - 200),
        };
        
        setAllNotes(prev => [...prev, newNote]);
        sendResponse({ success: true });
      }
      return true;
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, [storedData.position.x, storedData.position.y]);

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
        WebkitUserSelect: 'none',
      }}
      draggable={false}
      onDragStart={e => e.preventDefault()}>


      <div
        role="button"
        tabIndex={0}
        aria-label="Draggable monkey"
        style={{
          position: 'absolute',
          left: storedData.position.x,
          top: storedData.position.y,
          cursor: 'move',
          userSelect: 'none',
          pointerEvents: 'auto',
          width: '64px',
          height: '64px',
          zIndex: 1,
          WebkitUserSelect: 'none',
        }}
        draggable={false}
        className="relative"
        onMouseDown={storedData.state !== 'hiding' ? handleMouseDown : undefined}
        onKeyDown={
          storedData.state !== 'hiding'
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleMouseDown(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        onDragStart={e => e.preventDefault()}>
        {(speechText || storedData.state === 'thinking') && (
          <SpeechBubble text={speechText} isThinking={storedData.state === 'thinking'} />
        )}
        <MonkeyVisual
          selectedHat={selectedHat}
          direction={
            storedData.state === 'walking' || storedData.state === 'leaving'
              ? storedData.position.x < targetPosition.x
                ? 'right'
                : 'left'
              : 'left'
          }
          state={storedData.state}
        />


        {/* <div className="pt-4">{storedData.state}</div> */}
      </div>

      <div>
        {allNotes.map((index, note) => {
            return (
              <div>
                
              </div>
            )
          })}
      </div>
    </div>
  );
}
