import { useState, useRef } from "react";
import { loginUser } from "./login";
import { signInWithGoogle } from "./sign-with-google";
import { Link, useNavigate } from "react-router-dom";


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
      
      // Handle specific Firebase errors in Uzbek
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Sign in to access your account and continue your journey
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="">
            
            <div className="p-6">
              <form ref={formRef} onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition duration-200`}
                    />
                   
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition duration-200 pr-10`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-indigo-600"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  
                  <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
                
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {submitError}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                    </>
                  )}
                </button>
                
                <div className="flex items-center my-5">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-500 text-sm">OR CONTINUE WITH</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
                
                <div className="text-center text-sm text-gray-600 mt-6">
                  Don't have an account? <Link to={'/register'} className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
    
    </div>
  );
};