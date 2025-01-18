import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense, MonkeyVisual } from '@extension/shared';
import { HATS, hatStorage } from '@extension/storage';
import { useAuth0 } from './auth/Auth0Provider';
import { Login } from './components/Login';

const Popup = () => {
  const { isAuthenticated, isLoading, logout } = useAuth0();
  const selectedHat = useStorage(hatStorage);
  const currentHat = HATS.find(hat => hat.id === selectedHat) || HATS[0];

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

  return (
    <div className={`App bg-slate-50`}>
      <header className={`App-header text-amber-950`}>
        <div className="flex flex-col items-center justify-center space-y-2 p-4">
          <MonkeyVisual selectedHat={selectedHat} state="idle" />

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
            <button 
              className="rounded-xl bg-amber-900/15 px-2 py-1" 
              onClick={() => logout()}
            >
              Log Out
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
