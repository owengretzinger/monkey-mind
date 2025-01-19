import React, { useState, useEffect } from 'react'
import { useStorage } from '@extension/shared';
import { hatStorage } from '@extension/storage';
import Note from "./components/Note";

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
    title: '',
    content: '',
    positionX: Math.random() * (window.innerWidth - 200),
    positionY: Math.random() * (window.innerHeight - 200),
    hat: "none",
    profilePic: 'default-avatar.png'
};


const Notes = () => {
    const [userName, setUserName] = useState<string>('Anonymous');
    const [userProfilePic, setUserProfilePic] = useState<string>('default.png');

    const selectedHat = useStorage(hatStorage);
    const [allNotes, setAllNotes] = useState<Note[]>([]);
    const apiUrl = 'http://localhost:3000/api/users/newUser';


    // Add effect to get user name
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


    // Reading from DB for all notes
    useEffect(() => {


    }, []);


    // Add Chrome Extension Listener For Spawning New Notes
    useEffect(() => {
        const messageListener = async (message: { type: string }) => {
            if (message.type === 'ADD_NOTE') {
                const newNote: Note = {
                    ...defaultNote,
                    author: userName,
                    hat: selectedHat,
                    profilePic: userProfilePic
                };

                setAllNotes(prev => [...prev, newNote]);
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);
        return () => chrome.runtime.onMessage.removeListener(messageListener);
    }, [userName, userProfilePic, selectedHat]); // Add all dependencies


    return (
        <div>
            {allNotes.map((note, index) => (
                <Note 
                    key={index} 
                    {...note} 
                    onDelete={() => {
                        console.log('Before deletion:', allNotes.length);
                        setAllNotes(prevNotes => {
                            const newNotes = prevNotes.filter((_, i) => i !== index);
                            console.log('After deletion:', newNotes.length);
                            return newNotes;
                        });
                    }} 
                />
            ))}


        </div>
    )










}

export default Notes


