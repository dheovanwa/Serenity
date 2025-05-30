import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import background from "../assets/backgroundSignin.png";
import logoLight from "../assets/Logo - Light.png";
import Loading from "../components/Loading";

const EmailSent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
          <h2 className="text-4xl font-bold mb-5">Check Your Email!</h2>
          <p className="text-lg">A password reset link has been sent.</p>
          <button
            onClick={() => navigate("/forgot-password/reset-password")}
            className="w-full max-w-[310px] mt-5 bg-[#BACBD8] text-black py-2 px-6 rounded-lg font-semibold hover:bg-[#bad2e5] transition shadow"
          >
            Continue
          </button>

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

export default EmailSent;
