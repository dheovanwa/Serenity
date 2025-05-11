import React, { useState, useRef, useEffect } from "react";
import backgroundImage from "../assets/Searchpsi.png";
import searchIcon from "../assets/search1.png";
import chevronDownIcon from "../assets/con1.png";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import PsychiatristSearchProfile from "../components/PsychiatristSearchProfile";
import awan1 from "../assets/awan1.png";
import awan2 from "../assets/awan2.png";
import gunung from "../assets/gunung.png";

interface Psychiatrist {
  name: string;
  specialty: string;
  price: string;
  rating: number;
  sessions: number;
  image: string;
}

const SearchPskiater: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("ascending");
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [psychiatrists, setPsychiatrists] = useState<Psychiatrist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const orderDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPsychiatrists = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "psychiatrists"));
        const psychiatristsData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Psychiatrist[];
        setPsychiatrists(psychiatristsData);
      } catch (error) {
        console.error("Error fetching psychiatrists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPsychiatrists();
  }, []);

  const handleClear = () => {
    setSearchText("");
    setSelectedSort("");
    setSortOrder("ascending");
  };

  const toggleSortDropdown = () => {
    setIsOrderOpen(false);
    setIsSortOpen(!isSortOpen);
  };

  const toggleOrderDropdown = () => {
    setIsSortOpen(false);
    setIsOrderOpen(!isOrderOpen);
  };

  const handleSelectSort = (sortOption: string) => {
    setSelectedSort(sortOption);
    setIsSortOpen(false);
  };

  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
    setIsOrderOpen(false);
  };

  const filteredPsychiatrists = searchText
    ? psychiatrists.filter((psychiatrist) =>
        psychiatrist.name.toLowerCase().startsWith(searchText.toLowerCase())
      )
    : psychiatrists;

  const sortPsychiatrists = (list: any[], option: string, order: string) => {
    const sortedList = [...list];
    switch (option) {
      case "Rating":
        return sortedList.sort((a, b) =>
          order === "ascending" ? a.rating - b.rating : b.rating - a.rating
        );
      case "Fee":
        return sortedList.sort((a, b) => {
          const priceA = parseFloat(a.price.slice(1));
          const priceB = parseFloat(b.price.slice(1));
          return order === "ascending" ? priceA - priceB : priceB - priceA;
        });
      default:
        return sortedList;
    }
  };

  const sortedPsychiatrists = sortPsychiatrists(
    filteredPsychiatrists,
    selectedSort,
    sortOrder
  );

  return (
    <div
      className="min-h-screen w-full bg-cover flex flex-col overflow-x-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        height: "100vh",
        zIndex: "0",
      }}
    >
      {/* Cloud Images */}
      <div
        className="absolute top-0 left-0 w-full flex justify-between items-center"
        style={{ zIndex: -1 }}
      >
        <img
          src={awan1}
          alt="awan1"
          className="absolute top-[-45px] left-[-60px]"
        />
        <img
          src={awan2}
          alt="awan2"
          className="absolute top-[-8px] right-[-120px]"
        />
      </div>

      <div className="pt-6 px-2 sm:px-4 md:px-6 lg:px-8 ">
        <h1 className="text-[#0a5372] font-semibold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-center mb-8 sm:mb-12 md:mb-16 leading-tight ">
          Your mind deserves care,
          <br />
          let us help you find the right psychiatrist
        </h1>

        {/* Search & Controls Section */}
        <div className="w-full sm:w-[90%] lg:w-[80%] mx-auto flex flex-col gap-3 sm:flex-row sm:justify-between">
          {/* First row: search bar and clear button */}
          <div className="flex flex-wrap items-center gap-3 sm:w-[60%] lg:w-[100%]">
            <div className="relative flex-grow  ">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search for a Psychiatrist..."
                className="bg-white text-[#187DA8] p-2 rounded-md w-full sm:w-[60%] lg:w-[100%] h-[45px] pl-10 sm:pl-12 md:pl-14 text-sm sm:text-base"
              />
              <img
                src={searchIcon}
                alt="Search Icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6"
              />
            </div>

            <button
              onClick={handleClear}
              className="bg-white text-[#187DA8] font-semibold rounded-md h-[45px] px-5 min-w-[80px]"
            >
              Clear
            </button>
          </div>

          {/* Second row: Sort By and Sorting Order dropdowns */}
          <div className="flex gap-3 w-full sm:w-auto">
            <div
              className="relative sm:w-[180px] w-full"
              ref={sortDropdownRef}
            >
              <button
                onClick={toggleSortDropdown}
                className="p-2 rounded-md bg-white text-[#187DA8] font-bold text-sm sm:text-base md:text-lg w-full h-[45px] flex justify-between items-center hover:bg-blue-200 transition-all duration-300"
              >
                <span className="truncate" style={{ maxWidth: "70%" }}>
                  {selectedSort ? selectedSort : "Sort By"}
                </span>
                <img
                  src={chevronDownIcon}
                  alt="Dropdown Icon"
                  className={`w-5 h-5 max-w-[24px] max-h-[24px] object-contain ${
                    isSortOpen ? "transform rotate-180" : ""
                  } transition-transform duration-300`}
                />
              </button>

              <div
                className={`absolute w-full mt-1 bg-white rounded-md shadow-lg transition-opacity duration-300 ${
                  isSortOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <ul className="space-y-2">
                  <li
                    onClick={() => handleSelectSort("Rating")}
                    className="text-[#358DB3] text-left font-bold text-sm sm:text-base md:text-lg p-2 cursor-pointer hover:bg-blue-100 transition-colors duration-300"
                  >
                    Rating
                  </li>
                  <li
                    onClick={() => handleSelectSort("Fee")}
                    className="text-[#358DB3] text-left font-bold text-sm sm:text-base md:text-lg p-2 cursor-pointer hover:bg-blue-100 transition-colors duration-300"
                  >
                    Fee
                  </li>
                </ul>
              </div>
            </div>

            <div
              className="relative sm:w-[180px] w-full"
              ref={orderDropdownRef}
            >
              <button
                onClick={toggleOrderDropdown}
                className="p-2 rounded-md bg-white text-[#187DA8] font-bold text-sm sm:text-base md:text-lg w-full h-[45px] flex justify-between items-center hover:bg-blue-200 transition-all duration-300"
              >
                <span>
                  {sortOrder === "ascending" ? "Ascending" : "Descending"}
                </span>
                <img
                  src={chevronDownIcon}
                  alt="Dropdown Icon"
                  className={`w-5 h-5 max-w-[24px] max-h-[24px] object-contain ${
                    isOrderOpen ? "transform rotate-180" : ""
                  } transition-transform duration-300`}
                />
              </button>

              <div
                className={`absolute w-full mt-1 bg-white rounded-md shadow-lg transition-opacity duration-300 ${
                  isOrderOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <ul className="space-y-2">
                  <li
                    onClick={() => handleSortOrderChange("ascending")}
                    className="text-[#358DB3] text-left font-bold text-sm sm:text-base md:text-lg p-2 cursor-pointer hover:bg-blue-100 transition-colors duration-300"
                  >
                    Ascending
                  </li>
                  <li
                    onClick={() => handleSortOrderChange("descending")}
                    className="text-[#358DB3] text-left font-bold text-sm sm:text-base md:text-lg p-2 cursor-pointer hover:bg-blue-100 transition-colors duration-300"
                  >
                    Descending
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Display All Psychiatrists or Filtered Results */}
        <div className="bg-white w-[95%] max-w-full max-h-[600px] sm:w-[90%] md:w-[85%] lg:w-[80%] h-auto sm:h-[600px] overflow-auto mx-auto p-4 sm:p-8 lg:p-12 rounded-lg mt-4 mb-8 shadow-lg">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-1/2 h-2 bg-gray-300 rounded-full overflow-hidden">
                <div className="h-full bg-[#32481F] animate-loading-bar"></div>
              </div>
              <style>
                {`
                  @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                  }
                  .animate-loading-bar {
                    animation: loading-bar 1.5s infinite;
                  }
                `}
              </style>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10">
              {sortedPsychiatrists.map((psychiatrist, index) => (
                <PsychiatristSearchProfile
                  key={index}
                  name={psychiatrist.name}
                  specialty={psychiatrist.specialty}
                  price={psychiatrist.price}
                  rating={psychiatrist.rating}
                  sessions={psychiatrist.sessions}
                  image={psychiatrist.image}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mountain Image */}
      <img
        src={gunung}
        alt="Gunung"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "auto",
          maxHeight: "100vh",
          objectFit: "contain",
          zIndex: -1,
        }}
      />
    </div>
  );
};

export default SearchPskiater;
