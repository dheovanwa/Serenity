import { ReactNode } from "react";
import cloudImage from "../assets/cloud.png";

interface AuthLayoutProps {
  children: ReactNode;
  variant?: "default" | "solid";
}

const AuthLayout = ({ children, variant = "default" }: AuthLayoutProps) => {
  if (variant === "solid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2EDE2]">
        {children}
        <p className="absolute bottom-2 font-bold w-full text-center text-gray-500 text-sm">
          © 2024 - 2025 Mental Health J&D Sp. so.co
        </p>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-300 to-sky-50">
      {children}
      <div className="absolute bottom-0 left-0 w-full max-h-full">
        <img
          src={cloudImage}
          alt="Cloud Background"
          className="absolute bottom-0 left-0 w-full object-cover z-0"
        />
        <p className="absolute bottom-2 font-bold w-full text-center text-gray-500 text-sm">
          © 2024 - 2025 Mental Health J&D Sp. so.co
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
