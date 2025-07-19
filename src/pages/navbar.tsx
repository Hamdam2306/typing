import { FaInfoCircle, FaKeyboard, FaUserAlt } from "react-icons/fa"
import { IoIosSettings } from "react-icons/io"
import { PiCrownSimpleFill } from "react-icons/pi"
import { RiKeyboardFill } from "react-icons/ri"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "./auth/login/store"
import { data, useNavigate } from "react-router-dom"
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
                    localStorage.setItem("nickname", data.nickname); // fallback
                }
            } else {
                dispatch(setNickName("")); // logout holatida tozalash
                localStorage.removeItem("nickname");
            }
        });

        return () => unsubscribe(); // memory tozalash
    }, []);

    const handleClick = () => {
        if (user.uid) {
            navigate("/profile");
        } else {
            navigate("/account");
        }
    }

    // useEffect(() => {
    //     const handleKey = (e: KeyboardEvent) => {
    //         if (e.key === "Tab") {
    //             e.preventDefault();
    //             btnRef2.current?.blur();
    //         }
    //     }
    //     window.addEventListener("keydown", handleKey);
    //     return () => window.removeEventListener("keydown", handleKey);
    // })


    return (

        <nav>

            <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto px-5 py-8">
                <div className="flex items-center gap-3 text-white">
                    <div onClick={() => { navigate('/') }} className="flex gap-2 items-center">
                        <RiKeyboardFill className="text-3xl" />
                        <h1 className="text-3xl font-bold">GoTyping</h1>
                    </div>

                    <div className="flex items-center gap-4 ml-6 text-xl">
                        <FaKeyboard className="hover:text-blue-400 cursor-pointer" />
                        <PiCrownSimpleFill onClick={() => {navigate('leadboard')}} className="hover:text-yellow-400 cursor-pointer" />
                        <FaInfoCircle className="hover:text-sky-400 cursor-pointer" />
                        <IoIosSettings className="hover:text-gray-300 cursor-pointer" />
                    </div>
                </div>

                {/* <button
                    onClick={handleClick}
                    className="flex items-center gap-2 text-white"
                >
                    <FaUserAlt className="text-lg" />
                </button> */}



                {/* <button onClick={() => logout(navigate)} className="w-max bg-red-600 text-white p-2">logOut</button> */}

                <Menubar>
                    <MenubarMenu>

                        <MenubarTrigger><FaUserAlt className="text-2xl flex gap-2" />{nickname || "Guest"}</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={handleClick} >Profile</MenubarItem>
                            <MenubarItem onClick={() => logout(navigate)}>Log out</MenubarItem>
                        </MenubarContent>
                        {/* <p>{nickname}</p> */}
                    </MenubarMenu>
                </Menubar>

            </div>
        </nav>
    )


}