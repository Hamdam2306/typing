import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { auth } from "./firebase";
import { setUser, clearUser } from "./auth-slice";
import { Router } from "../../../routes/router";

const AuthObserver = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      
      if (user) {
        const token = await user.getIdToken();
        dispatch(setUser({
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName ?? "",
          token,  

        }));
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, []);

  return <Router />;
};

export default AuthObserver;
