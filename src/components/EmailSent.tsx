import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import background from "../assets/backgroundSignin.png";
import logoLight from "../assets/Logo - Light.png";
import Loading from "../components/Loading";

const EmailSent = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col sm:flex-row overflow-hidden relative">
      {isLoading && <Loading />}

      {/* Logo */}
      <div className="absolute top-5 left-4 flex items-center gap-2 z-10">
        <img src={logoLight} alt="logoLight" className="w-16 h-16" />
        <h1 className="text-xl text-[#78716C]">Serenity</h1>
      </div>

      <div
        className={`${
          isMobile ? "w-full" : "w-1/2"
        } bg-[#F2EDE2] relative flex flex-col px-6 sm:px-8`}
        style={{ minHeight: "100vh" }}
      >
        {/* Spacer to avoid overlapping logo */}
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Check Your Email!</h2>
            <p className="text-base sm:text-lg">
              A password reset link has been sent.
            </p>
            <button
              onClick={() => navigate("/forgot-password/reset-password")}
              className="w-full max-w-[310px] bg-[#BACBD8] text-black py-2 px-6 rounded-lg font-semibold hover:bg-[#bad2e5] transition shadow"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Right background for desktop */}
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

export default EmailSent;
