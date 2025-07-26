import { FaInfoCircle, FaKeyboard, FaUserAlt } from "react-icons/fa"
import { PiCrownSimpleFill } from "react-icons/pi"
import { RiKeyboardFill, RiSettings2Fill } from "react-icons/ri"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "./auth/login/store"
import { useNavigate } from "react-router-dom"
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarItem,
} from "@/components/ui/menubar"
import { logout } from "@/pages/auth/login/logout"
import { auth, db } from "./auth/login/firebase"
import { useEffect } from "react"
import { setNickName } from "./auth/login/auth-slice"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

export const Navbar = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const user = useSelector((state: RootState) => state.auth);
    const nickname = useSelector((state: any) => state.auth.nickname)

    useEffect(() => {
        if (!nickname) {
            const savedNickname = localStorage.getItem("nickname");
            if (savedNickname) {
                dispatch(setNickName(savedNickname));
            }
        }
    }, [nickname]);


    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    const data = snap.data();
                    dispatch(setNickName(data.nickname));
                    localStorage.setItem("nickname", data.nickname);
                }
            } else {
                dispatch(setNickName(""));
                localStorage.removeItem("nickname");
            }
        });

        return () => unsubscribe();
    }, []);

    const handleClick = () => {
        if (user.uid) {
            navigate("/profile");
        } else {
            navigate("/account");
        }
    }


    return (

        <nav>

            <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto px-0 pt-5">
                <div className="flex items-center gap-3 text-white">
                    <div onClick={() => { navigate('/') }} className="flex gap-2 items-center cursor-pointer">
                        <RiKeyboardFill className="text-3xl" />
                        <h1 className="text-3xl font-bold">GoTyping</h1>
                    </div>

                    <div className="flex items-center gap-4 ml-6 text-2xl">
                        <FaKeyboard onClick={() => { navigate('/') }} className="hover:text-blue-400 cursor-pointer" />
                        <PiCrownSimpleFill onClick={() => { navigate('/leadboard') }} className="hover:text-yellow-400 cursor-pointer" />
                        <FaInfoCircle onClick={() => { navigate('/about') }} className="hover:text-sky-400 cursor-pointer" />
                        <RiSettings2Fill />
                        
                    </div>
                </div>

                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger><FaUserAlt className="text-2xl flex gap-2 cursor-pointer" />{nickname}</MenubarTrigger>
                        <MenubarContent>
                            {
                                auth.currentUser ? <>
                                    <MenubarItem onClick={handleClick} >Profile</MenubarItem>
                                    <MenubarItem onClick={() => logout(navigate)}>Log out</MenubarItem>
                                </> : <MenubarItem onClick={handleClick} >Login</MenubarItem>
                            }
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>

            </div>
        </nav>
    )


}