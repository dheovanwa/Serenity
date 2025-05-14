import React, { useState, useRef, useEffect } from "react";
import backgroundImage from "../assets/Searchpsi.png";
import searchIcon from "../assets/search1.png";
import chevronDownIcon from "../assets/con1.png";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import PsychiatristSearchProfile from "../components/PsychiatristSearchProfile";

interface Psychiatrist {
  id: string; // Add this
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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
      if (
        orderDropdownRef.current &&
        !orderDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOrderOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        backgroundPosition: "top",
      }}
    >
      <div className="pt-8 px-4">
        <h1 className="text-white font-bold text-2xl text-center sm:text-3xl mb-16">
          Your mind deserves care,
          <br />
          let us help you find the right psychiatrist
        </h1>

        {/* Search Bar Section */}
        <div className="flex justify-center items-center mt-4 flex-wrap">
          <div className="flex items-center space-x-4 w-[90%] sm:w-[90%] lg:w-[90%]">
            <div className="relative w-[70%]">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search for a Psychiatrist..."
                className="bg-white text-[#187DA8] p-2 rounded-md w-[100%] h-[45px] pl-14"
              />
              <img
                src={searchIcon}
                alt="Search Icon"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6"
              />
            </div>

            {/* Clear Button */}
            <button
              onClick={handleClear}
              className="bg-white text-[#187DA8] text-center font-semibold text-[16px] sm:text-[18px] md:text-[20px] rounded-md w-[10%] h-[45px]"
            >
              Clear
            </button>

            {/* Sort By Dropdown */}
            <div className="relative w-[20%]" ref={sortDropdownRef}>
              <button
                onClick={toggleSortDropdown}
                className="p-2 rounded-md bg-white text-[#187DA8] font-bold text-[16px] sm:text-[18px] md:text-[20px] w-full h-[45px] flex justify-between items-center hover:bg-blue-200 transition-all duration-300"
              >
                <span>{selectedSort ? selectedSort : "Sort By"}</span>
                <img
                  src={chevronDownIcon}
                  alt="Dropdown Icon"
                  className={`${
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
                    className="text-[#358DB3] text-left font-bold text-[16px] sm:text-[18px] md:text-[20px] p-2 cursor-pointer hover:bg-blue-100 transition-colors duration-300"
                  >
                    Rating
                  </li>
                  <li
                    onClick={() => handleSelectSort("Fee")}
                    className="text-[#358DB3] text-left font-bold text-[16px] sm:text-[18px] md:text-[20px] p-2 cursor-pointer hover:bg-blue-100 transition-colors duration-300"
                  >
                    Fee
                  </li>
                </ul>
              </div>
            </div>

            {/* Sorting Order Dropdown (Ascending/Descending) */}
            <div className="relative w-[20%]" ref={orderDropdownRef}>
              <button
                onClick={toggleOrderDropdown}
                className="p-2 rounded-md bg-white text-[#187DA8] font-bold text-[16px] sm:text-[18px] md:text-[20px] w-full h-[45px] flex justify-between items-center hover:bg-blue-200 transition-all duration-300"
              >
                <span>
                  {sortOrder === "ascending" ? "Ascending" : "Descending"}
                </span>
                <img
                  src={chevronDownIcon}
                  alt="Dropdown Icon"
                  className={`${
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
                    className="text-[#358DB3] text-left font-bold text-[16px] sm:text-[18px] md:text-[20px] p-2 cursor-pointer hover:bg-blue-100 transition-colors duration-300"
                  >
                    Ascending
                  </li>
                  <li
                    onClick={() => handleSortOrderChange("descending")}
                    className="text-[#358DB3] text-left font-bold text-[16px] sm:text-[18px] md:text-[20px] p-2 cursor-pointer hover:bg-blue-100 transition-colors duration-300"
                  >
                    Descending
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Display All Psychiatrists or Filtered Results */}
        <div className="bg-white w-[90%] max-w-full h-[700px] overflow-auto mx-auto p-16 rounded-lg mt-4 mb-8 shadow-lg">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center bg-white p-4 rounded-lg shadow-xl hover:shadow-lg transition-all duration-300"
                >
                  {/* Image skeleton - exact match to psychiatrist card image */}
                  <div className="w-full max-w-[213px] h-[320px] bg-gray-200 rounded-lg animate-pulse"></div>

                  {/* Name skeleton - match text size */}
                  <div className="w-36 h-6 bg-gray-200 rounded mt-2 animate-pulse"></div>

                  {/* Specialty skeleton - match text size */}
                  <div className="w-44 h-4 bg-gray-200 rounded mt-2 animate-pulse"></div>

                  {/* Price and sessions skeleton - match layout */}
                  <div className="flex items-center mt-2 space-x-2">
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>

                  {/* Rating stars skeleton - match star size */}
                  <div className="w-[160px] h-9 bg-gray-200 rounded-[10px] mt-4 animate-pulse"></div>

                  {/* Button skeleton - match button dimensions */}
                  <button className="w-[173px] h-9 bg-gray-200 rounded-[10px] mt-4 animate-pulse"></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10">
              {sortedPsychiatrists.map((psychiatrist) => (
                <PsychiatristSearchProfile
                  key={psychiatrist.id}
                  id={psychiatrist.id}
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
    </div>
  );
};

export default SearchPskiater;
