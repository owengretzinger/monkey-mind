import React, { useState, useEffect } from 'react'
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
    id: string
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
    link: string;
}


export const defaultNote: Note = {
    id: Array.from(crypto.getRandomValues(new Uint8Array(9)))
        .map(b => b.toString(36).padStart(2, '0'))
        .join('')
        .slice(0, 12),
    color: Math.floor(Math.random() * pastelColors.length),
    author: 'Anonymous',
    date: new Date(),
    tilt: 0,
    title: '',
    content: '',
    positionX: Math.random() * (window.innerWidth - 200),
    positionY: Math.random() * (window.innerHeight - 200),
    hat: "none",
    profilePic: 'default-avatar.png',
    link: encodeURIComponent(window.location.href)
};


const Notes = () => {
    const [userName, setUserName] = useState<string>('Anonymous');
    const [userProfilePic, setUserProfilePic] = useState<string>('default.png');

    const {hatId} = useStorage(monkeyStateStorage);
    const [allNotes, setAllNotes] = useState<Note[]>([]);
    const apiURL = 'http://localhost:3000/api/notes';


    // Add effect to get user name
    /*
    useEffect(() => {
        const getUserInfo = async () => {
            try {
                const result = await chrome.storage.local.get(['userName', 'userProfilePic']);
                if (result.userName) {
                    setUserName(result.userName);
                }
                if (result.userProfilePic) {
                    setUserProfilePic(result.userProfilePic);
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        getUserInfo();
    }, []);
    */


    // Reading from DB for all notes
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await fetch(`${apiURL}/all?url=${encodeURIComponent(window.location.href)}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch notes');
                }
                const data = await response.json();
                data.id = data._id;
                setAllNotes(data);
            } catch (error) {
                console.error('Error fetching notes:', error);
            }
        };

        fetchNotes();
    }, []);


    // Add Chrome Extension Listener For Spawning New Notes
    useEffect(() => {
        const messageListener = async (message: { type: string, username: string, id: string }) => {
            if (message.type === 'ADD_NOTE') {
                console.log(message.username, message.id, "HI THERE STUPID FUC");
                setUserName(message.username);


                let profilePic = 'default-avatar.png';
                const response = await fetch(`https://ui-avatars.com/api/?name=${encodeURIComponent(message.username)}`);
                if (response.ok) {
                    profilePic = response.url;
                } else {
                    console.error('Failed to fetch avatar');
                }

                setUserProfilePic(profilePic);

                const newNote: Note = {
                    ...defaultNote,
                    id: Array.from(crypto.getRandomValues(new Uint8Array(9)))
                    .map(b => b.toString(36).padStart(2, '0'))
                    .join('')
                    .slice(0, 12),
                    author: message.username,
                    hat: hatId,
                    profilePic,
                };
                setAllNotes(prev => [...prev, newNote]);

            }
        };

        chrome.runtime.onMessage.addListener(messageListener);
        return () => chrome.runtime.onMessage.removeListener(messageListener);
    }, [userName, userProfilePic, hatId]); // Add all dependencies


    return (
        <div>
             {allNotes.map((note, index) => (    // Changed to use note.id as key
            <Note 
                key={index} 
                {...note} 
                onDelete={() => {
                    setAllNotes(prevNotes => prevNotes.filter(n => n.id !== note.id));
                }} 
            />
        ))}

        </div>
    )










}

export default Notes


