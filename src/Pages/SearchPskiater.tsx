import React, { useState, useRef, useEffect } from "react";
import backgroundImage from "../assets/Searchpsi.png";
import searchIcon from "../assets/search1.png";
import chevronDownIcon from "../assets/con1.png";
import doctor1 from "../assets/D1.png";
import doctor2 from "../assets/D2.png";
import doctor3 from "../assets/D3.png";
import doctor4 from "../assets/D4.png";
import doctor5 from "../assets/D5.png";
import doctor6 from "../assets/D6.png";
import doctor7 from "../assets/D7.png";
import doctor8 from "../assets/D8.png";
import doctor9 from "../assets/D9.png";
import doctor10 from "../assets/D10.png";
import doctor11 from "../assets/D11.png";
import doctor12 from "../assets/D12.png";
import PsychiatristSearchProfile from "../components/PsychiatristSearchProfile";

const SearchPskiater: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("ascending");
  const [isOrderOpen, setIsOrderOpen] = useState(false);

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

  const psychiatrists = [
    {
      name: "Titin Sulaiman",
      specialty: "Anxiety & Depression Specialist",
      price: "$24.99",
      rating: 5,
      sessions: 7,
      image: doctor1,
    },
    {
      name: "Martin Luther",
      specialty: "PTSD & Trauma Specialist",
      price: "$25.99",
      rating: 3,
      sessions: 7,
      image: doctor2,
    },
    {
      name: "Virle Syahroks",
      specialty: "Bipolar Disorder Specialist",
      price: "$28.99",
      rating: 4,
      sessions: 7,
      image: doctor3,
    },
    {
      name: "Yorkiv Gizlkenzix",
      specialty: "Personality Disorders Specialist",
      price: "$34.99",
      rating: 5,
      sessions: 7,
      image: doctor4,
    },
    {
      name: "Robert Ukerliznes",
      specialty: "Sleep Disorders Psychiatrist",
      price: "$27.99",
      rating: 5,
      sessions: 7,
      image: doctor5,
    },
    {
      name: "Tariots Survfig",
      specialty: "Eating Disorders Psychiatrist",
      price: "$29.90",
      rating: 5,
      sessions: 7,
      image: doctor6,
    },
    {
      name: "John Doe",
      specialty: "Sleep Disorders Specialist",
      price: "$20.99",
      rating: 4,
      sessions: 6,
      image: doctor7,
    },
    {
      name: "Jane Smith",
      specialty: "Anxiety Specialist",
      price: "$22.99",
      rating: 4,
      sessions: 5,
      image: doctor8,
    },
    {
      name: "Alice Brown",
      specialty: "Depression Specialist",
      price: "$27.50",
      rating: 5,
      sessions: 8,
      image: doctor9,
    },
    {
      name: "David Clark",
      specialty: "PTSD Specialist",
      price: "$30.00",
      rating: 5,
      sessions: 6,
      image: doctor10,
    },
    {
      name: "Michael White",
      specialty: "Personality Disorder Specialist",
      price: "$35.00",
      rating: 4,
      sessions: 7,
      image: doctor11,
    },
    {
      name: "Ralieyz Baxckz",
      specialty: "Bipolar Disorder Specialist",
      price: "$26.50",
      rating: 4,
      sessions: 5,
      image: doctor12,
    },
  ];

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
        <h1 className="text-white text-2xl text-center sm:text-3xl mb-16">
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
        </div>
      </div>
    </div>
  );
};

export default SearchPskiater;
