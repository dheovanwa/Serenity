import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordController } from "../controllers/ForgotPasswordController";
import type { ResetPasswordErrors } from "../models/ForgotPasswordModel";
import background from "../assets/backgroundSignin.png";
import logoLight from "../assets/Logo - Light.png";
import Loading from "../components/Loading";
import { InputWithLabel } from "./InputWithLabel";

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  isDarkMode,
  toggleTheme,
}) => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      {isLoading && <Loading />}

      {/* Logo */}
      <div className="absolute top-5 left-4 flex items-center gap-2 z-10">
        <img src={logoLight} alt="logoLight" className="w-16 h-16" />
        <h1 className="text-xl text-[#78716C]">Serenity</h1>
      </div>

      {/* Form Section */}
      <div className="w-full sm:w-1/2 bg-[#F2EDE2] flex justify-center items-center py-6 sm:py-10 flex-grow relative">
        <div className="w-full max-w-[500px] sm:max-w-[450px] md:max-w-[500px] px-6 sm:px-8 py-10 mb-12">
          <div className="flex flex-col text-center sm:text-left items-center sm:items-start">
            <h2 className="text-3xl sm:text-4xl font-light text-[#161F36]">
              Lupa Kata Sandi?
            </h2>
            <p className="font-semibold mt-2 text-2xl sm:text-4xl text-[#161F36]">
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
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}

            <button
              type="submit"
              className="w-full max-w-[385px] bg-[#BACBD8] text-black py-3 rounded-md font-semibold hover:bg-[#bad2e5] transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Email"}
            </button>
          </form>

          <p className="text-sm text-black text-center sm:text-left mt-6 sm:absolute sm:bottom-5 sm:left-6">
            Sudah ingat password Anda?{" "}
            <a
              href="/login"
              className="font-bold text-[#8DAABF] hover:text-white cursor-pointer"
            >
              Masuk
            </a>
          </p>
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
