import Component from "@/components/ui/table-all";
import { Navbar } from "./navbar";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./auth/login/firebase";
import { useAuth } from "@/context/auth-context";


const Leadboard = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
    const [totalTest, setTotalTests] = useState<number>(0)
    const { user } = useAuth(); // user.uid kerak bo'ladi

    useEffect(() => {
        const loadTotal = async () => {
          const statsRef = doc(db, "stats", "tests");
          const snap = await getDoc(statsRef);
      
          console.log("Firestore dan o'qildi:", snap.exists(), snap.data());
      
          if (snap.exists()) {
            setTotalTests(snap.data()?.totalTests || 0);
          }
        };
      
        loadTotal();
      }, []);
      


    useEffect(() => {
        const load = async () => {
            try {
                const q = query(
                    collection(db, "users"),
                    orderBy("score", "desc"),
                    orderBy("percentage", "desc")
                );

                const snapshot = await getDocs(q);
                console.log("Docs:", snapshot.docs.length);

                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setUsers(data);

                // 🔽 Foydalanuvchining o‘rnini aniqlaymiz
                if (user) {
                    const index = data.findIndex((u) => u.id === user.uid);
                    if (index !== -1) {
                        setCurrentUserRank(index + 1);
                    }
                }
            } catch (err) {
                console.error("Xatolik:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user]);

    if (loading) return <p>Yuklanmoqda...</p>;


    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center mt-4">
                <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>


                {totalTest}
                {/* 🔽 Sizning o‘rningiz */}
                {currentUserRank && (
                    <div className="mb-4 text-lg text-green-600 font-semibold">
                        Sizning orningiz: {currentUserRank}
                    </div>
                )}

                <ul className="space-y-2">
                    {users.map((user, index) => (
                        <li key={user.id}>
                            {index + 1}. {user.nickname} – {user.score} WPM – {user.percentage}% - Testlar: {user.testCount || 0}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Leadboard;

