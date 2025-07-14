import { useState, useEffect, useRef } from "react";
import { RegisterUser } from "./register";
import { Link, useNavigate } from "react-router-dom";


export const RegisterForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    age: '',
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = "First name is required.";
    } else if (formData.firstname.trim().length < 2) {
      newErrors.firstname = "First name must be at least 2 characters.";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "Last name is required.";
    } else if (formData.lastname.trim().length < 2) {
      newErrors.lastname = "Last name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\+?\d{9,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format.";
    }

    const ageNumber = parseInt(formData.age);
    if (isNaN(ageNumber)) {
      newErrors.age = "Age is required.";
    } else if (ageNumber < 18) {
      newErrors.age = "You must be at least 18 years old.";
    } else if (ageNumber > 120) {
      newErrors.age = "Invalid age value.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "age") {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        if (numValue < 0) return;
        if (numValue > 120) return;
      }
    }
    
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    if (!validateForm()) {
      setIsSubmitting(false);
      setSubmitError("Please correct the errors in the form.");
      return;
    }

    try {
      await RegisterUser({
        ...formData,
        age: parseInt(formData.age),
      });
      
      if (formRef.current) {
        formRef.current.classList.add("success");
        setTimeout(() => {
          if (formRef.current) formRef.current.classList.remove("success");
        }, 2000);
      }
      
      setTimeout(() => {
        setFormData({
          firstname: "",
          lastname: "",
          email: "",
          password: "",
          phone: "",
          role: "user",
          age: '',
        });
        setErrors({});
        setIsSubmitting(false);
        
        navigate('/')
      }, 1500);
      
    } catch (err: any) {
      console.error("Registration Error:", err);
      setSubmitError(err.message || "An error occurred during registration. Please try again.");
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "bg-red-500";
    if (passwordStrength < 50) return "bg-orange-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
            Create Your Account
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Join our community and unlock exclusive features and benefits
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
           
            
            <div className="p-6">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <input
                        id="firstname"
                        name="firstname"
                  
                        value={formData.firstname}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.firstname ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition duration-200`}
                      />
                      {formData.firstname && !errors.firstname && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.firstname && <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <input
                        id="lastname"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.lastname ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition duration-200`}
                      />
                      {formData.lastname && !errors.lastname && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.lastname && <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>}
                  </div>
                </div>
                
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
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition duration-200`}
                    />
                   
                  </div>
                  
                  {formData.password && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`} 
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Weak</span>
                        <span>Strong</span>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition duration-200`}
                      />
                    
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <div className="relative">
                      <input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        min="18"
                        max="120"
                        className={`w-full px-4 py-3 rounded-lg border ${errors.age ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition duration-200`}
                      />
                      
                    </div>
                    {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>
                
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {submitError}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Create Account
                    </>
                  )}
                </button>
                
                <div className="text-center text-sm text-gray-600 mt-4">
                  Already have an account? <Link to={'/login'} className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};