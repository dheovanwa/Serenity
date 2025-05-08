import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./BackgroundLayout";
import { ForgotPasswordController } from "../controllers/ForgotPasswordController";
import type { ResetPasswordErrors } from "../models/ForgotPasswordModel";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const controller = new ForgotPasswordController();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await controller.handleSendResetEmail(email);

    if (result.success) {
      navigate("/forgot-password/email-sent");
    } else if (result.errors) {
      setErrors(result.errors);
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
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
