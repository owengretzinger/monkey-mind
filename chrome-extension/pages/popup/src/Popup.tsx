import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { HATS, hatStorage } from '@extension/storage';

const Popup = () => {
  const selectedHat = useStorage(hatStorage);

  return (
    <div className={`App bg-slate-50`}>
      <header className={`App-header text-gray-900`}>
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
          <h1 className="">Monkey Mind</h1>
          <div className="pt-4">
            <img src={chrome.runtime.getURL('monkey.png')} alt="logo" className="size-16" />
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
