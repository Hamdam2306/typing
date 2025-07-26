// import { db } from "@/pages/auth/login/firebase";
// import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";

// export const fetchLeaderboard = async () => {
//   const userCollectionRef = collection(db, "users");

//   const q = query(userCollectionRef, orderBy("score", "desc"), limit(100)); // Eng yuqori 10 ta

//   const querySnapshot = await getDocs(q);

//   const leaderboard = querySnapshot.docs.map(doc => ())

//   return querySnapshot
// };
