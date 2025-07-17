import { useState, useRef } from "react";
import { loginUser } from "./login";
import { signInWithGoogle } from "./sign-with-google";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSave: (nickname: string) => void;
}

export const LoginForm = ({ onSave }: Props) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [nickname, setNickname] = useState("");
  const [showNickName, setShowNickName] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onSave(nickname.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Fixed missing parentheses
    setSubmitError(null);

    if (!validateForm()) {
      setSubmitError("Please fill in all required fields correctly.");
      setTimeout(() => setSubmitError(null), 2000);
      return;
    }

    setIsLoading(true);

    try {
      const user = await loginUser(formData);
      console.log("Logged in:", user);

      if (formRef.current) {
        formRef.current.classList.add("success");
        setTimeout(() => {
          if (formRef.current) formRef.current.classList.remove("success");
        }, 2000);
      }

      setIsLoading(false);
      setShowNickName(true); // Show nickname input after successful login

    } catch (error: any) {
      console.error("Login error:", error);

      if (error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential") {
        setSubmitError("Email/password is incorrect or your account does not have password authentication enabled");
        setTimeout(() => setSubmitError(null), 2000);
      } else if (error.code === "auth/too-many-requests") {
        setSubmitError("Too many attempts. Please wait and try again later");
        setTimeout(() => setSubmitError(null), 2000);

      } else if (error.code === "auth/invalid-email") {
        setSubmitError("Invalid email format");
        setTimeout(() => setSubmitError(null), 2000);

      } else {
        setSubmitError("Sign-in failed. Please try again later");
        setTimeout(() => setSubmitError(null), 2000);

      }
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitError(null);
    setIsLoading(true);

    try {
      const user = await signInWithGoogle();
      console.log("Logged in with Google:", user);

      if (formRef.current) {
        formRef.current.classList.add("success");
        setTimeout(() => {
          if (formRef.current) formRef.current.classList.remove("success");
        }, 1000);
      }


      setTimeout(() => {
        setIsLoading(false);
        setShowNickName(true)

        if (showNickName) {
          navigate('/profile')
        }
      }, 100);
    } catch (error: any) {
      console.error("Google sign-in error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        setSubmitError("Google sign-in was interrupted. Please try again");
        setTimeout(() => setSubmitError(null), 2000);

      } else {
        setSubmitError("Google login failed. Try again later");
        setTimeout(() => setSubmitError(null), 2000);

      }
      setIsLoading(false);
    }
  };



  return (
    <div className="flex justify-center gap-20">


      {showNickName ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#111111] rounded-2xl shadow-xl w-[300px] h-[200px] p-6 flex flex-col justify-between">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (nickname.trim()) {
                  navigate('/');
                }
              }}
              className="flex flex-col h-full justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold text-center mb-2 text-white">Enter Nickname</h2>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Your nickname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 rounded-lg transition-colors"
              >
                Save
              </button>
            </form>
          </div>
        </div>

      ) : (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-[#1f1f1f] text-white rounded-xl shadow-md p-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <AnimatePresence>
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{ type: "spring", damping: 25, stiffness: 500 }}
                      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
                    >
                      <div className="bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3">
                        <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{submitError}</p>
                        </div>
                        <button
                          onClick={() => setSubmitError(null)}
                          className="text-white/80 hover:text-white transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>


                <div>
                  <label className="text-sm block mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="text-sm block mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-transparent border border-gray-700 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-400"
                    >
                      {showPassword ? (
                        <EyeIcon />
                      ) : (
                        <EyeOffIcon />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-blue-600 hover:bg-blue-700 transition text-white font-medium rounded px-4 py-2 ${isLoading && 'opacity-75 cursor-not-allowed'}`}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="flex items-center my-4 text-sm text-gray-500">
                  <div className="flex-grow border-t border-gray-700"></div>
                  <span className="mx-4">or</span>
                  <div className="flex-grow border-t border-gray-700"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded border border-gray-600 hover:bg-gray-800 transition"
                >
                  <FcGoogle />
                  <span>Sign in with Google</span>
                </button>

              </form>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};