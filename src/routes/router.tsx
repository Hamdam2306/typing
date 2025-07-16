// src/router.tsx
import { Routes, Route } from "react-router-dom";

import TypingArea from "../pages/home-page";
import { LoginForm } from "../pages/auth/login/login-form";
import NotFoundPage from "../pages/not-found.p";


export const Router = () => {
    return (
        <div className="">
            <Routes>
                <Route path="/" element={<TypingArea />} />
                <Route path="/account" element={<LoginForm />} />

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    );
};
