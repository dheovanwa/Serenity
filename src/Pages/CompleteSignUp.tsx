import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginController } from "../controllers/LoginController";
import { LoginErrors } from "../models/LoginModel";
import { InputWithLabel, InputWithLabelPassConfirm } from "../components/InputWithLabel";
import { InputWithLabelPass } from "../components/InputWithLabel";
import { InputWithLabelName } from "../components/InputWithLabel";
import { ButtonOutline } from "../components/ButtonOutline";
import logoLight from "../assets/Logo - Light.png";
import { Button } from "../components/Button";

const CompleteSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const controller = new LoginController();
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300); 
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await controller.handleLogin({ email, password });

    if (result.success && result.redirectTo) {
      navigate(result.redirectTo);
    } else if (result.errors) {
      setErrors(result.errors);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
     <div className="relative w-full min-h-screen bg-[#F2EDE2] overflow-hidden">
      <div className="absolute top-5 left-4 flex items-center gap-2 z-10">
        <img src={logoLight} alt="logoLight" className="w-12 h-12" />
        <h1 className="text-xl text-[#78716C]">Serenity</h1>
      </div>



  <div className={`${isMobile ? "w-full" : "w-1/2"}  justify-center items-center py-6 sm:py-10`}>
    <div className="absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 w-full px-6 sm:px-8 max-w-[500px]">
       <h2 className="text-3xl sm:text-4xl font-light text-[#161F36] text-left mb-5">
        Mari Lengkapi Data Dirimu
        <p className="font-semibold mt-2 text-2xl sm:text-4xl">Sebelum Masuk ke Serenity</p>
      </h2>
      <form className="space-y-0.5" onSubmit={handleLogin}>
        <div>
          <InputWithLabelName>
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
          </InputWithLabelName>
        </div>
        <div>
          <InputWithLabel />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div>
          <InputWithLabelPass />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <div>
            <InputWithLabelPassConfirm />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>
        <div>
            <InputWithLabelPassConfirm />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        <Button variant="outline" type="submit" className={`w-full h-12 mt-6 max-w-sm rounded-sm bg-[#BACBD8] text-black hover:bg-[#bad2e5] ${isClicked ? 'bg-white' : ''}`} // Menambahkan kelas bg-white saat diklik
      onClick={handleClick}>
          Masuk
        </Button>
      </form> 
    </div>
  </div>

  {/* Right side (background image) */}
  {!isMobile && (
    <div
      className="w-1/2 bg-cover bg-center"
      style={{
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover", 
        minHeight: "100vh",
      }}
    />
  )}
</div>

  );
};

export default CompleteSignUp;

