import React, {useState, useEffect } from 'react'
import { useStorage } from '@extension/shared';
import Note from "./components/Note";
import { monkeyStateStorage } from '@extension/storage';

export const pastelColors = [
    'bg-yellow-100',  // Pastel Yellow
    'bg-pink-100',    // Pastel Pink
    'bg-blue-100',    // Pastel Blue
    'bg-green-100',   // Pastel Green
    'bg-slate-50'     // Pastel White
];



export interface Note {
    color: number;
    author: string;
    date: Date;
    tilt: number;
    title: string;
    content: string;
    positionX: number;
    positionY: number;
    hat: string;
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
    hat: "none",
    profilePic: 'default-avatar.png'
};


const Notes = () => {
    const [userName, setUserName] = useState<string>('Anonymous');
    const [userProfilePic, setUserProfilePic] = useState<string>('default.png');

    const {hatId} = useStorage(monkeyStateStorage);
    const [allNotes, setAllNotes] = useState<Note[]>([]);
    const apiUrl = 'http://localhost:3000/api/users/newUser';
    
    // Reading from DB for all notes
    useEffect(() => {
        
        
    }, []);


    // Add Chrome Extension Listener For Spawning New Notes
    useEffect(() => {
        const messageListener = async (message: { type: string }) => {
          if (message.type === 'ADD_NOTE') {
            const defaultNote: Note = {
              color: Math.floor(Math.random() * 5),
              tilt: Math.random() * 10 - 5,
              author: userName, // This will be converted to ObjectId on server
              date: new Date(),
              title: 'Untitled Note',
              content: '',
              hat: hatId,
              positionX: Math.random() * (window.innerWidth - 200),
              positionY: Math.random() * (window.innerHeight - 200),
              profilePic: userProfilePic || 'default.png'
            };
            
            setAllNotes(prev => [...prev, defaultNote]);
          }
        };
        chrome.runtime.onMessage.addListener(messageListener);
        return () => chrome.runtime.onMessage.removeListener(messageListener);
    }, [userName]);

    // Add effect to get user name
    useEffect(() => {
        chrome.storage.local.get(['userName', 'userProfilePic'], result => {
            if (result.userName) {
                setUserName(result.userName);
            }
            if (result.userProfilePic) {
                setUserProfilePic(result.userProfilePic);
            }
        });
    }, []);

    return (
        <div>
        {allNotes.map((note, index) => (
            <Note key={index} {...note} />
        ))}


        </div>
    )
}

export default Notes


