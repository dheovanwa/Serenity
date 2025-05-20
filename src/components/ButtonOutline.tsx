import React from "react";
import google from "../assets/google.png";
import facebook from "../assets/facebook.png";
import { Button } from "./Button";

interface ButtonOutlineProps {
  onGoogleClick?: () => void;
  onFacebookClick?: () => void;
  disabled?: boolean;
}

export function ButtonOutline({
  onGoogleClick,
  onFacebookClick,
  disabled,
}: ButtonOutlineProps) {
  return (
    <div className="flex w-full max-w-sm justify-center gap-8 text-black">
      <Button
        variant="outline"
        className="w-25% bg-transparent border-black py-4 px-5 sm:py-6 sm:px-8 flex justify-center"
        onClick={onGoogleClick}
        disabled={disabled}
      >
        <img src={google} alt="Google" className="w-6 h-6" />
      </Button>
      <Button
        variant="outline"
        className="w-25% bg-transparent border-black py-4 px-6 sm:py-6 sm:px-8 flex justify-center"
        onClick={onFacebookClick}
        disabled={disabled}
      >
        <img src={facebook} alt="Facebook" className="w-6 h-6" />
      </Button>
    </div>
  );
}
