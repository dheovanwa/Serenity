import React, { useEffect } from "react";
import { Home, Search, MessageSquare, User, Calendar } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoLight from "../assets/Logo - Light.png";
import LogoDark from "../assets/Logo - Dark.png";
import Moon from "../assets/Do not Disturb iOS.svg";
import Sun from "../assets/Sun.svg";

// Props that NavBar expects from its parent (ChatPage)
interface NavBarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  // themeColors: any; // From ChatPage, if NavBar needs ChatPage's specific theme color strings.
  // However, NavBar defines its own themeColors based on the isDarkMode prop.
}

const NavBar: React.FC<NavBarProps> = ({ isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // NavBar's own theme colors, driven by the isDarkMode prop from ChatPage
  const navSpecificThemeColors = {
    bgNav: isDarkMode ? "bg-[#161F36]" : "bg-[#BACBD8]", // Navbar background itself
    textNav: isDarkMode ? "text-[#E6E6E6]" : "text-gray-700", // Nav items text
    textNavActive: isDarkMode ? "text-[#161F36]" : "text-[#E6E6E6]", // Active nav item text
    bgNavButtonActive: isDarkMode ? "bg-[#BACBD8]" : "bg-[#161F36]", // Active nav item background
    logoPlaceholderColor: isDarkMode ? "text-black" : "text-black",
    toggleBg: isDarkMode ? "bg-[#4A4A4A]" : "bg-[#E6E6E6]",
    toggleIconColor: isDarkMode ? Moon : Sun,
    logoColor: isDarkMode ? LogoDark : LogoLight,
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
              : `${navSpecificThemeColors.textNav} hover:${navSpecificThemeColors.bgNavButtonActive} hover:${navSpecificThemeColors.textNavActive}`
          }
        `}
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
          <div className="flex items-center">
            <img
              src={navSpecificThemeColors.logoColor}
              alt="Logo"
              className="h-8 sm:h-10"
            />{" "}
          </div>
        </div>
        <nav className="hidden md:flex space-x-4 lg:space-x-6 gap-15">
          <NavItem label="Halaman Utama" path="/" icon={Home} />
          <NavItem label="Cari" path="/Search-psi" icon={Search} />
          <NavItem
            label="Janji Temu"
            path="/manage-appointment"
            icon={Calendar}
          />
          <NavItem label="Chat" path="/chat" icon={MessageSquare} />
          <NavItem label="Profil" path="/profile" icon={User} />
        </nav>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center">
            <button
              onClick={toggleTheme} // Uses toggleTheme from ChatPage props
              className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none shadow-inner ${navSpecificThemeColors.toggleBg}`}
              aria-label="Toggle theme"
            >
              <span
                className={`absolute top-1/2 -translate-y-1/2 inline-block w-5 h-5 bg-white dark:bg-gray-700 rounded-full shadow-md transform transition-transform duration-300 ${
                  isDarkMode
                    ? "translate-x-6 left-0.5"
                    : "translate-x-0.5 left-0.5" // Adjusted translate for better positioning
                }`}
              >
                {isDarkMode ? (
                  <img
                    src={Moon}
                    alt="Moon Icon"
                    className="w-4 h-4 m-auto absolute inset-0"
                  />
                ) : (
                  <img
                    src={Sun}
                    alt="Sun Icon"
                    className="w-4 h-4 m-auto absolute inset-0"
                  />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
