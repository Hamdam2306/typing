import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyBd2f_3dMRZ-EGnYXKK9RjE-27gI4H_xXM",
    authDomain: "typing-55338.firebaseapp.com",
    projectId: "typing-55338",
    storageBucket: "typing-55338.firebasestorage.app",
    messagingSenderId: "108650842424",
    appId: "1:108650842424:web:3b375820502f13551699cd",
    measurementId: "G-YQBB2Y5H6E"
  };

const app = initializeApp(firebaseConfig);

// Auth va Firestore instance'larini eksport qilish
export const auth = getAuth(app);
export const db = getFirestore(app);
