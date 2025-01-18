import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense, MonkeyVisual } from '@extension/shared';
import { HATS, hatStorage } from '@extension/storage';

const Popup = () => {
  const selectedHat = useStorage(hatStorage);
  const currentHat = HATS.find(hat => hat.id === selectedHat);

  const generateMonkeyText = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'GENERATE_TEXT' });
    }
  };

  return (
    <div className={`App bg-slate-50`}>
      <header className={`App-header text-amber-950`}>
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
          <h1 className="">Monkey Mind</h1>
          <MonkeyVisual selectedHat={selectedHat} />
          <div className="">
            <button className="rounded-xl bg-amber-900/15 px-2 py-1" onClick={generateMonkeyText}>
              Make Monkey Talk
            </button>
          </div>
          <div className="">
            <p className="mb-2">Choose your hat</p>
            {currentHat && <p className="mb-2 text-sm text-amber-900/75">{currentHat.name}</p>}
            <div className="flex flex-row flex-wrap justify-center gap-4">
              {HATS.map(hat => (
                <button
                  key={hat.id}
                  title={`${hat.name}: ${hat.description}`}
                  className={`size-8 rounded-xl bg-amber-900/15 ${selectedHat === hat.id && 'ring-2 ring-amber-800'}`}
                  style={{
                    backgroundImage: `url(${chrome.runtime.getURL(`hats/${hat.id}.PNG`)})`,
                    backgroundSize: '150%',
                    backgroundPosition: 'top 0 right 10%',
                  }}
                  onClick={() => hatStorage.setHat(hat.id)}></button>
              ))}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
