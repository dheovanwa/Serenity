import React, { useState, useEffect } from "react";
import sunIcon from "../assets/Sun.svg";
import moonIcon from "../assets/Do not Disturb iOS.svg";
import LogoLight from "../assets/Logo - Light.png";

const NavBarPsy: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const logoLight = LogoLight;

  return (
    <header className="bg-[#BACBD8] dark:bg-[#161F36] py-4 px-6 mt-6 mx-2 sm:mx-8 rounded-lg shadow-md transition-colors duration-300">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center">
          <img src={logoLight} alt="Logo" className="h-8 sm:h-10" />{" "}
        </div>
        <nav className="hidden md:flex space-x-4 lg:space-x-6 text-[#161F36] dark:text-gray-200 gap-15">
          <a
            href="/"
            className="font-medium hover:text-opacity-80 dark:hover:text-opacity-88"
          >
            Halaman Utama
          </a>
          <a
            href="#"
            className="font-medium hover:text-opacity-80 dark:hover:text-opacity-80"
          >
            Janji Temu
          </a>
          <a
            href="#"
            className="font-medium relative hover:text-opacity-80 dark:hover:text-opacity-80"
          >
            Chat
            <span className="absolute -top-0.5 -right-2.5 bg-red-500 text-white text-xs rounded-full w-2 h-2 flex items-center justify-center p-1"></span>
          </a>
          <a
            href="/profile"
            className="font-medium hover:text-opacity-80 dark:hover:text-opacity-80"
          >
            Profil
          </a>
        </nav>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="relative hidden sm:block"> </div>

          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none shadow-inner ${
                isDarkMode ? "bg-[#4A4A4A]" : "bg-[#E6E6E6]"
              }`}
              aria-label="Toggle theme"
            >
              <span
                className={`absolute left-1 top-1/2 -translate-y-1/2 inline-block w-5 h-5 bg-white dark:bg-[#161F36] rounded-full shadow-md transform transition-transform duration-300 ${
                  isDarkMode ? "translate-x-5" : "translate-x-0"
                }`}
              >
                {isDarkMode ? (
                  <img
                    src={moonIcon}
                    alt="Moon Icon"
                    className="w-4 h-4 m-auto absolute inset-0"
                  />
                ) : (
                  <img
                    src={sunIcon}
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

export default NavBarPsy;
