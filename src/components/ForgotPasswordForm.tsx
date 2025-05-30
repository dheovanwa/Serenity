import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./BackgroundLayout";
import { ForgotPasswordController } from "../controllers/ForgotPasswordController";
import type { ResetPasswordErrors } from "../models/ForgotPasswordModel";
import logo from "../assets/Logo - Light.png";
import mountainImage from "../assets/backgroundSignin.png"; // Change path/filename as needed

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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Form Section */}
      <div className="flex flex-col justify-center md:w-1/2 w-full px-8 md:px-24 py-12 bg-[#F6F2E7] min-h-screen">
        <div className="mb-10 flex items-center gap-3">
          <img src={logo} alt="Serenity Logo" className="w-12 h-12" />
          <span className="text-2xl font-bold text-[#161F36]">Serenity</span>
        </div>
        <h2 className="text-3xl font-bold text-[#161F36] mb-2">
          Lupa Password
        </h2>
        <p className="text-md text-gray-600 mb-6">
          Masukkan email yang terdaftar untuk mengatur ulang password Anda.
        </p>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <label className="block text-[#161F36] text-lg mb-2 font-semibold">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="youremail@gmail.com"
            className="w-full p-3 rounded-lg border border-gray-300 bg-[#F2EDE2] text-[#161F36] focus:outline-none focus:ring-2 focus:ring-[#BACBD8] mb-2"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mb-2">{errors.email}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#BACBD8] text-[#161F36] py-3 rounded-lg font-semibold hover:bg-[#9FB6C6] transition shadow disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>
        <div className="mt-6 text-left">
          <span className="text-gray-500 text-sm">
            Sudah ingat password?{" "}
            <Link
              to="/signin"
              className="text-[#161F36] font-semibold hover:underline"
            >
              Login
            </Link>
          </span>
        </div>
      </div>
      {/* Right: Mountain Image */}
      <div className="hidden md:block md:w-1/2 h-screen">
        <img
          src={mountainImage}
          alt="Mountain"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
