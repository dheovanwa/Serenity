import React from "react";
import google from "../assets/google.png";
import { Button } from "./Button";

interface ButtonOutlineProps {
  onGoogleClick?: () => void;
  disabled?: boolean;
}

export function ButtonOutline({ onGoogleClick, disabled }: ButtonOutlineProps) {
  return (
    <div className="flex w-full max-w-sm justify-center text-black">
      <Button
        variant="outline"
        className="w-full bg-transparent border-black py-4 px-5 sm:py-6 sm:px-8 flex justify-center items-center h-12"
        onClick={onGoogleClick}
        disabled={disabled}
      >
        <img src={google} alt="Google" className="w-6 h-6" />
      </Button>
    </div>
  );
}
