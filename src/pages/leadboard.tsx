import { Navbar } from "./navbar";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./auth/login/firebase";
import { Trophy, Zap, Target, User as UserIcon, Loader2 } from "lucide-react";
import { BiBarChart } from "react-icons/bi";
import { useState } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

type LeaderboardUser = {
  id: string;
  nickname: string;
  score: number;
  percentage: number;
  testCount?: number;
};

type Stats = {
  totalTests: number;
};

const fetchTotalTests = async (): Promise<Stats> => {
  const statsRef = doc(db, "stats", "tests");
  const snap = await getDoc(statsRef);
  if (!snap.exists()) throw new Error("Stats hujjati topilmadi");
  return { totalTests: snap.data().totalTests || 0 };
};

const fetchLeaderboard = async (): Promise<LeaderboardUser[]> => {
  const q = query(
    collection(db, "users"),
    orderBy("score", "desc"),
    orderBy("percentage", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map<LeaderboardUser>((doc) => ({
    id: doc.id,
    nickname: (doc.data() as DocumentData).nickname,
    score: (doc.data() as DocumentData).score,
    percentage: (doc.data() as DocumentData).percentage,
    testCount: (doc.data() as DocumentData).testCount,
  }));
};

const Leadboard = () => {
  const { user } = useAuth();
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const { data: statsData, isLoading: statsLoading, isError: statsError, error: statsErrorObj } =
    useQuery<Stats, Error>({
      queryKey: ["stats", "tests"],
      queryFn: fetchTotalTests,
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    });

  const { data: usersData, isLoading: usersLoading, isError: usersError, error: usersErrorObj } =
    useQuery<LeaderboardUser[], Error>({
      queryKey: ["leaderboard"],
      queryFn: fetchLeaderboard,
      staleTime: 1000 * 60,
    });

  const loading = statsLoading || usersLoading;
  const isError = statsError || usersError;
  const errorMessage = statsError
    ? statsErrorObj?.message
    : usersError
    ? usersErrorObj?.message
    : "";

  const totalTests = statsData?.totalTests ?? 0;
  const users = usersData ?? [];
  const totalPages = Math.ceil(users.length / PAGE_SIZE);

  // Sahifalangan ma'lumot
  const pagedUsers = users.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const currentUserRank =
    user && users.length ? users.findIndex((u) => u.id === user.uid) + 1 : null;

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-[#efed40]" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-800" />;
    return <span className="text-gray-300 font-medium">#{rank}</span>;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex max-w-4xl mx-auto justify-center py-10">
          <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <Navbar />
        <div className="max-w-4xl mx-auto text-center text-red-500 py-10">
          Xatolik yuz berdi: {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-0">
        <div className="text-center mb-2">
          <h1 className="text-xl font-light text-gray-100 mb-1">Leaderboard</h1>
          <div className="text-xl flex items-center justify-center gap-8 text-gray-400">
            <span className="flex items-center">
              <BiBarChart className="mr-1" /> all tests: {totalTests}
            </span>
            {currentUserRank && (
              <span className="flex items-center gap-1">
                <UserIcon className="w-4 h-4 text-gray-300" />
                your position: #{currentUserRank}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          {pagedUsers.map((userData, idx) => {
            const absoluteRank = (currentPage - 1) * PAGE_SIZE + idx + 1;
            const isCurrent = user && userData.id === user.uid;
            return (
              <div
                key={userData.id}
                className={`grid grid-cols-12 items-center gap-4 py-2 px-2 transition-colors ${
                  isCurrent ? "bg-gray-800" : ""
                }`}
              >
                <div className="col-span-1 flex justify-center">
                  {getRankDisplay(absoluteRank)}
                </div>
                <div className="col-span-5">
                  <div
                    className={`font-medium truncate ${
                      isCurrent ? "text-white" : "text-gray-100"
                    }`}
                  >
                    {userData.nickname}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    tests: {userData.testCount ?? 0}
                  </div>
                </div>
                <div className="col-span-3 flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 text-gray-300" />
                  <span className="font-medium text-gray-100">{userData.score}</span>
                  <span className="text-gray-400 text-sm">WPM</span>
                </div>
                <div className="col-span-3 flex items-center justify-center gap-1">
                  <Target className="w-4 h-4 text-gray-300" />
                  <span className="font-medium text-gray-100">
                    {userData.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded border text-gray-100 disabled:opacity-50"
          >
            <MdNavigateBefore />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded border ${
                page === currentPage
                  ? "bg-gray-700 text-white"
                  : "text-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded border text-gray-100 disabled:opacity-50"
          >
            <MdNavigateNext/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leadboard;
