import { signOut } from "firebase/auth";
import { auth } from "../pages/auth/login/firebase";
import { store } from "../pages/auth/login/store";
import { clearUser } from "../pages/auth/login/auth-slice";


export const logout = async (navigate: (path: string) => void) => {
    try {
        await signOut(auth);
        store.dispatch(clearUser());
        navigate("/");
        console.log("User logged out successfully.");
    } catch (error) {
        console.error("Logout error:", error);
    }
};
