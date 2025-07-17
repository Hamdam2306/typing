import { useNavigate } from "react-router-dom";
import { logout } from "../components/logout";
import { Navbar } from "./navbar"

export const Profile = () => {
  const navigate = useNavigate() 
  
    return (
      <div className="min-h-screen flex flex-col justify-start max-w-7xl mx-auto px-5 py-8">
        <Navbar/>
        <div className="p-10 text-center text-2xl font-bold">
           Profile page
        </div>

        <button onClick={() => logout(navigate)} className="w-max bg-red-600 text-white p-2">logOut</button>
      </div>
        
    );
}


