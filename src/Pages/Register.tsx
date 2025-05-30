import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterController } from "../controllers/RegisterController";
import {
  InputWithLabel,
  InputWithLabelPassConfirm,
} from "../components/InputWithLabel"; // Asumsi InputWithLabelPassConfirm juga di sini
import { InputWithLabelPass } from "../components/InputWithLabel"; // Ini bisa dihapus jika InputWithLabelPassConfirm adalah varian
import { ButtonOutline } from "../components/ButtonOutline";
import { auth } from "../config/firebase";
import background from "../assets/backgroundSignin.png";
import logoLight from "../assets/Logo - Light.png";
import logoDark from "../assets/Logo - Dark.png"; // Import logo dark
import { Button } from "../components/Button";
import Loading from "../components/Loading";

// Import ikon Sun dan Moon
import Sun from "../assets/Sun.svg"; // Pastikan path ini benar
import Moon from "../assets/Do not Disturb iOS.svg"; // Pastikan path ini benar

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const controller = new RegisterController();
  const [isClicked, setIsClicked] = useState(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
  const [tosError, setTosError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // State baru untuk dark mode (sama seperti Login.tsx)
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

  // Efek untuk mengaplikasikan kelas 'dark' ke elemen html
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Efek untuk mendengarkan perubahan preferensi sistem secara real-time
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
    console.log("Button clicked");
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  const validateForm = () => {
    let isValid = true;

    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTosError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Email harus dalam format example@email.com");
      isValid = false;
    }

    if (password.length < 8) {
      setPasswordError("Kata sandi harus lebih dari 8 karakter");
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(
        "Kata sandi harus sama dengan kata sandi di atas"
      );
      isValid = false;
    }

    if (!acceptTerms) {
      setTosError("Harap setujui syarat dan ketentuan");
      isValid = false;
    }

    return isValid;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsAuthenticating(true);
    setIsLoading(true);

    try {
      const result = await controller.handleRegistration({
        email,
        password,
        firstName: "",
        lastName: "",
        confirmPassword,
        termsAccepted: acceptTerms,
        emailPromo: false,
      });

      if (result.success) {
        localStorage.setItem("documentId", result.docId || "");
        navigate("/complete-register");
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsAuthenticating(false);
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsAuthenticating(true);
    setIsLoading(true);
    try {
      const result = await controller.handleGoogleLogin();
      console.log("Google signup result:", result);
      if (result.success) {
        if (result.isNewUser) {
          localStorage.setItem("documentId", result.docId || "");
          navigate("/complete-register", {
            state: {
              firstName: result.firstName,
              lastName: result.lastName,
            },
          });
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Google signup error:", error);
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col sm:flex-row overflow-hidden">
      {isLoading && <Loading />}
      <div className="absolute top-5 left-4 flex items-center gap-2 z-10">
        <img
          src={isDarkMode ? logoDark : logoLight} // Logo menyesuaikan mode
          alt="Logo"
          className="w-16 h-16"
        />
        <h1 className="text-xl text-[#78716C] dark:text-white">Serenity</h1>{" "}
        {/* Teks logo menyesuaikan mode */}
      </div>

      <div
        className={`${
          isMobile ? "w-full" : "w-1/2"
        } bg-[#F2EDE2] dark:bg-[#161F36] flex justify-center items-center py-6 sm:py-10 flex-grow relative transition-colors duration-300`}
      >
        <div className="w-full max-w-[400px] sm:max-w-[450px] md:max-w-[500px] px-6 sm:px-8 py-10">
          <h2 className="text-3xl sm:text-4xl font-light text-[#161F36] dark:text-white text-left mb-5">
            Mulai Perjalananmu
            <p className="font-semibold mt-2 text-2xl sm:text-4xl dark:text-white">
              Daftar ke Serenity
            </p>
          </h2>
          <form className="space-y-0.5" onSubmit={handleSignUp}>
            <div>
              <InputWithLabel
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                isDarkMode={isDarkMode} // Teruskan prop isDarkMode
              />
            </div>
            <div>
              <InputWithLabelPass
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autocomplete="new-password"
                error={passwordError}
                isDarkMode={isDarkMode} // Teruskan prop isDarkMode
              />
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
            </div>
            <div>
              <InputWithLabelPassConfirm
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autocomplete="new-password"
                error={confirmPasswordError}
                isDarkMode={isDarkMode} // Teruskan prop isDarkMode
              />
            </div>
            {/* Terms of Service checkbox */}
            <div className="flex flex-col gap-1 mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (e.target.checked) setTosError("");
                  }}
                  className="w-4 h-4 text-[#8DAABF] border-gray-300 rounded-lg focus:ring-[#8DAABF]
                             dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-[#8DAABF] dark:focus:ring-[#8DAABF] dark:rounded-lg transition-colors duration-300" // Kelas dark mode untuk checkbox
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-600 dark:text-gray-300"
                >
                  {" "}
                  {/* Teks label menyesuaikan mode */}
                  Saya menyetujui{" "}
                  <a
                    href="/terms"
                    className="text-[#8DAABF] hover:underline dark:text-blue-400"
                  >
                    {" "}
                    {/* Link menyesuaikan mode */}
                    Syarat dan Ketentuan
                  </a>
                </label>
              </div>
              {tosError && <p className="text-red-500 text-sm">{tosError}</p>}
            </div>
            <Button
              variant="outline"
              type="submit"
              className={`w-full h-12 mt-6 max-w-sm rounded-sm bg-[#BACBD8] text-black hover:bg-[#bad2e5]
                          dark:bg-[#BACBD8] dark:text-[#18181B] dark:hover:bg-[#8d9097] ${
                            // Kelas dark mode untuk tombol
                            isClicked ? "bg-white dark:bg-gray-600" : ""
                          } ${
                isAuthenticating ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? "Signing up..." : "Daftar"}
            </Button>
            <div className="w-full max-w-sm flex items-center my-4">
              <hr className="flex-grow border-t border-gray-300 dark:border-[#E6E6E6] opacity-50" />{" "}
              {/* Garis menyesuaikan mode */}
              <span className="px-4 text-sm text-gray-600 dark:text-[#E6E6E6] opacity-50">
                {" "}
                {/* Teks menyesuaikan mode */}
                atau daftar dengan
              </span>
              <hr className="flex-grow border-t border-gray-300 dark:border-[#E6E6E6] opacity-50" />{" "}
              {/* Garis menyesuaikan mode */}
            </div>
          </form>
          <ButtonOutline
            onGoogleClick={handleGoogleSignUp}
            disabled={isAuthenticating}
            className="dark:border-gray-500 dark:text-white dark:hover:bg-gray-700" // Kelas dark mode untuk ButtonOutline
          />
        </div>

        {/* Elemen bottom-left dan bottom-right */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-between px-6 sm:px-8">
          <p className="text-sm text-black dark:text-white">
            {" "}
            {/* Teks menyesuaikan mode */}
            Sudah memiliki akun?{" "}
            <a
              href="/signin"
              className="font-bold text-[#8DAABF] hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer dark:text-[#8DAABF]" // Link menyesuaikan mode
            >
              Masuk
            </a>
          </p>
          {/* Tombol Dark Mode / Light Mode */}
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
