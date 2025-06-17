import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import NavBarPsy from "./NavBarPsy";
import AppointmentStatusUpdater from "./AppointmentStatusUpdater";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });
  const [userType, setUserType] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setUserType(localStorage.getItem("userType"));
  }, [location.pathname]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-[#161F36]" : "bg-[#F2EDE2]"}`}
    >
      <AppointmentStatusUpdater />
      {userType === "psychiatrist" ? (
        <NavBarPsy isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      ) : (
        <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      )}
      <main>{children}</main>
    </div>
  );
};

export default Layout;
