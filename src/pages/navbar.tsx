import { FaInfoCircle, FaKeyboard, FaUserAlt } from "react-icons/fa"
import { IoIosSettings } from "react-icons/io"
import { PiCrownSimpleFill } from "react-icons/pi"
import { RiKeyboardFill } from "react-icons/ri"
import { useSelector } from "react-redux"
import type { RootState } from "./auth/login/store"
import { useNavigate } from "react-router-dom"
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarItem,
} from "@/components/ui/menubar"
import { logout } from "@/components/logout"

export const Navbar = () => {
    const navigate = useNavigate()
    const user = useSelector((state: RootState) => state.auth);


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
                        <PiCrownSimpleFill className="hover:text-yellow-400 cursor-pointer" />
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
                        <MenubarTrigger><FaUserAlt className="text-2xl" /></MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={handleClick} >Profile</MenubarItem>
                            <MenubarItem onClick={() => logout(navigate)}>Log out</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>

            </div>
        </nav>
    )


}