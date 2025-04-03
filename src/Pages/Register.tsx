import { useState } from "react";
import AuthLayout from "../components/BackgroundLayout";
import InputField from "../components/inputField";
import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import showPassIcon from "../assets/showPass.svg";
import hidePassIcon from "../assets/hidePass.svg";
import { useNavigate } from "react-router-dom";
// import { PageHeader } from "../components/PageHeader";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    emailPromo: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const navigate = useNavigate();

  const signIn = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "",
      }));

      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailPromo: formData.emailPromo,
        isUser: true,
        age: 0,
      });
      navigate("/verify-email");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: "This email is already registered",
        }));
      } else {
        console.error(error);
      }
    }
  };
  console.log(auth?.currentUser?.email);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return; // Don't proceed if there are errors

    setIsSubmitting(true); // Disable button
    await signIn(); // Proceed with registration

    setTimeout(() => setIsSubmitting(false), 3000); // Enable button after 3 sec
  };

  return (
    <AuthLayout>
      <div className="absolute top-20">
        <h2 className="text-4xl font-bold top-1.5 text-white mb-5 text-center">
          Welcome to Serenity
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="">
            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="youremail@gmail.com"
            />
            {errors.email && <p className="text-red-500">{errors.email}</p>}
          </div>

          <div className="mt-00 flex gap-4">
            <div className="w-1/2">
              <InputField
                label="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="w-1/2">
              <InputField
                label="Last Name (Optional)"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="relative">
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-10.5"
            >
              <img
                src={showPassword ? hidePassIcon : showPassIcon}
                alt="Toggle Password"
                className="w-5 h-5"
              />
            </button>
          </div>
          {errors.password && <p className="text-red-500">{errors.password}</p>}

          <div className="mb-1 relative">
            <InputField
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-3 top-10.5"
            >
              <img
                src={showConfirmPassword ? hidePassIcon : showPassIcon}
                alt="Toggle Password"
                className="w-5 h-5"
              />
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-white text-sm font-bold">
              I accept{" "}
              <a href="#" className="text-white hover:underline cursor-pointer">
                Terms of Service
              </a>{" "}
              and Privacy Policy
            </label>
          </div>
          {errors.termsAccepted && (
            <p className="text-red-500">{errors.termsAccepted}</p>
          )}

          <div className="mt-2 mb-4 flex items-center">
            <input
              type="checkbox"
              name="emailPromo"
              checked={formData.emailPromo}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-white text-sm font-bold">
              Let Serenity send me an email promotion (Optional)
            </label>
          </div>

          <button
            type="submit"
            className="relative z-10 w-full bg-white text-blue-400 py-3 rounded-lg font-semibold hover:bg-gray-50 transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isSubmitting} // Disable when submitting
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
          <p className="relative z-10 text-white text-center text-lg font-bold mt-4">
            Already have an account?{" "}
            <a href="/signin" className="underline hover:text-gray-200">
              Sign In!
            </a>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Register;
