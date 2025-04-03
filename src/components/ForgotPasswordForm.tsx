import { useState } from "react";
import AuthLayout from "./BackgroundLayout";
import { auth } from "../config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!/@\w+\.\w+/.test(email)) {
      setEmailError("Email must be in the correct format");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      navigate("/forgot-password/email-sent");
    } catch (error) {
      setEmailError("Email not found. Please sign up.");
    }
    setIsSubmitting(false);
  };

  return (
    <AuthLayout>
      <div className="absolute top-20">
        <h2 className="text-4xl font-bold text-white mb-5 text-center">
          Reset Your Password
        </h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-white text-lg mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="youremail@gmail.com"
            className="w-full p-2 rounded-md bg-white text-gray-900"
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}

          <button
            type="submit"
            className="w-full bg-white text-blue-400 py-3 rounded-lg font-semibold hover:bg-gray-50 transition shadow disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Email"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordForm;
