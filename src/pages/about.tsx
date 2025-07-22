import { Navbar } from "./navbar";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./auth/login/firebase";
import { Users, Hash, Loader2Icon } from "lucide-react";

const About = () => {
    const [loading, setLoading] = useState(true);
    const [totalTest, setTotalTests] = useState<number>(0);
    const [totalUsers, setTotalUsers] = useState<number>(0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const statsRef = doc(db, "stats", "tests");
                const statsSnap = await getDoc(statsRef);

                if (statsSnap.exists()) {
                    const data = statsSnap.data();
                    setTotalUsers(data.totalUsers || 0);
                    setTotalTests(data.totalTests || 0);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div>
            <Navbar />

            {loading ? (
                <div className="flex max-w-4xl mx-auto justify-center ">
                    <div><Loader2Icon className="animate-spin" /></div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto px-6 py-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {/* Total Users */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Users className="w-6 h-6 text-gray-300" />
                                <h2 className="text-xl text-gray-300 font-light">all users</h2>
                            </div>
                            <div className="text-6xl font-light text-gray-100">
                                {totalUsers}
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Hash className="w-6 h-6 text-gray-300" />
                                <h2 className="text-xl text-gray-300 font-light">all tests</h2>
                            </div>
                            <div className="text-6xl font-light text-gray-100">
                                {totalTest}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default About;
