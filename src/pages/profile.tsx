import { useNavigate } from "react-router-dom";
import { Navbar } from "./navbar";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {  doc, getDoc } from "firebase/firestore";
import { auth, db } from "./auth/login/firebase";
import { Zap, Target, Hash, Loader2Icon } from "lucide-react";

export const Profile = () => {
  const navigate = useNavigate();
  const [userWpm, setUserWpm] = useState<number | null>(null);
  const [userAccuracy, setUserAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTestCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserScore = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setTestCount(userData.testCount || 0);
      }
    };

    fetchUserScore();
  }, []);

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
        <div className="max-w-4xl mx-auto flex justify-center">
          <div><Loader2Icon className="animate-spin"/></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="text-gray-300 text-lg mb-6">{error}</div>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-gray-800 text-gray-100 hover:bg-gray-700 transition-colors"
          >
            Login o'tish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Main Stats */}
        <div className="text-center mb-16">
          {userWpm !== null && userAccuracy !== null ? (
            <div className="space-y-8">

              <div className="flex items-center justify-center gap-3">
                <Zap className="w-8 h-8 text-gray-300" />
                <span className="text-6xl font-light text-gray-100">{userWpm}</span>
                <span className="text-2xl text-gray-400 mt-4">WPM</span>
              </div>

              {/* Accuracy */}
              <div className="flex items-center justify-center gap-3">
                <Target className="w-8 h-8 text-gray-300" />
                <span className="text-6xl font-light text-gray-100">{userAccuracy}</span>
                <span className="text-2xl text-gray-400 mt-4">%</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-lg">Ma'lumotlar topilmadi</div>
          )}
        </div>

        {/* Tests Count */}
        <div className="text-center">
          {totalCount !== null ? (
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Hash className="w-5 h-5" />
              <span>Completed tests: {totalCount}</span>
            </div>
          ) : (
            <div><Loader2Icon className="animate-spin" /> Please wait</div>
          )}
        </div>
      </div>
    </div>
  );
};