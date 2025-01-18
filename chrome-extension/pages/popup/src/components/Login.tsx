import { useAuth0 } from '../auth/Auth0Provider';

export const Login = () => {
  const { loginWithRedirect, error } = useAuth0();

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-slate-50">
      <h1 className="text-lg font-bold text-amber-900 mb-4">Welcome to Monkey Chat</h1>
      <button
        onClick={() => loginWithRedirect()}
        className="rounded-xl bg-amber-900/15 px-4 py-2 hover:bg-amber-900/25 transition-colors"
      >
        Log In
      </button>
      {error && (
        <p className="mt-4 text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}; 