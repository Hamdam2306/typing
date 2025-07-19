import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { store } from "./store";
import { clearUser, setNickName } from "./auth-slice";


export const logout = async (navigate: (path: string) => void) => {
    try {
        await signOut(auth);
        store.dispatch(clearUser());
        store.dispatch(setNickName(''))
        localStorage.removeItem("nickname")
        navigate("/");
        console.log("User logged out successfully.");
    } catch (error) {
        console.error("Logout error:", error);
    }
};
