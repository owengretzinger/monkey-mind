import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { HATS, hatStorage } from '@extension/storage';

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('monkey.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here!',
} as const;

const Popup = () => {
  const selectedHat = useStorage(hatStorage);

  const injectMonkey = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    if (tab.url!.startsWith('about:') || tab.url!.startsWith('chrome:')) {
      chrome.notifications.create('inject-error', notificationOptions);
    }

    await chrome.scripting
      .executeScript({
        target: { tabId: tab.id! },
        files: ['/content-runtime/index.iife.js'],
      })
      .catch(err => {
        // Handling errors related to other paths
        if (err.message.includes('Cannot access a chrome:// URL')) {
          chrome.notifications.create('inject-error', notificationOptions);
        }
      });
  };

  return (
    <div className={`App bg-slate-50`}>
      <header className={`App-header text-amber-950`}>
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
          <h1 className="">Monkey Mind</h1>
          <div className="pt-4">
            <img src={chrome.runtime.getURL('monkey.png')} alt="logo" className="size-16" />
          </div>
          <div className="">
            <button className="rounded-xl bg-amber-900/15 px-2 py-1" onClick={injectMonkey}>
              Inject Monkey
            </button>
          </div>
          <div className="">
            <p className="mb-2">Choose your hat</p>
            <div className="flex flex-row flex-wrap justify-center gap-4">
              {HATS.map(hat => (
                <button
                  key={hat}
                  className={`size-8 rounded-xl bg-amber-900/15 ${selectedHat === hat && 'ring-2 ring-amber-800'}`}
                  onClick={() => hatStorage.setHat(hat)}></button>
              ))}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
