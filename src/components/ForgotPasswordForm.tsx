import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ForgotPasswordController } from "../controllers/ForgotPasswordController";
import type { ResetPasswordErrors } from "../models/ForgotPasswordModel";
import background from "../assets/backgroundSignin.png";
import logoLight from "../assets/Logo - Light.png";
import logoDark from "../assets/Logo - Dark.png"; // Import logo dark
import Loading from "../components/Loading"; // Import Loading component
import { InputWithLabel } from "./InputWithLabel"; // Import InputWithLabel

// Import ikon Sun dan Moon
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
  const [isLoading, setIsLoading] = useState(false); // Pastikan ini diinisialisasi
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
    <div className="min-h-screen flex flex-col sm:flex-row overflow-hidden relative">
      {/* Loading overlay, jika isLoading true */}
      {isLoading && <Loading isDarkMode={isDarkMode} />}{" "}
      {/* Teruskan isDarkMode ke Loading */}
      {/* Logo di pojok kiri atas */}
      <div className="absolute top-5 left-4 flex items-center gap-2 z-10">
        <img
          src={isDarkMode ? logoDark : logoLight} // Logo menyesuaikan mode
          alt="logo"
          className="w-16 h-16"
        />
        <h1 className="text-xl text-[#78716C] dark:text-gray-300">Serenity</h1>{" "}
        {/* Teks logo */}
      </div>
      {/* Form Section (sisi kiri) */}
      <div className="w-full sm:w-1/2 bg-[#F2EDE2] flex justify-center items-center py-6 sm:py-10 flex-grow relative dark:bg-[#1A2947] transition-colors duration-300">
        {" "}
        {/* Background dan transisi */}
        <div className="w-full max-w-[500px] sm:max-w-[450px] md:max-w-[500px] px-6 sm:px-8 py-10 mb-12">
          <div className="flex flex-col text-center sm:text-left items-center sm:items-start">
            <h2 className="text-3xl sm:text-4xl font-light text-[#161F36] dark:text-white">
              {" "}
              {/* Judul */}
              Lupa Kata Sandi?
            </h2>
            <p className="font-semibold mt-2 text-2xl sm:text-4xl text-[#161F36] dark:text-white">
              {" "}
              {/* Sub-judul */}
              Reset Password Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 mt-6">
            <InputWithLabel
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              isDarkMode={isDarkMode} // Teruskan isDarkMode ke InputWithLabel
            />
            {errors.email && (
              <p className="text-red-500 text-sm dark:text-red-400">
                {errors.email}
              </p>
            )}

            <button
              type="submit"
              className="w-full max-w-[385px] py-3 rounded-md font-semibold hover:bg-[#bad2e5] transition disabled:opacity-50 disabled:cursor-not-allowed
                         bg-[#BACBD8] text-black dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800" // Tombol kirim
              disabled={isSubmitting}
            >
              {isSubmitting ? "Mengirim..." : "Kirim Email Reset"}
            </button>
          </form>
        </div>
        <div className="absolute bottom-6 left-0 right-0 px-6 sm:px-8 flex justify-between items-center z-10">
          <p className="text-sm text-black dark:text-gray-300">
            Sudah ingat password Anda?{" "}
            <a
              href="/login"
              className="font-bold text-[#8DAABF] hover:text-white cursor-pointer dark:text-blue-400 dark:hover:text-blue-300" // Link Login
            >
              Masuk
            </a>
          </p>

          {/* Tombol Ganti Warna */}
          <button
            onClick={toggleTheme}
            className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none shadow-inner ${navSpecificThemeColors.toggleBg}`}
            aria-label="Toggle theme"
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                isDarkMode
                  ? "translate-x-6 left-0.5 dark:bg-gray-700" // Pastikan warna bola toggle di dark mode
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
      {/* Right side with background image */}
      <div
        className="hidden sm:block w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url(${background})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          minHeight: "100vh",
        }}
      />
    </div>
  );
};

export default ForgotPasswordForm;
