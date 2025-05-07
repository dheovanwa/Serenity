import React, { useState, useEffect } from "react";
import logo from "../assets/LogoIconWhite.png";
import searchLogo from "../assets/MagnifyingGlass.png";
// import avatar from "../assets/avatar.png";
import Instagram from "../assets/instagram.png";
import Whatsapp from "../assets/whatsapp.png";
import email from "../assets/email.png";
import { LineCharts } from "../components/Chart";
import { CarouselDemo } from "../components/RecommendedPsychiatrist";
import RadarChart from "../components/RadarChart";
import { ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/Master Background11.png";
import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

const Homepage: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("Loading..."); // Default to "Loading..."
  const [radarData, setRadarData] = useState([
    { Health: "Mood & Energy", Percentage: 0 },
    { Health: "Mental Calmness", Percentage: 0 },
    { Health: "Emotional Wellbeing", Percentage: 0 },
    { Health: "Social Support", Percentage: 0 },
    { Health: "Coping Mechanisms", Percentage: 0 },
  ]);
  const [lineChartData, setLineChartData] = useState({
    who5: [],
    gad7: [],
    phq9: [],
    mspss: [],
    cope: [],
  });
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const checkAuthentication = () => {
      const documentId = localStorage.getItem("documentId");
      if (!documentId) {
        navigate("/signin"); // Redirect to signin if not logged in
      }
    };

    checkAuthentication();
  }, [navigate]);

  useEffect(() => {
    const fetchUserName = async () => {
      const documentId = localStorage.getItem("documentId");
      if (!documentId) return;

      try {
        const userDocRef = doc(db, "users", documentId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(
            `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
          );
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
        setUserName("User"); // Fallback if there's an error
      }
    };

    fetchUserName();
  }, []);

  useEffect(() => {
    const fetchLatestData = async () => {
      const documentId = localStorage.getItem("documentId");
      if (!documentId) return;

      try {
        const userDocRef = doc(db, "users", documentId);
        const historyCollectionRef = collection(userDocRef, "history_stress");
        const latestQuery = query(
          historyCollectionRef,
          orderBy("timestamp", "desc"),
          limit(7)
        );
        const querySnapshot = await getDocs(latestQuery);

        if (!querySnapshot.empty) {
          const documents = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            timestamp: new Date(doc.data().timestamp).toLocaleDateString(),
          }));

          setRadarData([
            { Health: "Mood & Energy", Percentage: documents[0].who5 || 0 },
            { Health: "Mental Calmness", Percentage: documents[0].gad7 || 0 },
            {
              Health: "Emotional Wellbeing",
              Percentage: documents[0].phq9 || 0,
            },
            { Health: "Social Support", Percentage: documents[0].mspss || 0 },
            { Health: "Coping Mechanisms", Percentage: documents[0].cope || 0 },
          ]);

          setLineChartData({
            who5: documents.map((doc) => ({
              x: doc.timestamp,
              y: doc.who5 || 0,
            })),
            gad7: documents.map((doc) => ({
              x: doc.timestamp,
              y: doc.gad7 || 0,
            })),
            phq9: documents.map((doc) => ({
              x: doc.timestamp,
              y: doc.phq9 || 0,
            })),
            mspss: documents.map((doc) => ({
              x: doc.timestamp,
              y: doc.mspss || 0,
            })),
            cope: documents.map((doc) => ({
              x: doc.timestamp,
              y: doc.cope || 0,
            })),
          });
        }
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchLatestData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("documentId"); // Clear user data from localStorage
    navigate("/signin"); // Redirect to login page
  };

  return (
    <div
      className="min-h-screen w-full bg-cover flex flex-col overflow-x-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
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

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)} // Toggle dropdown
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
                  onClick={handleLogout} // Call logout function
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      <div className="flex justify-center items-center mt-60 font-krub">
        <h1 className="text-white text-8xl font-bold text-center leading-snug">
          Welcome to
          <br /> <span>Serenity</span>
        </h1>
      </div>

      {/* Radar Chart */}
      <h1 className="mt-20 font-bold text-4xl text-center leading-snug text-black pt-110">
        Radar Chart
      </h1>
      <div className="flex justify-center items-center text-white pt-10">
        <RadarChart
          data={radarData}
          dataKey="Percentage"
          labelKey="Health"
          strokeColor="black"
          fillColor="white"
          width="100%"
          height={750}
          marginTop={100}
        />
      </div>

      {/* Statistics */}
      <div className="mt-5 ml-15">
        <h1 className="text-7xl text-white font-semibold drop-shadow-md mb-10">
          Statistics
        </h1>
        <div className="grid md:grid-cols-3 gap-15 mr-20">
          {/* Mood & Energy */}
          <div className="flex flex-col items-center">
            <h1 className="mb-5 text-4xl ml-2 text-white font-semibold drop-shadow-md">
              Mood & Energy
            </h1>
            <div className="w-full h-150">
              <LineCharts
                data={lineChartData.who5}
                title="Mood & Energy"
                xKey="x"
                yKey="y"
              />
            </div>
          </div>

          {/* Mental Calmness */}
          <div className="flex flex-col items-center">
            <h1 className="mb-5 text-4xl ml-2 text-white font-semibold drop-shadow-md">
              Mental Calmness
            </h1>
            <div className="w-full h-150">
              <LineCharts
                data={lineChartData.gad7}
                title="Mental Calmness"
                xKey="x"
                yKey="y"
              />
            </div>
          </div>

          {/* Emotional Wellbeing */}
          <div className="flex flex-col items-center">
            <h1 className="mb-5 text-4xl ml-2 text-white font-semibold drop-shadow-md">
              Emotional Wellbeing
            </h1>
            <div className="w-full h-150">
              <LineCharts
                data={lineChartData.phq9}
                title="Emotional Wellbeing"
                xKey="x"
                yKey="y"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-15 mr-20 mb-25">
          {/* Mood & Energy */}
          <div className="flex flex-col items-center">
            <h1 className="mb-5 text-4xl ml-2 text-white font-semibold drop-shadow-md">
              Social Support
            </h1>
            <div className="w-3/4 h-150">
              <LineCharts
                data={lineChartData.mspss}
                title="Social Support"
                xKey="x"
                yKey="y"
              />
            </div>
          </div>

          {/* Coping Mechanisms */}
          <div className="flex flex-col items-center">
            <h1 className="mb-5 text-4xl ml-2 text-white font-semibold drop-shadow-md">
              Coping Mechanisms
            </h1>
            <div className="w-3/4 h-150">
              <LineCharts
                data={lineChartData.cope}
                title="Coping Mechanisms"
                xKey="x"
                yKey="y"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Psychiatrists */}
      <div className="mt-30 ml-6 sm:ml-15">
        <h1 className="text-5xl text-white font-semibold drop-shadow-md mb-10">
          Recommended Psychiatrists
        </h1>
        <div className="flex justify-center items-center mb-10">
          {/* Ensure the carousel container is responsive */}
          <div className="w-full" style={{ maxWidth: "1200px" }}>
            <CarouselDemo />
          </div>
        </div>
      </div>

      <footer className="bg-[#453A2F] text-white pt-5">
        <div className="mx-auto ml-20 mr-20 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left Section: Website Name and Social Links */}
            <div className="text-left">
              <h2 className="text-5xl font-bold mb-6">Serenity</h2>
              <ul className="flex flex-col space-y-6">
                <li className="flex items-center space-x-4">
                  <img src={Instagram} alt="Instagram" className="w-10 h-10" />
                  <span>@mentalhealth.id</span>
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
