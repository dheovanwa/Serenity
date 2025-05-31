import React, { useEffect, useState, useRef } from "react";
import {
  Home,
  MessageSquare,
  User,
  Calendar,
  Menu,
  X,
  MessagesSquare,
  Bell,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoLight from "../assets/Logo - Light.png";
import LogoDark from "../assets/Logo - Dark.png";
import Moon from "../assets/Do not Disturb iOS.svg";
import Sun from "../assets/Sun.svg";
import { useNotifications } from "../hooks/useNotifications";

interface NavBarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Use the same notification hook as user navbar
  const { unreadCount, recentMessages, notificationPermission } =
    useNotifications();

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

  // Close notification popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatNotificationTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Baru saja";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}j`;
    return `${Math.floor(diffInMinutes / 1440)}h`;
  };

  const handleNotificationClick = (appointmentId: string) => {
    setShowNotifications(false);
    navigate(`/chat?appointmentId=${appointmentId}`);
  };

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

        <nav className="hidden md:flex flex-grow justify-center gap-5">
          <NavItem label="Halaman Utama" path="/" icon={Home} />
          <NavItem
            label="Janji Temu"
            path="/manage-appointment"
            icon={Calendar}
          />
          <NavItem label="Chat" path="/chat" icon={MessageSquare} />
          <NavItem label="Forum" path="/forum" icon={MessagesSquare} />
          <NavItem label="Profil" path="/profile" icon={User} />
        </nav>

        <div className="flex items-center gap-x-3 sm:gap-x-4 flex-shrink-0">
          {/* Notification Icon */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-lg transition-colors ${navSpecificThemeColors.textNav} hover:bg-gray-200 dark:hover:bg-gray-700`}
              aria-label="Notifications"
              title={
                notificationPermission === "granted"
                  ? "Notifikasi aktif"
                  : notificationPermission === "denied"
                  ? "Notifikasi diblokir"
                  : "Klik untuk mengaktifkan notifikasi"
              }
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popup */}
            {showNotifications && (
              <div
                className={`absolute top-full right-0 mt-2 w-80 max-w-[90vw] ${navSpecificThemeColors.bgNav} border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden`}
              >
                <div className="p-3 border-b border-gray-300 dark:border-gray-600">
                  <h3
                    className={`font-semibold ${navSpecificThemeColors.textNav}`}
                  >
                    Notifikasi
                  </h3>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {recentMessages.length > 0 ? (
                    recentMessages.map((message, index) => (
                      <div
                        key={`${message.appointmentId}-${message.id}-${index}`}
                        onClick={() =>
                          handleNotificationClick(message.appointmentId)
                        }
                        className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium text-sm ${navSpecificThemeColors.textNav}`}
                            >
                              {message.senderName}
                            </p>
                            <p
                              className={`text-sm text-gray-600 dark:text-gray-400 truncate`}
                            >
                              {message.text.length > 50
                                ? `${message.text.substring(0, 50)}...`
                                : message.text}
                            </p>
                          </div>
                          <span
                            className={`text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0`}
                          >
                            {formatNotificationTime(message.timeCreated)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className={`text-sm text-gray-500 dark:text-gray-400`}>
                        Tidak ada notifikasi baru
                      </p>
                    </div>
                  )}
                </div>

                {recentMessages.length > 0 && (
                  <div className="p-3 border-t border-gray-300 dark:border-gray-600">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/chat");
                      }}
                      className={`w-full text-center text-sm ${navSpecificThemeColors.textNav} hover:underline`}
                    >
                      Lihat semua chat
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

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

      {isMobileMenuOpen && (
        <div
          className={`md:hidden absolute top-full left-0 w-full ${navSpecificThemeColors.bgNav} border-t border-gray-600 shadow-lg py-4 px-4 z-50 rounded-b-lg`}
        >
          <nav className="flex flex-col space-y-2 items-center">
            <NavItem
              label="Halaman Utama"
              path="/dashboard"
              icon={Home}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <NavItem
              label="Janji Temu"
              path="/psy-manage-appointment"
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
              path="/doctor-profile"
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
