import { Navbar } from "./navbar";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./auth/login/firebase";
import { useAuth } from "@/context/auth-context";
import { Trophy, Zap, Target, User, Loader2Icon } from "lucide-react";
import { BiBarChart } from "react-icons/bi";


const Leadboard = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
    const [totalTest, setTotalTests] = useState<number>(0);
    const { user } = useAuth();
    
    
    useEffect(() => {
        const loadTotal = async () => {
            const statsRef = doc(db, "stats", "tests");
            const snap = await getDoc(statsRef);

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
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsers(data);
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

    const getRankDisplay = (rank: number) => {
        if (rank === 1) return <Trophy className="w-5 h-5 text-white" />;
        if (rank === 2) return <Trophy className="w-5 h-5 text-gray-300" />;
        if (rank === 3) return <Trophy className="w-5 h-5 text-gray-400" />;
        return <span className="text-gray-300 font-medium">#{rank}</span>;
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="flex max-w-4xl mx-auto justify-center">
                    <div><Loader2Icon className="animate-spin" /></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-1">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-light text-gray-100 mb-2">Leaderboard</h1>
                    <div className="text-xl flex items-center justify-center gap-8 text-gray-400">
                        <span className="flex items-center"> <BiBarChart /> all tests: {totalTest}</span>
                        {currentUserRank && (
                            <span className="text-xl flex items-center gap-1">
                                <User className="w-4 h-4 text-gray-300" />
                                your position: #{currentUserRank}
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    {users.map((userData, index) => {
                        const rank = index + 1;
                        const isCurrentUser = user && userData.id === user.uid;

                        return (
                            <div
                                key={userData.id}
                                className={`grid grid-cols-12 items-center gap-4 py-4 px-2 transition-colors ${isCurrentUser ? 'bg-gray-800' : ''
                                    }`}
                            >
                                <div className="col-span-1 flex justify-center">
                                    {getRankDisplay(rank)}
                                </div>

                                <div className="col-span-5">
                                    <div className={`font-medium truncate ${isCurrentUser ? 'text-white' : 'text-gray-100'}`}>
                                        {userData.nickname}
                                    </div>
                                    <div className="text-sm text-gray-400 truncate">
                                        tests: {userData.testCount || 0}
                                    </div>
                                </div>

                                <div className="col-span-3 flex items-center justify-center gap-1">
                                    <Zap className="w-4 h-4 text-gray-300" />
                                    <span className="font-medium text-gray-100">{userData.score}</span>
                                    <span className="text-gray-400 text-sm">WPM</span>
                                </div>

                                <div className="col-span-3 flex items-center justify-center gap-1">
                                    <Target className="w-4 h-4 text-gray-300" />
                                    <span className="font-medium text-gray-100">{userData.percentage}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Leadboard;