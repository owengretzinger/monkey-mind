import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense, MonkeyVisual } from '@extension/shared';
import { HATS, hatStorage, monkeyStateStorage } from '@extension/storage';
import { useAuth0 } from './auth/Auth0Provider';
import { Login } from './components/Login';
import { useState, useEffect } from 'react';

const MONKEY_COLORS = [
  { hexCode: '#795e5c', hue: 0, isDark: true },
  { hexCode: '#5b6750', hue: 90, isDark: true },
  { hexCode: '#4c696b', hue: 180, isDark: true },
  { hexCode: '#6c6077', hue: 270, isDark: true },
  { hexCode: '#4d8a2d', hue: 30, isDark: false },
  { hexCode: '#008c9c', hue: 120, isDark: false },
  { hexCode: '#4481b9', hue: 150, isDark: false },
  { hexCode: '#a069be', hue: 210, isDark: false },
  { hexCode: '#cc5e8d', hue: 260, isDark: false },
  { hexCode: '#c66558', hue: 300, isDark: false },
];

const Popup = () => {
  const { isAuthenticated, isLoading, logout, user } = useAuth0();
  const [, setAuthenticated] = useState(isAuthenticated);
  const selectedHat = useStorage(hatStorage);
  const monkeyData = useStorage(monkeyStateStorage);
  const currentHat = HATS.find(hat => hat.id === selectedHat) || HATS[0];

  useEffect(() => {
    setAuthenticated(isAuthenticated);
  }, [isAuthenticated]);

  const writeToDatabase = async (userData: any) => {
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
  };

  // Effect to write to the database when authenticated
  useEffect(() => {
    console.log(isLoading, isAuthenticated, user, 'youasdf af');

    // Check if not loading and authenticated
    if (!isLoading && isAuthenticated && user) {
      console.log(isLoading, isAuthenticated, user, 'you are stupdi af');
      writeToDatabase({
        email: user.email,
        name: user.name,
      });
    }
  }, [isAuthenticated]);

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <p className="text-amber-900">Loading...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className={`App bg-slate-50`}>
      <header className={`App-header text-amber-950`}>
        <div className="flex flex-col items-center justify-center space-y-2 p-4">
          {user && (
            <div className="mb-2 flex items-center space-x-2">
              {user.picture && <img src={user.picture} alt="Profile" className="size-8 rounded-full" />}
              <div className="text-left">
                <p className="text-sm font-medium text-amber-900">{user.name}</p>
                <p className="text-xs text-amber-900/75">{user.email}</p>
              </div>
            </div>
          )}

          <div className="relative size-16">
            <MonkeyVisual selectedHat={selectedHat} state="idle" color={monkeyData.color} />
          </div>

          {/* choose color */}
          <div className="flex flex-col gap-2 px-2">
            <div className="grid grid-cols-5 gap-2">
              {MONKEY_COLORS.slice(0, 5).map(({ hue, hexCode, isDark }) => (
                <div key={hexCode} className="flex flex-col items-center">
                  <button
                    className={`size-6 rounded-full ${monkeyData.color.hue === hue && monkeyData.color.isDark === isDark ? 'ring-2 ring-amber-800' : ''}`}
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
              {MONKEY_COLORS.slice(5, 10).map(({ hue, hexCode, isDark }) => (
                <div key={hexCode} className="flex flex-col items-center">
                  <button
                    className={`size-6 rounded-full ${monkeyData.color.hue === hue && monkeyData.color.isDark === isDark ? 'ring-2 ring-amber-800' : ''}`}
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
          </div>

          <div className="pb-1 text-center">
            <p className="text-sm font-medium text-amber-900">{currentHat.name}</p>
            <p className="text-xs text-amber-900/75">{currentHat.description_for_user}</p>
          </div>

          <div className="flex flex-row flex-wrap justify-center gap-4">
            {HATS.map(hat => (
              <button
                key={hat.id}
                title={`${hat.name}: ${hat.description_for_user}`}
                className={`size-8 rounded-xl bg-amber-900/15 ${selectedHat === hat.id && 'ring-2 ring-amber-800'}`}
                style={{
                  backgroundImage: `url(${chrome.runtime.getURL(`hats/${hat.id}.PNG`)})`,
                  backgroundSize: '150%',
                  backgroundPosition: 'top 0 right 10%',
                }}
                onClick={() => hatStorage.setHat(hat.id)}></button>
            ))}
          </div>

          <div className="flex w-full flex-col gap-2 pt-2">
            <button className="rounded-xl bg-amber-900/15 px-2 py-1" onClick={generateMonkeyText}>
              Make Monkey Talk
            </button>
            <button className="rounded-xl bg-amber-900/15 px-2 py-1" onClick={callMonkey}>
              Come Here!
            </button>
            <button className="rounded-xl bg-amber-900/15 px-2 py-1" onClick={() => logout()}>
              Log Out
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
