// Tahrirlangan: Google login, nickname tekshiruv va saqlash to'liq ishlaydi
import { useState, useRef, useEffect } from "react";
import { loginUser } from "./login";
import { signInWithGoogle } from "./sign-with-google";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Loader2Icon, X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/pages/navbar";
import { Button } from "@/components/ui/button";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { checkUserNickname } from "./nickname";
import { doc, updateDoc, getDocs, collection, query, where } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { setNickName } from "./auth-slice";
import { RegisterForm } from "../register/register-form";

export const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nickname, setNickname] = useState("");
  const [showNickNameModal, setShowNickName] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

  const dispatch = useDispatch()
  localStorage.setItem("nickname", nickname)
  dispatch(setNickName(nickname))

  

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setIsLoading(false);

      const nickname = await checkUserNickname();
      if (!nickname) setShowNickName(true);
      else navigate("/profile");
    } catch (error: any) {
      setSubmitError("Login failed. Check credentials or try again later.");
      setTimeout(() => setSubmitError(null), 2000);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitError(null);
    setIsLoading(true);
    // let classname = '';
    try {
      const user = await signInWithGoogle();
      console.log("Logged in with Google:", user);

      const nickname = await checkUserNickname();
      if (!nickname) {
        setShowNickName(true);
      }
      else {
        navigate("/profile")
      }
      setIsLoading(false);

      // classname = nickname

    } catch (error: any) {
      setSubmitError("Google login failed. Try again later");
      setTimeout(() => setSubmitError(null), 2000);
      setIsLoading(false);
    }
  };

  const handleSaveNickname = async () => {
    const user = auth.currentUser;
    if (!user || !nickname.trim()) return;

    const q = query(collection(db, "users"), where("nickname", "==", nickname));
    const qSnap = await getDocs(q);
    if (!qSnap.empty) {
      setSubmitError("this nickname is already in use");
      alert('this nick name is already in use')
      setTimeout(() => setSubmitError(null), 2000);
      return;
    }

    await updateDoc(doc(db, "users", user.uid), { nickname });
    navigate("/profile");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const nickname = await checkUserNickname();
        if (nickname) {
          setShowNickName(false);
          navigate("/profile");
        } else {
          setShowNickName(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Navbar />
      {showNickNameModal ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#111111] rounded-2xl shadow-xl w-[300px] h-[200px] p-6 flex flex-col justify-between">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveNickname(); }} className="flex flex-col h-full justify-between">
              <div>
                <h2 className="text-lg font-semibold text-center mb-2 text-white">Enter Nickname</h2>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Your nickname"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <button type="submit" className="mt-4 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 rounded-lg">
                Save
              </button>
            </form>
          </div>
        </div>
      ) : (

        <div className="flex justify-center mt-10 gap-10 ">
          <RegisterForm/>
          <div className="flex p-4">
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
                        <button onClick={() => setSubmitError(null)} className="text-white/80 hover:text-white">
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
                    className="w-full bg-transparent border border-gray-700 rounded px-3 py-2"
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
                      className="w-full bg-transparent border border-gray-700 rounded px-3 py-2 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full border hover:bg-[#0b0b0b] transition font-medium rounded h-[44px]"
                >
                  {isLoading ? (
                    <Button size="sm" className="text-xs" disabled>
                      <Loader2Icon className="animate-spin" /> Please wait
                    </Button>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div className="flex items-center my-4 text-sm text-gray-500">
                  <div className="flex-grow border-t border-gray-700"></div>
                  <span className="mx-4">or</span>
                  <div className="flex-grow border-t border-gray-700"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded border border-gray-600 hover:bg-gray-800"
                >
                  <FcGoogle /> <span>Sign in with Google</span>
                </button>
              </form>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};
