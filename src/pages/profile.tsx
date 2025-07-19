import { useNavigate } from "react-router-dom";
import { logout } from "./auth/login/logout";
import { Navbar } from "./navbar"

export const Profile = () => {
  const navigate = useNavigate()

  return (
    <div>
      <Navbar />
      <div className=" flex flex-col justify-start max-w-7xl mx-auto px-5 py-8">
        <div className="p-10 text-center text-2xl font-bold">
          Profile page
        </div>

      </div>

    </div>

  );
}


