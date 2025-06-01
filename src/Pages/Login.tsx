import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginController } from "../controllers/LoginController";
import { LoginErrors } from "../models/LoginModel";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  InputWithLabel,
  InputWithLabelPassConfirm,
  InputWithLabelPass,
} from "../components/InputWithLabel";
import { ButtonOutline } from "../components/ButtonOutline";
import background from "../assets/backgroundSignin.png";
import logoLight from "../assets/Logo - Light.png";
import logoDark from "../assets/Logo - Dark.png"; // Asumsi Anda punya logo dark
import { Button } from "../components/Button";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import Loading from "../components/Loading";
import Sun from "../assets/Sun.svg"; // Pastikan path ini benar
import Moon from "../assets/Do not Disturb iOS.svg"; // Pastikan path ini benar

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const controller = new LoginController();
  const [isClicked, setIsClicked] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      return true;
    }
    if (savedTheme === "light") {
      return false;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setIsDarkMode(event.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const navSpecificThemeColors = {
    toggleBg: isDarkMode ? "bg-[#4A4A4A]" : "bg-gray-300",
  };

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User authenticated:", user.uid);
        const userData = await controller.getUserData(user.uid);
        if (userData?.docId) {
          localStorage.setItem("documentId", userData.docId);
          navigate("/home");
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setIsLoading(true);
    setErrors({});

    try {
      const result = await controller.handleLogin({ email, password });

      if (result.success) {
        const userType = localStorage.getItem("userType");
        navigate(userType === "psychiatrist" ? "/dashboard" : "/");
      } else if (result.errors) {
        setErrors(result.errors);
      }
    } catch (error) {
      setErrors({ email: "Email atau Kata Sandi salah" });
    } finally {
      setIsAuthenticating(false);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setIsLoading(true);
    try {
      const result = await controller.handleGoogleLogin();

      if (result.success) {
        const userType = localStorage.getItem("userType");
        if (result.isNewUser || result.needsCompletion) {
          navigate("/complete-register", {
            state: {
              firstName: result.firstName || "",
              lastName: result.lastName || "",
            },
          });
        } else {
          navigate(userType === "psychiatrist" ? "/dashboard" : "/");
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsAuthenticating(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row overflow-hidden">
      {isLoading && <Loading />}
      <div className="absolute top-5 left-4 flex items-center gap-2 z-10">
        <img
          src={isDarkMode ? logoDark : logoLight}
          alt="Logo"
          className="w-16 h-16"
        />
        <h1 className="text-xl text-[#78716C] dark:text-white">Serenity</h1>
      </div>

      <div
        className={`${
          isMobile ? "w-full" : "w-1/2"
        } bg-[#F2EDE2] dark:bg-[#161F36] flex justify-center items-center py-6 sm:py-10 flex-grow relative transition-colors duration-300`}
      >
        <div className="w-full max-w-[400px] sm:max-w-[450px] md:max-w-[500px] px-6 sm:px-8 py-10">
          <h2 className="text-3xl sm:text-4xl font-light text-[#161F36] dark:text-white text-left mb-5">
            Selamat datang kembali!
            <p className="font-semibold mt-2 text-2xl sm:text-4xl dark:text-white">
              Masuk ke Serenity
            </p>
          </h2>
          <form className="space-y-0.5" onSubmit={handleLogin} noValidate>
            <div>
              <InputWithLabel
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isDarkMode={isDarkMode}
                className="dark:bg-gray-700 dark:text-white dark:border-[#E6E6E6]" // Tambahkan kelas dark mode (mungkin perlu disesuaikan di komponen InputWithLabel)
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div>
              <InputWithLabelPass
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autocomplete="current-password"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600" // Tambahkan kelas dark mode (mungkin perlu disesuaikan di komponen InputWithLabelPass)
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>
            <div className="text-right text-sm w-full max-w-sm mt-1.5">
              <a
                href="/forgot-password"
                className="font-semibold text-[#8DAABF] hover:text-blue-700 dark:hover:text-blue-300 dark:text-gray-300"
              >
                Lupa dengan kata sandi?
              </a>
            </div>
            <Button
              variant="outline"
              type="submit"
              className={`w-full h-12 mt-6 max-w-sm rounded-sm bg-[#BACBD8] text-black hover:bg-[#bad2e5] dark:bg-[#BACBD8] dark:text-[#18181B] dark:hover:bg-[#8d9097] ${
                isClicked ? "bg-white dark:bg-gray-600" : ""
              } ${isAuthenticating ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleClick}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? "Signing in..." : "Masuk"}
            </Button>
            <div className="w-full max-w-sm flex items-center my-4">
              <hr className="flex-grow border-t border-gray-300 dark:border-[#E6E6E6] opacity-50" />
              <span className="px-4 text-sm text-gray-600 dark:text-[#E6E6E6 opacity-50]">
                atau masuk dengan
              </span>
              <hr className="flex-grow border-t border-gray-300 dark:border-[#E6E6E6] opacity-50" />
            </div>
          </form>
          <ButtonOutline
            onGoogleClick={handleGoogleLogin}
            disabled={isAuthenticating}
            className="flex items-center justify-center gap-2 dark:border-white dark:text-white"
          />
        </div>

        <div className="absolute bottom-5 left-0 right-0 flex justify-between px-6 sm:px-8">
          <p className="text-sm text-black dark:text-white">
            Belum memiliki akun?{" "}
            <a
              href="/signup"
              className="font-bold text-[#8DAABF] hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer dark:text-[#8DAABF]"
            >
              Daftar
            </a>
          </p>
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none shadow-inner ${navSpecificThemeColors.toggleBg}`}
              aria-label="Toggle theme"
            >
              <span
                className={`absolute top-1/2 -translate-y-1/2 inline-block w-5 h-5 bg-white dark:bg-[#161F36] rounded-full shadow-md transform transition-transform duration-300 ${
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

export default Login;
