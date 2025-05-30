import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordController } from "../controllers/ForgotPasswordController";
import type { ResetPasswordErrors } from "../models/ForgotPasswordModel";
import background from "../assets/backgroundSignin.png";
import logoLight from "../assets/Logo - Light.png";
import Loading from "../components/Loading";
import ResetPasswordFields from "../components/ResetPass";

const ResetPassword = () => {
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

  return (
    <div className="min-h-screen flex flex-col sm:flex-row overflow-hidden">
      {isLoading && <Loading />}

      <div className="absolute top-5 left-4 flex items-center gap-2 z-10">
        <img src={logoLight} alt="logoLight" className="w-16 h-16" />
        <h1 className="text-xl text-[#78716C]">Serenity</h1>
      </div>

      <div
        className={`${
          isMobile ? "w-full" : "w-1/2"
        } bg-[#F2EDE2] flex justify-center items-center py-6 sm:py-10 flex-grow`}
      >
        <div className="w-full max-w-[400px] sm:max-w-[450px] md:max-w-[500px] px-6 sm:px-8 py-10">
          <h2 className="text-4xl font-bold text-[#161F36] mb-5 text-left">
            Reset Password
          </h2>

          
            <ResetPasswordFields />
          

          <button
            onClick={handleResetPassword}
            className="w-full max-w-[385px] bg-[#BACBD8] text-black py-3 rounded-md font-semibold hover:bg-[#bad2e5] transition shadow mt-6"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Reset Password"}
          </button>

          <p
            className={`${
              isMobile
                ? "text-center static mx-auto mt-4"
                : "absolute bottom-5 left-6"
            } text-sm text-black`}
          >
            Belum memiliki akun?{" "}
            <a
              href="/signup"
              className="font-bold text-[#8DAABF] hover:text-white cursor-pointer"
            >
              Daftar
            </a>
          </p>
        </div>
      </div>

      {!isMobile && (
        <div
          className="w-1/2 bg-cover bg-center"
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
