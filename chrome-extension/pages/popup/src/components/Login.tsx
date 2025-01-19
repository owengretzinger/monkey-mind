import { useAuth0 } from '../auth/Auth0Provider';

export const Login = (user: any) => {
  const { loginWithRedirect, error } = useAuth0();

  const handleLogIn = async () => {
    await loginWithRedirect();
  };

  return (
    <div className="App flex h-full flex-col items-center justify-center bg-slate-50 p-4">
      <h1 className="mb-4 text-lg font-bold text-amber-900">Welcome to Monkey Chat</h1>
      <button
        onClick={handleLogIn}
        className="rounded-xl bg-amber-900/15 px-4 py-2 transition-colors hover:bg-amber-900/25">
        Log In
      </button>
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </div>
  );
};
