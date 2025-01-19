import '@src/Popup.css';
import { MonkeyComponent, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { HATS, MONKEY_COLORS, monkeyStateStorage } from '@extension/storage';
import type { User } from '@extension/storage';
import { useCallback, useEffect, useRef, useState } from 'react';

const Popup = () => {
  const monkey = useStorage(monkeyStateStorage);
  const hat = HATS.find(h => h.id === monkey.hatId)!;
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(monkey.user.displayName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName) {
      inputRef.current?.focus();
    }
  }, [isEditingName]);

  const writeToDatabase = useCallback(async (userData: User) => {
    const apiUrl = 'http://localhost:3000/api/users/newUser';
    console.log(userData);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error writing to database:', errorData);
    } else {
      const responseData = await response.json();
      console.log('User data written successfully:', responseData);
    }
  }, []);

  const generateMonkeyText = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'GENERATE_TEXT' });
    }
  };

  const callMonkey = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'COME_HERE' });
    }
  };

  const leaveNote = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'ADD_NOTE' });
    }
  };

  const handleUpdateDisplayName = () => {
    if (newDisplayName.trim()) {
      monkeyStateStorage.setDisplayName(newDisplayName.trim());
      setIsEditingName(false);
    }
  };

  if (!monkey.user.id) {
    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      displayName: `${userId.slice(0, 6)}`,
    };
    monkeyStateStorage.setUser(user);
    writeToDatabase(user);
  }

  return (
    <div className={`App`}>
      <header className={`App-header text-amber-950`}>
        <div className="bg-amber-800/5">
          <div className="flex w-full items-center gap-1 p-1 text-left">
            {isEditingName ? (
              <div className="flex w-full gap-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={newDisplayName}
                  onChange={e => setNewDisplayName(e.target.value)}
                  className="flex-1 rounded border border-amber-800/30 bg-amber-50 px-1"
                  onKeyDown={e => e.key === 'Enter' && handleUpdateDisplayName()}
                />
                <button onClick={handleUpdateDisplayName} className="text-amber-800 hover:text-amber-900">
                  Save
                </button>
                <button onClick={() => setIsEditingName(false)} className="text-amber-800 hover:text-amber-900">
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span className="text-sm">{monkey.user.displayName}</span>
                <button onClick={() => setIsEditingName(true)} className="ml-1 text-amber-800 hover:text-amber-900">
                  Edit Name
                </button>
              </>
            )}
          </div>
          <div className="flex flex-col items-center justify-center space-y-2 p-4">
            <div className="relative size-16">
              <MonkeyComponent
                state={{
                  ...monkey,
                  currentAction: 'idle',
                  position: { x: 0, y: 0 },
                }}
              />
            </div>

            {/* choose color */}
            <div className="flex gap-1">
              {MONKEY_COLORS.map(({ hue, hexCode, isDark }) => (
                <div key={hexCode} className="flex flex-col items-center">
                  <button
                    className={`size-5 rounded-full ${monkey.color.hue === hue && monkey.color.isDark === isDark ? 'ring-2 ring-amber-800' : ''}`}
                    style={{
                      backgroundColor: hexCode,
                    }}
                    onClick={() => {
                      monkeyStateStorage.setColor({
                        hue,
                        isDark,
                      });
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="pb-1 text-center">
              <p className="text-sm font-medium text-amber-900">{hat.name}</p>
              <p className="text-xs text-amber-900/75">{hat.description_for_user}</p>
            </div>

            <div className="mx-5 flex flex-row flex-wrap justify-center gap-2">
              {HATS.map(h => (
                <button
                  key={h.id}
                  title={`${h.name}: ${h.description_for_user}`}
                  className={`size-8 rounded-xl bg-amber-900/15 p-0.5 ${monkey.hatId === h.id && 'ring-2 ring-amber-800'}`}
                  onClick={() => monkeyStateStorage.setHat(h.id)}>
                  <img src={chrome.runtime.getURL(`hats/icons/${h.id}.PNG`)} alt={h.name} className="" />
                </button>
              ))}
            </div>

            <div className="flex w-full flex-col gap-2 pt-2">
              <button className="rounded-xl bg-amber-900/15 px-2 py-1" onClick={callMonkey}>
                Summon Monkey
              </button>
              <button className="rounded-xl bg-amber-900/15 px-2 py-1" onClick={generateMonkeyText}>
                Make Monkey Talk
              </button>
              <button className="rounded-xl bg-amber-900/15 px-2 py-1" onClick={leaveNote}>
                Leave A Note
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
