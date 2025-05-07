import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/LogoIconWhite.png";
import searchLogo from "../assets/MagnifyingGlass.png";

interface TopBarProps {
  userName: string;
  onLogout: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ userName, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-black/20 flex items-center justify-between px-4 py-2 shadow-md relative">
      {/* Logo */}
      <div className="flex items-center">
        <img src={logo} alt="Logo" className="h-8 w-8" />
      </div>

      {/* Search Bar */}
      <div className="flex flex-1 justify-center items-center px-4">
        <div className="flex items-center bg-white rounded-md px-4 py-2 shadow-lg w-full max-w-xl">
          <input
            type="text"
            placeholder="Search Psychiatrists here..."
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
          />
          <button
            aria-label="Search"
            className="hover:opacity-75 transition cursor-pointer"
          >
            <img src={searchLogo} alt="Search" className="h-7 w-7" />
          </button>
        </div>
      </div>

      {/* Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 font-semibold text-xl text-white"
        >
          {userName}
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-10">
            <ul>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md">
                <Link to="/profile">Profile</Link>
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md"
                onClick={onLogout}
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
