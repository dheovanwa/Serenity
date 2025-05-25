import React, { useEffect } from "react";
import { Home, Calendar, MessageSquare, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoLight from "../assets/Logo - Light.png";
import LogoDark from "../assets/Logo - Dark.png";
import Moon from "../assets/Do not Disturb iOS.svg";
import Sun from "../assets/Sun.svg";

// Props that NavBarPsy expects from its parent (ChatPage)
interface NavBarPsyProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const NavBarPsy: React.FC<NavBarPsyProps> = ({ isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // NavBarPsy's own theme colors, driven by the isDarkMode prop from ChatPage
  const navSpecificThemeColors = {
    bgNav: isDarkMode ? "bg-[#161F36]" : "bg-[#BACBD8]", // Navbar background itself
    textNav: isDarkMode ? "text-[#E6E6E6]" : "text-gray-700", // Nav items text
    textNavActive: isDarkMode ? "text-[#161F36]" : "text-[#E6E6E6]", // Active nav item text
    bgNavButtonActive: isDarkMode ? "bg-[#BACBD8]" : "bg-[#161F36]", // Active nav item background
    logoColor: isDarkMode ? LogoDark : LogoLight,
    toggleBg: isDarkMode ? "bg-[#4A4A4A]" : "bg-[#E6E6E6]",
  };

  const NavItem: React.FC<{
    label: string;
    path: string;
    icon?: React.ElementType;
  }> = ({ label, path, icon: Icon }) => {
    const isActive = location.pathname === path;

    return (
      <button
        onClick={() => navigate(path)}
        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${
            isActive
              ? `${navSpecificThemeColors.bgNavButtonActive} ${navSpecificThemeColors.textNavActive}`
              : `${navSpecificThemeColors.textNav} hover:${navSpecificThemeColors.bgNavButtonActive}`
          }`}
      >
        {Icon && <Icon size={18} className="mr-2" />}
        {label}
      </button>
    );
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <header
      className={`${navSpecificThemeColors.bgNav} py-2 px-6 mt-6 mx-2 sm:mx-8 rounded-lg shadow-md transition-colors duration-300 mb-5`}
    >
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center">
          <img
            src={navSpecificThemeColors.logoColor}
            alt="Logo"
            className="h-8 sm:h-10"
          />
        </div>

        <nav className="hidden md:flex space-x-4 lg:space-x-6">
          <NavItem label="Halaman Utama" path="/dashboard" icon={Home} />
          <NavItem
            label="Janji Temu"
            path="/psy-manage-appointment"
            icon={Calendar}
          />
          <NavItem label="Chat" path="/chat" icon={MessageSquare} />
          <NavItem label="Profil" path="/psychiatrist-profile" icon={User} />
        </nav>

        <div className="flex items-center">
          <button
            onClick={toggleTheme}
            className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors focus:outline-none shadow-inner ${navSpecificThemeColors.toggleBg}`}
          >
            <span
              className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-700 rounded-full shadow-md transform transition-transform duration-300 ${
                isDarkMode ? "translate-x-6" : "translate-x-1"
              }`}
            >
              <img
                src={isDarkMode ? Moon : Sun}
                alt={isDarkMode ? "Moon" : "Sun"}
                className="w-4 h-4 m-auto absolute inset-0"
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBarPsy;
