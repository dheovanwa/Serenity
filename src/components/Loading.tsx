import React from "react";
import logoLight from "../assets/Logo - Light.png";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[999]  bg-black/50 flex items-center justify-center">
      <div className="bg-[#F2EDE2] p-8 rounded-lg flex flex-col items-center gap-4 shadow-xl">
        <img src={logoLight} alt="Logo" className="w-20 h-20 animate-bounce" />
        <p className="text-[#78716C] text-xl">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
