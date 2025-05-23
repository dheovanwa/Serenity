import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterController } from "../controllers/RegisterController";
import {
  InputWithLabel,
  InputWithLabelPassConfirm,
} from "../components/InputWithLabel";
import { InputWithLabelPass } from "../components/InputWithLabel";
import { ButtonOutline } from "../components/ButtonOutline";
import { auth } from "../config/firebase";
import background from "../assets/backgroundSignin.png";
import logoLight from "../assets/Logo - Light.png";
import { Button } from "../components/Button";
import Loading from "../components/Loading";

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

  const handleClick = () => {
    console.log("Button clicked");
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  const validateForm = () => {
    let isValid = true;

    // Reset all errors
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTosError("");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Email harus dalam format example@email.com");
      isValid = false;
    }

    // Password validation
    if (password.length < 8) {
      setPasswordError("Kata sandi harus lebih dari 8 karakter");
      isValid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setConfirmPasswordError(
        "Kata sandi harus sama dengan kata sandi di atas"
      );
      isValid = false;
    }

    // Terms of service validation
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
    // Check if there's any auth state to handle
    const unsubscribe = auth.onAuthStateChanged(() => {
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // if (isLoading) {
  //   return <Loading />;
  // }

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
            Mulai Perjalananmu
            <p className="font-semibold mt-2 text-2xl sm:text-4xl">
              Daftar ke Serenity
            </p>
          </h2>
          <form className="space-y-0.5" onSubmit={handleSignUp}>
            <div>
              <InputWithLabel
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
              />
            </div>
            <div>
              <InputWithLabelPass
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autocomplete="new-password"
                error={passwordError}
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
                  className="w-4 h-4 text-[#8DAABF] border-gray-300 rounded focus:ring-[#8DAABF]"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I accept the{" "}
                  <a href="/terms" className="text-[#8DAABF] hover:underline">
                    Terms of Service
                  </a>
                </label>
              </div>
              {tosError && <p className="text-red-500 text-sm">{tosError}</p>}
            </div>
            <Button
              variant="outline"
              type="submit"
              className={`w-full h-12 mt-6 max-w-sm rounded-sm bg-[#BACBD8] text-black hover:bg-[#bad2e5] ${
                isClicked ? "bg-white" : ""
              } ${isAuthenticating ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? "Signing up..." : "Daftar"}
            </Button>
            <div className="w-full max-w-sm flex items-center my-4">
              <hr className="flex-grow border-t border-gray-300" />
              <span className="px-4 text-sm text-gray-600">
                atau daftar dengan
              </span>
              <hr className="flex-grow border-t border-gray-300" />
            </div>
          </form>
          <ButtonOutline
            onGoogleClick={handleGoogleSignUp}
            disabled={isAuthenticating}
          />
          <p
            className={`${
              isMobile
                ? "text-center static mx-auto mt-4"
                : "absolute bottom-5 left-6"
            } text-sm text-black`}
          >
            Sudah memiliki akun?{" "}
            <a
              href="/signin"
              className="font-bold text-[#8DAABF] hover:text-white cursor-pointer"
            >
              Masuk
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
