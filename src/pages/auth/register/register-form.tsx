import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { auth, db } from "../login/firebase"; // db - Firestore instance
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2Icon, X } from "lucide-react";
import {motion, AnimatePresence } from "framer-motion";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nickname: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "user",
  });

  // We no longer need 'errors' state for inline messages
  // const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (formData.password.length >= 8) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/[0-9]/.test(formData.password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;

    setPasswordStrength(strength);
  }, [formData.password]);

  const validateForm = () => {
    const errors: string[] = [];
  
    if (!formData.nickname.trim() || formData.nickname.trim().length < 2) {
      errors.push("Nickname must be at least 2 characters.");
    }
  
    if (!formData.firstname.trim() || formData.firstname.trim().length < 2) {
      errors.push("First name must be at least 2 characters.");
    }
  
    if (!formData.lastname.trim() || formData.lastname.trim().length < 2) {
      errors.push("Last name must be at least 2 characters.");
    }
  
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push("Valid email is required.");
    }
  
    if (!formData.password.trim() || formData.password.length < 8) {
      errors.push("Password must be at least 8 characters.");
    }
  
    if (errors.length > 0) {
      setSubmitError(errors[0]); // faqat birinchi xatoni ko‘rsatamiz
      return false;
    }
  
    setSubmitError(null);
    return true;
  };
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // No need to clear individual errors here as they are no longer displayed inline
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-yellow-500";
    if (passwordStrength <= 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null); // Clear previous submission errors before new attempt

    if (!validateForm()) {
     console.log("validetion failed")
      setIsSubmitting(false);
      return;
    }

    const isNicknameTaken = async (nickname: string): Promise<boolean> => {
        try {
          const q = query(
            collection(db, "users"),
            where("nickname", "==", nickname.trim())
          );
      
          const querySnapshot = await getDocs(q);
          console.log("Nickname query result:", querySnapshot.docs.length);
          return !querySnapshot.empty;
        } catch (error) {
          console.error("Error checking nickname:", error);
          throw new Error("nickname-check-failed");
        }
      };
      
      

    try {
        const exists = await isNicknameTaken(formData.nickname);
        if (exists) {
          setSubmitError("This nickname is already taken.");
          setIsSubmitting(false);
          return;
        }
      
      } catch (err) {
        console.error("Nickname tekshirishda xato:", err);
        setSubmitError("An error occurred while checking nickname.");
        setIsSubmitting(false);
      }
      

    try {
      // 1. Firebase Auth orqali foydalanuvchini yaratish
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // 2. Firestore-ga user haqida ma'lumot saqlash
      await setDoc(doc(db, "users", user.uid), {
        nickname: formData.nickname,
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        role: formData.role,
        uid: user.uid,
        createdAt: new Date(),
        score: 0, 
        percentage: 0 
      });

      // 3. Firebase profildagi `displayName`ni nickname qilib qo'yish
      await updateProfile(user, { displayName: formData.nickname });

      // 4. Tozalash va navigate qilish
      setFormData({
        nickname: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        role: "user",
      });
      // setErrors({}); // No longer needed
      setIsSubmitting(false);
      navigate('/profile');

    } catch (err: any) {
      console.error("Registration Error:", err);
      let errorMessage = "An error occurred during registration.";

      // Firebase error codes ni user-friendly qilib ko'rsatish
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email address.";
          break;
        default:
          errorMessage = err.message || errorMessage;
      }

      setSubmitError(errorMessage);
      setIsSubmitting(false);
    }
  };
 
//   const handleNicknameBlur = async () => {
//     if (!formData.nickname.trim()) return;
  
//     const exists = await isNicknameTaken(formData.nickname);
//     if (exists) {
//       setSubmitError("This nickname is already taken.");
//     } else if (submitError === "This nickname is already taken.") {
//       setSubmitError(null); // foydalanuvchi o‘zgartirganda tozalanadi
//     }
//   };
  
 
  return (
    <div className="flex p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1f1f1f] rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-white">

            {/* Submit Error (Top-level notification) */}
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
            {/* Nickname */}
            <div>
              <label className="text-sm mb-1 block">Nickname</label>
              <input
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                // onBlur={handleNicknameBlur}
                // Removed conditional border styling
                className={`w-full bg-transparent border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700`}
              />
              {/* Removed error text */}
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm mb-1 block">First Name</label>
                <input
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  // Removed conditional border styling
                  className={`w-full bg-transparent border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700`}
                />
                {/* Removed error text */}
              </div>
              <div>
                <label className="text-sm mb-1 block">Last Name</label>
                <input
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  // Removed conditional border styling
                  className={`w-full bg-transparent border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700`}
                />
                {/* Removed error text */}
              </div>
            </div>

            <div>
              <label className="text-sm mb-1 block">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-transparent border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700`}
              />
            </div>

            <div>
              <label className="text-sm mb-1 block">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                // Removed conditional border styling
                className={`w-full bg-transparent border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-700`}
              />
              {/* Removed error text */}

              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400">{getPasswordStrengthText()}</span>
                  </div>
                </div>
              )}
            </div>

            <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full border hover:bg-[#0b0b0b] transition font-medium rounded px-4 py-2"
                >
                  {isSubmitting ? (
                    <Button size="sm" className="text-xs" disabled>
                      <Loader2Icon className="animate-spin" /> Please wait
                    </Button>
                  ) : (
                    "Sign In"
                  )}
                </button>
          </form>
        </div>
      </div>
    </div>
  );
};