import { Routes, Route, data } from "react-router-dom";
import TypingArea from "../pages/home-page";
import { LoginForm } from "../pages/auth/login/login-form";
import NotFoundPage from "../pages/not-found.p";
import { Profile } from "../pages/profile.tsx";
import PrivateRoute from "../components/privaterouter.tsx";


export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<TypingArea />} />
      <Route path="/account" element={<LoginForm onSave={(data)}/>} />

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
