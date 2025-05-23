import React from "react";
import logoLight from "../assets/Logo - Light.png";

const NavBar: React.FC = () => {
  return (
    <header className="bg-[#BACBD8] p-4 mt-6 mx-8 rounded-lg">
      <div className="flex justify-between items-center">
        {/* Logo or Brand Icon */}
        <div className="flex items-center" style={ logoLight: `url(${logoLight})` }></div>

        {/* Navigation Links */}
        <nav className="flex space-x-6 text-[#161F36] gap-20">
          <a href="/" className="font-medium">
            Beranda
          </a>
          <a href="/Search-psi" className="font-medium">
            Cari
          </a>
          <a href="#" className="font-medium">
            Janji Temu
          </a>
          <a href="#" className="font-medium relative">
            Chat
            <span className="absolute top-0 left-10 bg-red-500 text-white text-xs rounded-full w-2 h-2 flex items-center justify-center"></span>
          </a>
          <a href="/profile" className="font-medium">
            Profil
          </a>
        </nav>

        {/* Profile and Notifications */}
        <div className="flex items-center space-x-4">
          {/* Notifications Icon */}
          <div className="relative">
            <span className="absolute top-0 right-0 bg-yellow-400 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
              !
            </span>
          </div>

          {/* Toggle */}
          <div className="flex items-center">
            <input type="checkbox" className="toggle toggle-primary" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
