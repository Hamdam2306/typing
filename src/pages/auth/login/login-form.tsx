import { useState, useRef } from "react";
import { loginUser } from "./login";
import { signInWithGoogle } from "./sign-with-google";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "../register/register-form";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { FcGoogle } from "react-icons/fc";


export const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
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
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      setSubmitError("Please fill in all required fields correctly.");
      return;
    }

    setIsLoading(true);

    try {
      const user = await loginUser(formData);
      console.log("Logged in:", user);
      
      // Show success animation
      if (formRef.current) {
        formRef.current.classList.add("success");
        setTimeout(() => {
          if (formRef.current) formRef.current.classList.remove("success");
        }, 2000);
      }
      

      // Simulate redirect after successful login
      setTimeout(() => {
        setIsLoading(false);
        navigate('/')
      }, 1500);
    }  catch (error: any) {
      console.error("Login error:", error);
 
      if (error.code === "auth/user-not-found" || 
          error.code === "auth/wrong-password" || 
          error.code === "auth/invalid-credential") {
        setSubmitError("Email yoki parol noto'g'ri. Iltimos, tekshirib qayta urinib ko'ring.");
      } else if (error.code === "auth/too-many-requests") {
        setSubmitError("Juda ko'p urinish qilindi. Iltimos, biroz kutib, keyinroq qayta urinib ko'ring.");
      } else if (error.code === "auth/invalid-email") {
        setSubmitError("Email formati noto'g'ri.");
      } else {
        setSubmitError("Kirishda xatolik yuz berdi. Keyinroq qayta urinib ko'ring.");
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
      
      // Show success animation
      if (formRef.current) {
        formRef.current.classList.add("success");
        setTimeout(() => {
          if (formRef.current) formRef.current.classList.remove("success");
        }, 2000);
      }
    
    
      setTimeout(() => {
        setIsLoading(false);
       navigate('/')
      }, 1500);
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      // Handle Google sign-in errors
      if (error.code === "auth/popup-closed-by-user") {
        setSubmitError("Google oynasi foydalanuvchi tomonidan yopildi. Iltimos, qayta urinib ko'ring.");
      } else {
        setSubmitError("Google hisobi bilan kirishda xatolik yuz berdi. Keyinroq qayta urinib ko'ring.");
      }
      
      setIsLoading(false);
    }
  };

  

  return (
    <div className="flex justify-center gap-20">
    <RegisterForm />

    <div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    <div className="bg-[#1f1f1f] text-white rounded-xl shadow-md p-6">
      <form onSubmit={handleLogin} className="space-y-6">
        
        {/* Email */}
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

        {/* Password */}
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

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="accent-blue-600"
            />
            Remember me
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-600 hover:bg-blue-700 transition text-white font-medium rounded px-4 py-2 ${isLoading && 'opacity-75 cursor-not-allowed'}`}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Divider */}
        <div className="flex items-center my-4 text-sm text-gray-500">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="mx-4">or</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        {/* Google Sign-in */}
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

    </div>
  );
};