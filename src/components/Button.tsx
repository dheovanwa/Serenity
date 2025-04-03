import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button: React.FC<ButtonProps> = ({ className, children, ...props }) => {
  return (
    <button
      {...props}
      className={`w-full bg-white text-[#0283B6] py-3 rounded-md font-bold shadow-md hover:bg-gray-100 transition ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
