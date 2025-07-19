import { useNavigate } from "react-router-dom";
import { Navbar } from "./navbar";
import { useEffect, useState } from "react";  
import { onAuthStateChanged } from "firebase/auth"; 
import { doc, getDoc } from "firebase/firestore"; 
import { auth, db } from "./auth/login/firebase";

export const Profile = () => {
  const navigate = useNavigate();
  const [userWpm, setUserWpm] = useState<number | null>(null);
  const [userAccuracy, setUserAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserWpm(userData.score || 0); 
            setUserAccuracy(userData.percentage || 0); 
          } else {
            console.log("No such user document!");
            setError("User data not found.");
            setUserWpm(0); 
            setUserAccuracy(0); 
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to fetch user data.");
          setUserWpm(0);
          setUserAccuracy(0);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No user signed in.");
        setLoading(false);
        setUserWpm(null);
        setUserAccuracy(null);
        navigate("/login"); 
      }
    });

    return () => unsubscribe(); 
  }, [navigate]); 

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col max-w-7xl mx-auto px-5 py-8 items-center justify-center min-h-[calc(100vh-10rem)]">
          <p className="text-2xl text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col max-w-7xl mx-auto px-5 py-8 items-center justify-center min-h-[calc(100vh-6rem)]">
          <p className="text-2xl text-red-600">Error: {error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-md text-lg hover:bg-blue-600 transition duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col max-w-7xl mx-auto px-2 py-4 items-center justify-center min-h-[calc(100vh-10rem)]">
        {userWpm !== null && (
          <div className="text-9xl font-bold text-gray-800 mb-4 animate-fade-in">
            {userWpm} <span className="text-6xl text-gray-600">wpm</span>
          </div>
        )}
        {userAccuracy !== null && (
          <div className="text-9xl font-bold text-gray-800 animate-fade-in delay-200">
            {userAccuracy} <span className="text-6xl text-gray-600">%</span>
          </div>
        )}
        {userWpm === null && userAccuracy === null && (
          <p className="text-2xl text-gray-600">No score data available yet.</p>
        )}

      </div>
    </div>
  );
};