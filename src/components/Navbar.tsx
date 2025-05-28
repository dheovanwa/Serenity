import React, { useEffect, useState } from "react";
import {
  Home,
  Search,
  MessageSquare,
  User,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoLight from "../assets/Logo - Light.png";
import LogoDark from "../assets/Logo - Dark.png";
import Moon from "../assets/Do not Disturb iOS.svg";
import Sun from "../assets/Sun.svg";

interface NavBarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navSpecificThemeColors = {
    bgNav: isDarkMode ? "bg-[#161F36]" : "bg-[#BACBD8]",
    textNav: isDarkMode ? "text-[#E6E6E6]" : "text-gray-700",
    textNavActive: isDarkMode ? "text-[#161F36]" : "text-[#E6E6E6]",
    bgNavButtonActive: isDarkMode ? "bg-[#BACBD8]" : "bg-[#161F36]",
    logoPlaceholderColor: isDarkMode ? "text-black" : "text-black",
    toggleBg: isDarkMode ? "bg-[#4A4A4A]" : "bg-[#E6E6E6]",
    toggleIconColor: isDarkMode ? Moon : Sun,
    logoColor: isDarkMode ? LogoDark : LogoLight,
  };

  const NavItem: React.FC<{
    label: string;
    path: string;
    icon?: React.ElementType;
    onClick?: () => void;
  }> = ({ label, path, icon: Icon, onClick }) => {
    const isActive = location.pathname === path;

    const handleClick = () => {
      navigate(path);
      if (onClick) {
        onClick();
      }
    };

    return (
      <button
        onClick={handleClick}
        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${
            isActive
              ? `${navSpecificThemeColors.bgNavButtonActive} ${navSpecificThemeColors.textNavActive}`
              : `${navSpecificThemeColors.textNav} `
          }
          whitespace-nowrap w-full md:w-auto
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

  const headerRoundedClasses = `
    rounded-lg
    md:rounded-lg
    ${isMobileMenuOpen ? "rounded-b-none" : "rounded-b-lg"}
    md:rounded-b-lg
  `;

  return (
    <header
      className={`${navSpecificThemeColors.bgNav} py-2 px-2 sm:px-4 mt-6 mx-2 sm:mx-8 shadow-md transition-colors duration-300 mb-5 relative
        ${headerRoundedClasses}
      `}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex-shrink-0">
          <img
            src={navSpecificThemeColors.logoColor}
            alt="Logo"
            className="h-8 sm:h-10"
          />
        </div>

        {/* Main Navigation (Desktop Only) - Tombol tetap di tengah */}
        {/* Mengurangi gap secara default, dan menambah gap di breakpoint lg */}
        <nav className="hidden md:flex flex-grow justify-center gap-5">
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

        {/* Container for Theme Toggle and Hamburger */}
        <div className="flex items-center gap-x-3 sm:gap-x-4 flex-shrink-0">
          {/* Tombol Toggle Tema */}
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none shadow-inner ${navSpecificThemeColors.toggleBg}`}
              aria-label="Toggle theme"
            >
              <span
                className={`absolute top-1/2 -translate-y-1/2 inline-block w-5 h-5 bg-white dark:bg-gray-700 rounded-full shadow-md transform transition-transform duration-300 ${
                  isDarkMode
                    ? "translate-x-6 left-0.5"
                    : "translate-x-0.5 left-0.5"
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

          {/* Hamburger Button (Mobile Only) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${navSpecificThemeColors.textNav} focus:outline-none h-7 w-7 flex items-center justify-center`}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Hidden/Shown) */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden absolute top-full left-0 w-full ${navSpecificThemeColors.bgNav} border-t border-gray-600 shadow-lg py-4 px-4 z-50 rounded-b-lg`}
        >
          <nav className="flex flex-col space-y-2 items-center">
            <NavItem
              label="Halaman Utama"
              path="/"
              icon={Home}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <NavItem
              label="Cari"
              path="/Search-psi"
              icon={Search}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <NavItem
              label="Janji Temu"
              path="/manage-appointment"
              icon={Calendar}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <NavItem
              label="Chat"
              path="/chat"
              icon={MessageSquare}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <NavItem
              label="Profil"
              path="/profile"
              icon={User}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavBar;
