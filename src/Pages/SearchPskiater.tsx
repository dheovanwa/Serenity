import React, { useState } from 'react';
import backgroundImage from '../assets/Searchpsi.png';
import searchIcon from '../assets/search1.png'; 
import chevronDownIcon from '../assets/con1.png'; 
import starIcon from '../assets/star.png';
import doctor1 from '../assets/D1.png';
import doctor2 from '../assets/D2.png';
import doctor3 from '../assets/D3.png';
import doctor4 from '../assets/D4.png';
import doctor5 from '../assets/D5.png';
import doctor6 from '../assets/D6.png';
import doctor7 from '../assets/D7.png';
import doctor8 from '../assets/D8.png';
import doctor9 from '../assets/D9.png';
import doctor10 from '../assets/D10.png';
import doctor11 from '../assets/D11.png';
import doctor12 from '../assets/D12.png';
const SearchPskiater: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedSort, setSelectedSort] = useState(''); 
  const [isSortOpen, setIsSortOpen] = useState(false); 
  const [sortOrder, setSortOrder] = useState('ascending'); 
  const [isOrderOpen, setIsOrderOpen] = useState(false); 

  const handleClear = () => {
    setSearchText('');
    setSelectedSort('');
    setSortOrder('ascending'); 
  };

  const toggleSortDropdown = () => {
    setIsSortOpen(!isSortOpen); 
  };

  const toggleOrderDropdown = () => {
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
    { name: 'Titin Sulaiman', specialty: 'Anxiety & Depression Specialist', price: '$24.99', rating: 5, sessions: 7 },
    { name: 'Martin Luther', specialty: 'PTSD & Trauma Specialist', price: '$25.99', rating: 3, sessions: 7 },
    { name: 'Virle Syahroks', specialty: 'Bipolar Disorder Specialist', price: '$28.99', rating: 4, sessions: 7 },
    { name: 'Yorkiv Gizlkenzix', specialty: 'Personality Disorders Specialist', price: '$34.99', rating: 5, sessions: 7 },
    { name: 'Robert Ukerliznes', specialty: 'Sleep Disorders Psychiatrist', price: '$27.99', rating: 5, sessions: 7 },
    { name: 'Tariots Survfig', specialty: 'Eating Disorders Psychiatrist', price: '$29.90', rating: 5, sessions: 7 },
    { name: 'John Doe', specialty: 'Sleep Disorders Specialist', price: '$20.99', rating: 4, sessions: 6 },
    { name: 'Jane Smith', specialty: 'Anxiety Specialist', price: '$22.99', rating: 4, sessions: 5 },
    { name: 'Alice Brown', specialty: 'Depression Specialist', price: '$27.50', rating: 5, sessions: 8 },
    { name: 'David Clark', specialty: 'PTSD Specialist', price: '$30.00', rating: 5, sessions: 6 },
    { name: 'Michael White', specialty: 'Personality Disorder Specialist', price: '$35.00', rating: 4, sessions: 7 },
    { name: 'Ralieyz Baxckz', specialty: 'Bipolar Disorder Specialist', price: '$26.50', rating: 4, sessions: 5 },
  ];
  const doctorImages = [
    doctor1, doctor2, doctor3, doctor4, doctor5, doctor6, 
    doctor7, doctor8, doctor9, doctor10, doctor11, doctor12
  ];
  const filteredPsychiatrists = searchText
    ? psychiatrists.filter(psychiatrist =>
        psychiatrist.name.toLowerCase().startsWith(searchText.toLowerCase())
      )
    : psychiatrists;

  
  const sortPsychiatrists = (list: any[], option: string, order: string) => {
    const sortedList = [...list];
    switch (option) {
      case 'Rating':
        return sortedList.sort((a, b) => order === 'ascending' ? a.rating - b.rating : b.rating - a.rating);
      case 'Popularity':
        return sortedList.sort((a, b) => order === 'ascending' ? a.sessions - b.sessions : b.sessions - a.sessions);
      case 'Fee':
        return sortedList.sort((a, b) => {
          const priceA = parseFloat(a.price.slice(1));
          const priceB = parseFloat(b.price.slice(1));
          return order === 'ascending' ? priceA - priceB : priceB - priceA;
        });
      default:
        return sortedList;
    }
  };

  const sortedPsychiatrists = sortPsychiatrists(filteredPsychiatrists, selectedSort, sortOrder);

  return (
    <div
      className="min-h-screen w-full bg-cover flex flex-col overflow-x-hidden "
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'top' }}
    >
      <div className="pt-50 px-4 ">
        <h1 className="text-white text-2xl text-center sm:text-3xl">
          Your mind deserves care—let us<br />help you find the right psychiatrist
        </h1>
        <h2 className="text-white text-5xl pt-20 ml-30">Serenity</h2>

        {/* Search Bar Section */}
        <div className="flex justify-center items-center mt-8 flex-wrap">
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
            <div className="relative w-[20%]">
              <button
                onClick={toggleSortDropdown}
                className="p-2 rounded-md bg-white text-[#187DA8] font-bold text-[16px] sm:text-[18px] md:text-[20px] w-full h-[45px] flex justify-between items-center hover:bg-blue-200 transition-all duration-300"
              >
                <span>{selectedSort ? selectedSort : 'Sort By'}</span>
                <img
                  src={chevronDownIcon}
                  alt="Dropdown Icon"
                  className={`${isSortOpen ? 'transform rotate-180' : ''} transition-transform duration-300`} 
                />
              </button>

              <div
                className={`absolute w-full mt-1 bg-white rounded-md shadow-lg transition-opacity duration-300 ${isSortOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                <ul className="space-y-2">
                  <li
                    onClick={() => handleSelectSort('Rating')}
                    className="text-[#358DB3] text-left font-bold text-[16px] sm:text-[18px] md:text-[20px] p-2 cursor-pointer hover:bg-blue-100 transition-colors duration-300"
                  >
                    Rating
                  </li>
                  <li
                    onClick={() => handleSelectSort('Popularity')}
                    className="text-[#358DB3] text-left font-bold text-[16px] sm:text-[18px] md:text-[20px] p-2 cursor-pointer hover:bg-blue-100 transition-colors duration-300"
                  >
                    Popularity
                  </li>
                  <li
                    onClick={() => handleSelectSort('Fee')}
                    className="text-[#358DB3] text-left font-bold text-[16px] sm:text-[18px] md:text-[20px] p-2 cursor-pointer hover:bg-blue-100 transition-colors duration-300"
                  >
                    Fee
                  </li>
                </ul>
              </div>
            </div>

            {/* Sorting Order Dropdown (Ascending/Descending) */}
            <div className="relative w-[20%]">
              <button
                onClick={toggleOrderDropdown}
                className="p-2 rounded-md bg-white text-[#187DA8] font-bold text-[16px] sm:text-[18px] md:text-[20px] w-full h-[45px] flex justify-between items-center hover:bg-blue-200 transition-all duration-300"
              >
                <span >{sortOrder === 'ascending' ? 'Ascending' : 'Descending'}</span>
                <img
                  src={chevronDownIcon}
                  alt="Dropdown Icon"
                  className={`${isOrderOpen ? 'transform rotate-180' : ''} transition-transform duration-300`} 
                />
              </button>

              <div
                className={`absolute w-full mt-1 bg-white rounded-md shadow-lg transition-opacity duration-300 ${isOrderOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                <ul className="space-y-2">
                  <li
                    onClick={() => handleSortOrderChange('ascending')}
                    className="text-[#358DB3] text-left font-bold text-[16px] sm:text-[18px] md:text-[20px] p-2 cursor-pointer hover:bg-blue-100 transition-colors duration-300"
                  >
                    Ascending
                  </li>
                  <li
                    onClick={() => handleSortOrderChange('descending')}
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
        <div className="bg-white w-[90%] max-w-full h-[618px] overflow-auto mx-auto p-20 rounded-lg mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-10">
            {sortedPsychiatrists.map((psychiatrist, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center bg-white p-4 rounded-lg shadow-xl hover:shadow-lg hover:border-2 hover:border-[#187DA8] transition-all duration-300 focus:outline-none"
              >
                <img
                   src={doctorImages[index % doctorImages.length]} 
                  alt={psychiatrist.name}
                  className="w-full h-auto max-w-[213px] max-h- rounded-lg object-cover"
                />
                <h3 className="text-xl font-semibold text-black mt-2">{psychiatrist.name}</h3>
                <p className="text-sm text-black">{psychiatrist.specialty}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <p className="text-lg font-semibold">{psychiatrist.price}</p>
                  <p className="text-lg font-semibold">/</p>
                  <p className="text-lg font-semibold">{psychiatrist.sessions} sessions</p>
                </div>
                <div className="flex mt-2">
                  {Array.from({ length: psychiatrist.rating }).map((_, i) => (
                    <img
                      key={i}
                      src={starIcon}
                      alt="Star"
                    />
                  ))}
                </div>
                <button className="mt-4 bg-[#187DA8] text-white font-semibold rounded-[10px] py-2 px-4 hover:bg-[#155D8A] transition-all duration-300">
                  Make Appointment
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPskiater;
