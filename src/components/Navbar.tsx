import { useState } from "react";
import { ChevronDown } from "lucide-react";

const Navbar = ({ userFullName }: { userFullName: string }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-[#2a3d23] text-white px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2 text-xl font-bold">
        <span className="text-2xl">Logo</span>
      </div>

      <div className="flex-grow bg-amber-50 mx-4 max-w-xl">
        <input
          type="text"
          placeholder="Search Psychiatrists here..."
          className="w-full px-4 py-2 rounded-md text-black"
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 font-medium"
        >
          {userFullName}
          <ChevronDown className="w-4 h-4" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-10">
            <ul>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                Profile
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
