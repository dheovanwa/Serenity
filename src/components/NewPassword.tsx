import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordController } from "../controllers/ForgotPasswordController";
import type { ResetPasswordErrors } from "../models/ForgotPasswordModel";
import background from "../assets/backgroundSignin.png";
import logoLight from "../assets/Logo - Light.png";
import logoDark from "../assets/Logo - Dark.png";
import Loading from "../components/Loading";
import ResetPasswordFields from "../components/ResetPass";

import Sun from "../assets/Sun.svg";
import Moon from "../assets/Do not Disturb iOS.svg";

interface ResetPasswordProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({
  isDarkMode,
  toggleTheme,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const controller = new ForgotPasswordController();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleResetPassword = async () => {
    setIsLoading(true);
    const oobCode = new URLSearchParams(window.location.search).get("oobCode");
    const result = await controller.handleResetPassword({
      password,
      confirmPassword,
      oobCode: oobCode || "",
    });

    if (result.success) {
      navigate("/signin");
    } else if (result.errors) {
      setErrors(result.errors);
    }
    setIsLoading(false);
  };

  const navSpecificThemeColors = {
    toggleBg: isDarkMode ? "bg-gray-700" : "bg-gray-300",
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row overflow-hidden relative">
      {isLoading && <Loading isDarkMode={isDarkMode} />}

      {/* Logo di pojok kiri atas */}
      <div className="absolute top-5 left-4 flex items-center gap-2 z-10">
        <img
          src={isDarkMode ? logoDark : logoLight}
          alt="logo"
          className="w-16 h-16"
        />
        <h1 className="text-xl text-[#78716C] dark:text-gray-300">Serenity</h1>
      </div>

      {/* Form Section (sisi kiri) - Ini adalah flex container vertikal utama */}
      <div className="w-full sm:w-1/2 bg-[#F2EDE2] flex flex-col justify-between py-6 sm:py-10 flex-grow relative dark:bg-[#1A2947] transition-colors duration-300">
        {/* Content Area - Ini akan mengisi ruang yang tersisa di atas footer */}
        <div className="flex-grow flex flex-col justify-center items-center px-6 sm:px-8">
          {" "}
          {/* flex-grow untuk mendorong footer ke bawah */}
          <div className="w-full max-w-[400px] sm:max-w-[450px] md:max-w-[500px] py-10">
            <h2 className="text-4xl font-bold mb-5 text-left text-[#161F36] dark:text-white">
              Reset Password
            </h2>

            <ResetPasswordFields
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              errors={errors}
              isDarkMode={isDarkMode}
            />

            <button
              onClick={handleResetPassword}
              className="w-full max-w-[385px] py-3 rounded-md font-semibold hover:bg-[#bad2e5] transition shadow mt-6
                         bg-[#BACBD8] text-black dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Reset Password"}
            </button>
          </div>
        </div>

        {/* Footer Section (teks "Belum memiliki akun?" & tombol toggle) - Posisi absolut di bagian bawah */}
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 flex justify-between items-center z-10 pb-6 pt-4">
          {" "}
          {/* Tambahkan pt-4 untuk padding atas */}
          <p className="text-sm text-black dark:text-gray-300">
            Belum memiliki akun?{" "}
            <a
              href="/signup"
              className="font-bold text-[#8DAABF] hover:text-white cursor-pointer dark:text-blue-400 dark:hover:text-blue-300"
            >
              Daftar
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
                  ? "translate-x-6 left-0.5 dark:bg-gray-700"
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
      {!isMobile && (
        <div
          className="hidden sm:block w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: `url(${background})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            minHeight: "100vh",
          }}
        />
      )}
    </div>
  );
};

export default ResetPassword;
