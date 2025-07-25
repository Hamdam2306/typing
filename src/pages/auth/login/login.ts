import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";


interface LoginData {
    email: string;
    password: string;
}

export const loginUser = async ({ email, password }: LoginData) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};


