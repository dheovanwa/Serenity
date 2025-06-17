import React from "react";
import google from "../assets/google.png";
import { Button } from "./Button";

interface ButtonOutlineProps {
  onGoogleClick?: () => void;
  disabled?: boolean;
  // Anda bisa menambahkan prop `className` jika ingin ButtonOutline menerima kelas tambahan dari parent
  className?: string;
}

export function ButtonOutline({
  onGoogleClick,
  disabled,
  className,
}: ButtonOutlineProps) {
  return (
    <div className={`flex w-full max-w-sm justify-center ${className || ""}`}>
      {" "}
      {/* Gabungkan className yang diterima */}
      <Button
        variant="outline"
        className="w-full bg-transparent border-black py-4 px-5 sm:py-6 sm:px-8 flex justify-center items-center h-12
                   dark:border-gray-500 dark:text-white dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:shadow-sm" // Kelas Tailwind untuk dark mode
        onClick={onGoogleClick}
        disabled={disabled}
      >
        <img
          src={google}
          alt="Google"
          className="w-6 h-6 dark:filter dark:invert" // Menambahkan filter invert untuk ikon di dark mode
        />
      </Button>
    </div>
  );
}
