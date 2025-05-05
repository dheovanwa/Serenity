import React, { useState, useRef, useEffect } from "react";
import background from "../assets/Master Background2.png";
import logo from "../assets/LogoIconWhite.png";
import searchLogo from "../assets/MagnifyingGlass.png";
import avatar from "../assets/avatar.png";
// import Footer from "../components/Footer";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";
import email from "../assets/email.png";
import { LineCharts } from "../components/Chart";
import { CarouselDemo } from "../components/RecommendedPsychiatrist";
import RadarChart from "../components/RadarChart";

// import { RecommendedPsychiatrists } from "../components/RecommendedPsychiatrist";
// import { ChartContainer, ChartTooltipContent } from "../components/ui/chart";
// import CardSlider from "../components/RecommendedPsychiatrist";

const Homepage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const profileRef = useRef<HTMLDivElement>(null); // Referensi untuk profile

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);

    
  };
  const radarData = [
    { Health: "Mood & Energy", Level: 1 },
    { Health: "Anxiety & Worry", Level: 2 },
    { Health: "Depression Symptoms", Level: 3 },
    { Health: "Social Support", Level: 2 },
    { Health: "Coping Mechanisms", Level: 1 },
  ];
  // Menangani klik di luar dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false); // Menutup dropdown jika klik di luar area profile
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="h-full w-full bg-cover flex flex-col"
      style={{ backgroundImage: `url(${background})` }}
    >
      <header className="bg-black/20 flex items-center justify-between px-4 py-2 shadow-md relative">
        {/* Logo Kiri */}
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
        <div className="flex items-center space-x-4" ref={profileRef}>
          <div className="flex items-center space-x-2">
            <img
              src={avatar}
              alt="avatar"
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
          <div className="text-white cursor-pointer" onClick={toggleMenu}>
            <span className="font-bold text-xl">Elon Musk</span>
          </div>
        </div>
      </header>
      <div className="flex justify-center items-center mt-60 font-krub">
        <h1 className="text-white text-8xl font-bold text-center leading-snug">
          Welcome to
          <br /> <span>Serenity</span>
        </h1>
      </div>

      {/* Statistics */}
      <h1 className="text-6xl font-bold text-center leading-snug text-white pt-300">Radar Chart</h1>
      <div className="flex justify-center items-center text-white">
      
      <RadarChart
        data={radarData}
        dataKey="Level"
        labelKey="Health"
        strokeColor="black"          
        fillColor="white"              
        width={1200}
        height={750}
      />
    </div>
      <div className="mt-100 ml-30">
        <h1 className="text-7xl text-white font-semibold drop-shadow-md mb-10">
          Statistics
        </h1>
        <div className="items-center grid grid-cols-1 md:grid-cols-2 gap-185">
          <div>
            <h1 className="mb-5 text-4xl ml-2 text-white font-semibold drop-shadow-md">
              Daily Stress Level
            </h1>
            <div className="w-100 h-200">
              <LineCharts />
            </div>
          </div>
          <div>
            <h1 className="mb-5 text-4xl ml-2 text-white font-semibold drop-shadow-md">
              Latest Stress Level
            </h1>
            <div className="w-100 h-200">
              <LineCharts />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Psychiatrists */}
      <div className="ml-30">
        <h1 className="text-5xl text-white font-semibold drop-shadow-md mb-10">
          Recommended Psychiatrists
        </h1>
        <div className="flex justify-center items-center mb-20">
          <CarouselDemo />
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute top-16 right-4 bg-white p-4 rounded-lg shadow-lg w-40 z-20">
          <div className="text-blue-300 font-semibold cursor-pointer">
            Profile
          </div>
          <hr className="my-2" />
          <div className="text-blue-300 font-semibold cursor-pointer">
            Sign Out
          </div>
        </div>
      )}
      <footer className="bg-[#453A2F] text-white pt-5">
        <div className="mx-auto ml-20 mr-20 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left Section: Website Name and Social Links */}
            <div className="text-left">
              <h2 className="text-5xl font-bold mb-6">Serenity</h2>
              <ul className="flex flex-col space-y-6">
                {" "}
                {/* Flex kolom, dengan jarak vertikal */}
                <li className="flex items-center space-x-4">
                  <img src={Instagram} alt="Instagram" className="w-10 h-10" />
                  <span>@mentalhealth.id</span> {/* Teks di samping gambar */}
                </li>
                <li className="flex items-center space-x-4">
                  <img src={Whatsapp} alt="Whatsapp" className="w-10 h-10" />
                  <span>+628529320581</span>
                </li>
                <li className="flex items-center space-x-4">
                  <img src={email} alt="email" className="w-10 h-10" />
                  <span>mentalhealth@serenity.co.id</span>
                </li>
              </ul>
            </div>

            {/* Middle Section: Consumer Complaints Service */}
            <div className="">
              <h3 className="text-3xl font-semibold mb-4">
                Consumer Complaints Service
              </h3>
              <p className="text-sm">
                PT Mental Health Corp <br />
                Jl. Raya Kb. Jeruk No.27, RT.1/RW.9, Kemanggisan, Kec. Palmerah,
                Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11530
              </p>
            </div>

            {/* Right Section: Site Map */}
            <div className="text-right">
              <h3 className="text-3xl font-semibold mb-4">Site Map</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2">
                <li>
                  <a href="#" className="hover:opacity-75">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Terms & Condition
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Media
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Partnership
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-75">
                    Promotions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Bottom Section: Copyright */}
        <div className="mt-16 text-center bg-[#525252] py-2">
          <p className="text-sm font-bold">
            Â© 2024 - 2025 Mental Health J&D Sp. co.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;