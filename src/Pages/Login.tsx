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
import { Button } from "../components/Button";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import Loading from "../components/Loading";

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

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User authenticated:", user.uid);
        // Get user document ID
        const userData = await controller.getUserData(user.uid);
        if (userData?.docId) {
          localStorage.setItem("documentId", userData.docId);
          navigate("/");
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setIsLoading(true);
    setErrors({});

    try {
      const result = await controller.handleLogin({ email, password });

      if (result.success && result.redirectTo) {
        navigate("/");
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
      console.log("Google login result:", result);

      if (result.success) {
        localStorage.setItem("documentId", result.docId);

        if (result.isNewUser || result.needsCompletion) {
          navigate("/complete-register", {
            state: {
              firstName: result.firstName || "",
              lastName: result.lastName || "",
            },
          });
        } else {
          navigate("/");
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
    // Clear errors when user types
    setErrors({});
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
          <h2 className="text-3xl sm:text-4xl font-light text-[#161F36] text-left mb-5">
            Selamat datang kembali!
            <p className="font-semibold mt-2 text-2xl sm:text-4xl">
              Masuk ke Serenity
            </p>
          </h2>
          <form className="space-y-0.5" onSubmit={handleLogin} noValidate>
            <div>
              <InputWithLabel
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div>
              <InputWithLabelPass
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autocomplete="current-password" // Add this prop
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>
            <div className="text-right text-sm w-full max-w-sm ">
              <a
                href="/forgot-password"
                className="font-semibold  text-[#8DAABF]"
              >
                Lupa dengan kata sandi?
              </a>
            </div>
            <Button
              variant="outline"
              type="submit"
              className={`w-full h-12 mt-6 max-w-sm rounded-sm bg-[#BACBD8] text-black hover:bg-[#bad2e5] ${
                isClicked ? "bg-white" : ""
              } ${isAuthenticating ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handleClick}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? "Signing in..." : "Masuk"}
            </Button>
            <div className="w-full max-w-sm flex items-center my-4">
              <hr className="flex-grow border-t border-gray-300" />
              <span className="px-4 text-sm text-gray-600">
                atau masuk dengan
              </span>
              <hr className="flex-grow border-t border-gray-300" />
            </div>
          </form>
          <ButtonOutline
            onGoogleClick={handleGoogleLogin}
            disabled={isAuthenticating}
            className="flex items-center justify-center gap-2"
          />
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

export default Login;
