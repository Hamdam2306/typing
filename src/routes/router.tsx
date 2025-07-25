import { Routes, Route } from "react-router-dom";
import TypingArea from "../pages/home-page.tsx";
import { LoginForm } from "../pages/auth/login/login-form";
import NotFoundPage from "../pages/not-found.p";
import { Profile } from "../pages/profile.tsx";
import PrivateRoute from "../components/privaterouter.tsx";
import Leadboard from "@/pages/leadboard.tsx";
import About from "@/pages/about.tsx";


export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<TypingArea />} />
      <Route path="/account" element={<LoginForm />} />
      <Route path="/leadboard" element={<Leadboard />} />
      <Route path="/about" element={<About />} />


      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
