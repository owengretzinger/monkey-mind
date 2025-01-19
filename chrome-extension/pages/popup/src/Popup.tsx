import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense, MonkeyVisual } from '@extension/shared';
import { HATS, MONKEY_COLORS, monkeyStateStorage } from '@extension/storage';
import { useAuth0 } from './auth/Auth0Provider';
import { Login } from './components/Login';
import { useState, useEffect, useCallback } from 'react';

const Popup = () => {
  const { isAuthenticated, isLoading, logout, user } = useAuth0();
  const [, setAuthenticated] = useState(isAuthenticated);
  const monkey = useStorage(monkeyStateStorage);
  const hat = HATS.find(h => h.id === monkey.hatId)!;

  useEffect(() => {
    setAuthenticated(isAuthenticated);
  }, [isAuthenticated]);

  interface UserData {
    email: string;
    name: string;
  }

  const writeToDatabase = useCallback(async (userData: UserData) => {
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

  // Effect to write to the database when authenticated
  useEffect(() => {
    console.log(isLoading, isAuthenticated, user, 'youasdf af');

    // Check if not loading and authenticated
    if (!isLoading && isAuthenticated && user) {
      console.log(isLoading, isAuthenticated, user, 'you are stupdi af');
      writeToDatabase({
        email: user.email ?? '',
        name: user.name ?? '',
      });
    }
  }, [isAuthenticated, isLoading, user, writeToDatabase]);

  // const logoutHandler = () => {
  //   logoutHelper({ federated: true });
  //   fetch(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/v2/logout?federated=true&client_id=${process.env.REACT_APP_AUTH0_CLIENT_ID}`, {
  //     credentials: 'include',
  //     mode: 'no-cors'
  //   }).catch();
  // };

  // const logoutHelper = (options) => {
  //   logout(options);
  //   setAuthenticated(false);
  // };

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-amber-900">Loading...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className={`App`}>
      <header className={`App-header text-amber-950`}>
        <div className="bg-amber-800/5">
          {user && (
            <div className="flex w-full items-center gap-1 p-1 text-left text-[10px]">
              Logged in as
              <img src={user.picture} alt="Profile" className="inline size-4 rounded-full" />
              {user.name}.
              <button className="underline" onClick={() => logout()}>
                Log Out
              </button>
            </div>
          )}
          <div className="flex flex-col items-center justify-center space-y-2 p-4">
            <div className="relative size-16">
              <MonkeyVisual
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
