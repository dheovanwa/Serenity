import React, { useState } from "react";
import InputField from "../components/Login/InputField";
import Button from "../components/Login/Button";
import AuthLayout from "../components/BackgroundLayout";
import { useNavigate } from "react-router-dom";
import { LoginController } from "../controllers/LoginController";
import { LoginErrors } from "../models/LoginModel";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const navigate = useNavigate();
  const controller = new LoginController();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await controller.handleLogin({ email, password });

    if (result.success && result.redirectTo) {
      navigate(result.redirectTo);
    } else if (result.errors) {
      setErrors(result.errors);
    }
  };

  return (
    <AuthLayout>
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-[400px] sm:max-w-[450px] md:max-w-[500px] px-6 sm:px-8">
        <h2 className="text-4xl font-bold text-white mb-5 text-center">
          Welcome to Serenity
        </h2>
        <form className="space-y-4 w-full" onSubmit={handleLogin}>
          <div>
            <label className="block font-bold text-white text-[20px] mb-1 text-left">
              Email
            </label>
            <InputField
              type="email"
              placeholder="examplemail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {}
          <div className="mt-0">
            <label className="block font-bold text-white text-[20px] mb-1 text-left">
              Password
            </label>
            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          <div className="text-right text-sm">
            <a
              href="/forgot-password"
              className="font-bold underline text-white"
            >
              Forgot Password?
            </a>
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <p className="mt-4 font-bold text-white text-[20px] text-center">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="underline font-bold cursor-pointer hover:underline"
          >
            Sign Up!
          </a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
