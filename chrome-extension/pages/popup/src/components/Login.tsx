import { useEffect } from 'react';
import { useAuth0 } from '../auth/Auth0Provider';


export const Login = () => {
  const { loginWithRedirect, error, user, isAuthenticated } = useAuth0();



  const handleLogIn = async () => {
    const login = await loginWithRedirect();
    await writeToDatabase(user)

  }

  const writeToDatabase = async (userData:any) => {
      const apiUrl = "http://localhost:3000/api/users/newUser";

      console.log(userData, user, "HI THERE ATIPF F")
      const response = await fetch(apiUrl, {
        method: 'POST', // Use POST method to send data
        headers: {
          'Content-Type': 'application/json', // Specify the content type
        },
        body: JSON.stringify(userData),
      });
  
      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! Statuasdfadsfs: ${response.status}`);
      }
  
      const data = await response.json(); // Parse the JSON data
      console.log("Fetched Data:", data); // Handle the data
   
  };




  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-slate-50">
      <h1 className="text-lg font-bold text-amber-900 mb-4">Welcome to Monkey Chat</h1>
      <button
        onClick={handleLogIn}
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