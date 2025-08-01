import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      firstname: user.displayName?.split(" ")[0] || "",
      lastname: user.displayName?.split(" ")[1] || "",
      nickname: null,
      email: user.email,
      role: "user",
      createdAt: serverTimestamp(),
      score: 0,
      percentage: 0,
      records: {
        
      }
    });
  }

  return user;
};
