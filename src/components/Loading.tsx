import React from "react";
import logoLight from "../assets/Logo - Light.png";
import logoDark from "../assets/Logo - Dark.png";

interface LoadingProps {
  isDarkMode: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isDarkMode }) => {
  return (
    <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center">
      <div
        className="p-8 rounded-lg flex flex-col items-center gap-4 shadow-xl
                      bg-[#F2EDE2] dark:bg-gray-800"
      >
        {" "}
        <img
          src={isDarkMode ? logoLight : logoDark}
          alt="Logo"
          className="w-20 h-20 animate-bounce"
        />
        <p className="text-xl text-[#78716C] dark:text-gray-300">Loading...</p>{" "}
      </div>
    </div>
  );
};

export default Loading;
