import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ForgotPasswordController } from "../controllers/ForgotPasswordController";
import type { ResetPasswordErrors } from "../models/ForgotPasswordModel";
import logoLight from "../assets/Logo - Light.png";
import logoDark from "../assets/Logo - Dark.png";
import mountainImage from "../assets/backgroundSignin.png";

import Sun from "../assets/Sun.svg";
import Moon from "../assets/Do not Disturb iOS.svg";

interface ForgotPasswordFormProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  isDarkMode,
  toggleTheme,
}) => {
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

  const navSpecificThemeColors = {
    toggleBg: isDarkMode ? "bg-gray-700" : "bg-gray-300",
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Form Section */}
      <div
        className="flex flex-col justify-center md:w-1/2 w-full px-8 md:px-24 py-12 min-h-screen relative
                      bg-[#F6F2E7] dark:bg-[#1A2947]"
      >
        <div className="mb-10 flex items-center gap-3">
          <img
            src={isDarkMode ? logoDark : logoLight}
            alt="Serenity Logo"
            className="w-12 h-12"
          />
          <span className="text-2xl font-bold text-[#161F36] dark:text-white">
            Serenity
          </span>
        </div>
        <h2 className="text-3xl font-bold text-[#161F36] mb-2 dark:text-white">
          Lupa Password
        </h2>
        <p className="text-md text-gray-600 mb-6 dark:text-gray-300">
          Masukkan email yang terdaftar untuk mengatur ulang password Anda.
        </p>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <label className="block text-lg mb-2 font-semibold text-[#161F36] dark:text-white">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="youremail@gmail.com"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BACBD8] mb-2
                       bg-[#F2EDE2] text-[#161F36] dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-700"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mb-2 dark:text-red-400">
              {errors.email}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold transition shadow disabled:opacity-50 disabled:cursor-not-allowed mt-2
                       bg-[#BACBD8] text-[#161F36] hover:bg-[#9FB6C6] dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>

        {/* PERUBAHAN UTAMA DI SINI: Kontainer untuk Teks dan Tombol Toggle */}
        <div className="mt-6 flex justify-between items-center w-full">
          {" "}
          {/* Gunakan flex untuk meratakan secara horizontal */}
          <span className="text-gray-500 text-sm dark:text-gray-400">
            Sudah ingat password?{" "}
            <Link
              to="/signin"
              className="font-semibold hover:underline text-[#161F36] dark:text-blue-400"
            >
              Login
            </Link>
          </span>
          {/* Tombol Ganti Warna */}
          <button
            onClick={toggleTheme}
            className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none shadow-inner ${navSpecificThemeColors.toggleBg}`}
            aria-label="Toggle theme"
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 inline-block w-5 h-5 bg-white dark:bg-gray-700 rounded-full shadow-md transform transition-transform duration-300 ${
                isDarkMode
                  ? "translate-x-6 left-0.5"
                  : "translate-x-0.5 left-0.5"
              }`}
            >
              {isDarkMode ? (
                <img
                  src={Moon}
                  alt="Moon Icon"
                  className="w-4 h-4 m-auto absolute inset-0"
                />
              ) : (
                <img
                  src={Sun}
                  alt="Sun Icon"
                  className="w-4 h-4 m-auto absolute inset-0"
                />
              )}
            </span>
          </button>
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
