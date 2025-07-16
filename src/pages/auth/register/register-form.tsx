import { useState, useEffect, useRef } from "react";
import { RegisterUser } from "./register";
import { useNavigate } from "react-router-dom";


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


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    <div className="bg-[#1f1f1f] rounded-xl shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-5 text-white">

        {/* Firstname + Lastname */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm mb-1 block">First Name</label>
            <input
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm mb-1 block">Last Name</label>
            <input
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm mb-1 block">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-transparent border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm mb-1 block">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-transparent border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone + Age */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm mb-1 block">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm mb-1 block">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

     

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold rounded px-4 py-2"
        >
          Create Account
        </button>
      </form>
    </div>
  </div>
</div>

  );
};