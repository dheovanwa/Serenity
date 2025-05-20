import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginController } from "../controllers/LoginController";
import { LoginErrors } from "../models/LoginModel";
import { InputWithLabel, InputWithLabelPassConfirm } from "../components/InputWithLabel";
import { InputWithLabelPass } from "../components/InputWithLabel";
import { ButtonOutline } from "../components/ButtonOutline";
import background from "../assets/backgroundSignin.png";
import logoLight from "../assets/Logo - Light.png";
import { Button } from "../components/Button";

const SignUp = () => {
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
    <div className="min-h-screen flex flex-col sm:flex-row overflow-hidden">
  <div className="absolute top-5 left-4 flex items-center gap-2 z-10">
    <img src={logoLight} alt="logoLight" className="w-16 h-16" />
    <h1 className="text-xl text-[#78716C]">Serenity</h1>
  </div>
  
  <div className={`${isMobile ? "w-full" : "w-1/2"} bg-[#F2EDE2] flex justify-center items-center py-6 sm:py-10 flex-grow`}>
    <div className="w-full max-w-[400px] sm:max-w-[450px] md:max-w-[500px] px-6 sm:px-8 py-10">
      <h2 className="text-3xl sm:text-4xl font-light text-[#161F36] text-left mb-5">
        Mulai Perjalananmu
        <p className="font-semibold mt-2 text-2xl sm:text-4xl">Daftar ke Serenity</p>
      </h2>
      <form className="space-y-0.5" onSubmit={handleLogin}>
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
        <Button variant="outline" type="submit" className={`w-full h-12 mt-6 max-w-sm rounded-sm bg-[#BACBD8] text-black hover:bg-[#bad2e5] ${isClicked ? 'bg-white' : ''}`} // Menambahkan kelas bg-white saat diklik
      onClick={handleClick}>
          Masuk
        </Button>
        <div className="w-full max-w-sm flex items-center my-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="px-4 text-sm text-gray-600">atau masuk dengan</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>
      </form>
      <ButtonOutline />
      <p className={`${isMobile ? "text-center static mx-auto mt-4" : "absolute bottom-5 left-6"} text-sm text-black`}>
        Belum memiliki akun?{" "}
        <a href="/signup" className="font-bold text-[#8DAABF] hover:text-white cursor-pointer">
          Daftar
        </a>
      </p>
    </div>
  </div>

  {/* Right side (background image) */}
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

export default SignUp;

