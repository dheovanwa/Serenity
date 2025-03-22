import { useState } from "react";

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Dropdown Button */}
      <button
        onClick={toggleDropdown}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
      >
        Select Option ⌄
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-2 w-48 bg-white border rounded-lg shadow-lg">
          <ul className="py-2 text-gray-700">
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              Option 1
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              Option 2
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              Option 3
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
