import React from "react";
import { FaBell, FaSearch, FaUser } from "react-icons/fa"; // Optional: If you want to use icons for notifications and user profile

const navBar: React.FC = () => {
  return (
    <header className="bg-blue-200 p-4">
      <div className="flex justify-between items-center">
        {/* Logo or Brand Icon */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-white">S</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex space-x-6 text-gray-700">
          <a href="#" className="font-medium">
            Home
          </a>
          <a href="#" className="font-medium">
            Search
          </a>
          <a href="#" className="font-medium">
            Appointment
          </a>
          <a href="#" className="font-medium relative">
            Chat
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              1
            </span>
          </a>
          <a href="#" className="font-medium">
            Profile
          </a>
        </nav>

        {/* Profile and Notifications */}
        <div className="flex items-center space-x-4">
          {/* Notifications Icon */}
          <div className="relative">
            <FaBell className="text-gray-700" size={24} />
            <span className="absolute top-0 right-0 bg-yellow-400 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
              !
            </span>
          </div>

          {/* Profile Icon */}
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <FaUser className="text-gray-700" size={20} />
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

export default navBar;
