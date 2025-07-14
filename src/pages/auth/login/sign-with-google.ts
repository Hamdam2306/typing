// auth/login.ts (yoki boshqa faylga ham yozsa bo‘ladi)
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../register/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { printUserInfo } from "./user-print";

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);

  const user = userCredential.user;
  printUserInfo(user)

  // 🔄 Firestore’da foydalanuvchi mavjudmi, yo‘qmi tekshiramiz
  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    // ✅ Foydalanuvchi birinchi marta kirgan bo‘lsa — Firestore’da hujjat yaratamiz
    await setDoc(userRef, {
      firstname: user.displayName?.split(" ")[0] || "",
      lastname: user.displayName?.split(" ")[1] || "",
      email: user.email,
      phone: user.phoneNumber || "",
      age: null,
      role: "user",
      createdAt: serverTimestamp()
    });
  }

  return user;
};
