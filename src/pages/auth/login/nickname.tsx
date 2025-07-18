import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export const checkUserNickname = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return data.nickname || null;
  }

  return null;
};
