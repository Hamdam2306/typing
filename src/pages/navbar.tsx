import { FaInfoCircle, FaKeyboard, FaUserAlt } from "react-icons/fa"
import { IoIosSettings } from "react-icons/io"
import { PiCrownSimpleFill } from "react-icons/pi"
import { RiKeyboardFill } from "react-icons/ri"
import { useSelector } from "react-redux"
import type { RootState } from "./auth/login/store"
import { useNavigate } from "react-router-dom"



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
    return (
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-white">
                <div onClick={() => { navigate('/') }} className="flex gap-2 items-center">
                    <RiKeyboardFill className="text-3xl" />
                    <h1 className="text-3xl font-bold">GoTyping</h1>
                </div>

                <div className="flex items-center gap-4 ml-6 text-lg">
                    <FaKeyboard className="hover:text-blue-400 cursor-pointer" />
                    <PiCrownSimpleFill className="hover:text-yellow-400 cursor-pointer" />
                    <FaInfoCircle className="hover:text-sky-400 cursor-pointer" />
                    <IoIosSettings className="hover:text-gray-300 cursor-pointer" />
                </div>
            </div>

            <button
                onClick={handleClick}
                className="flex items-center gap-2 text-white"
            >
                <FaUserAlt className="text-lg" />
            </button>

        </div>
    )
}