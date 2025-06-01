import React, { useEffect, useState, useRef } from "react";
import { ButtonOutline } from "../components/ButtonOutline";
import { Button } from "../components/Button";
import background from "../assets/backgroundSignin.png";
import logoLight from "../assets/Logo - Light.png";
import logoDark from "../assets/Logo - Dark.png"; // Import logo dark
import dep1 from "../assets/dep1.png";
import dep2 from "../assets/dep2.png";
import dep3 from "../assets/dep3.png";
import dep4 from "../assets/dep4.png";
import { useNavigate } from "react-router-dom";
import ProfilePic from "../assets/default_profile_image.svg";
import Sun from "../assets/Sun.svg";
import Moon from "../assets/Do not Disturb iOS.svg";
// Remove firebase/firestore imports
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "../config/firebase";
// Add import for local JSON
import psychiatristsData from "../utils/psychiatrists.json";
import Footer from "../components/Footer";

// Add interface for psychiatrist data
interface Psychiatrist {
  id?: string;
  name: string;
  specialty: string;
  image?: string;
}

// Add function to fetch psychiatrists from local JSON
const fetchPsychiatrists = (): Psychiatrist[] => {
  // psychiatristsData is an array, not an object with .psychiatrists
  if (Array.isArray(psychiatristsData)) {
    return psychiatristsData.map((d, idx) => ({
      id: d.id || idx.toString(),
      name: d.name || "Tanpa Nama",
      specialty: d.specialty || "Spesialisasi tidak tersedia",
      image:
        d.image && typeof d.image === "string" && d.image.trim() !== ""
          ? d.image
          : ProfilePic,
    }));
  }
  return [];
};

const MentalHealthPage: React.FC = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Showcase: List of psychiatrists
  const [psychiatrists, setPsychiatrists] = useState<
    { id?: string; name: string; specialty: string; image?: string }[]
  >([]);

  useEffect(() => {
    // Load from local JSON instead of Firestore
    setPsychiatrists(fetchPsychiatrists());
  }, []);

  // Infinite carousel logic for psychiatrists
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Auto-move carousel every 2.5s
  useEffect(() => {
    if (psychiatrists.length <= 3) return; // No need to scroll if <= 3
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % psychiatrists.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [psychiatrists.length]);

  // Calculate visible psychiatrists (show 3 at a time)
  const getVisiblePsychiatrists = () => {
    if (psychiatrists.length <= 3) return psychiatrists;
    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(psychiatrists[(carouselIndex + i) % psychiatrists.length]);
    }
    return result;
  };

  // Function to handle button click for navigation
  const handleNavigate = (path: string) => {
    navigate(path); // Navigate to the provided path
  };

  // Dark mode state and toggle
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("isDarkMode");
    return stored ? stored === "true" : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("isDarkMode", isDarkMode.toString());
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <div
      className={`bg-[#f0eadf] min-h-screen flex flex-col dark:bg-[#161F36]`}
    >
      {/* Logo at top left and dark mode toggle at top right */}
      <div className="absolute top-5 left-4 flex items-center gap-2 z-10">
        <img
          src={isDarkMode ? logoDark : logoLight}
          alt="Logo"
          className="w-16 h-16"
        />
        <h1 className="text-xl text-[#78716C] dark:text-[#BACBD8]">Serenity</h1>
      </div>
      <div className="absolute top-5 right-4 z-10">
        <button
          onClick={toggleTheme}
          className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none shadow-inner bg-gray-300 dark:bg-[#4A4A4A]`}
          aria-label="Toggle theme"
        >
          <span
            className={`absolute top-1/2 -translate-y-1/2 inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 dark:bg-[#161F36] ${
              isDarkMode
                ? "translate-x-6 left-0.5 dark:bg-gray-700"
                : "translate-x-0.5 left-0.5"
            }`}
          >
            {isDarkMode ? (
              <img
                src={Moon}
                alt="Moon Icon"
                className="w-4 h-4 m-auto absolute inset-0"
              />
            ) : (
              <img
                src={Sun}
                alt="Sun Icon"
                className="w-4 h-4 m-auto absolute inset-0"
              />
            )}
          </span>
        </button>
      </div>
      {/* Main content */}
      <div
        className={`px-4 mt-30 ml-10 flex items-start justify-start gap-8 xl:mt-40 xl:ml-30 lg:mt-40 lg:ml-20 md:mt-30 md:ml-10 sm:mt-30 sm:ml-10 text-black dark:text-[#BACBD8]`}
      >
        <section className=" ">
          <h1 className="text-[#1a1a1a] dark:text-[#BACBD8] font-semibold text-lg md:text-2xl lg:text-3xl xl:text-4xl leading-tight mb-2">
            Perjalanan Anda Menuju Kesehatan Mental
            <br />
            yang Lebih Baik Dimulai di Sini
          </h1>
          <p className="text-[#4a4a4a] dark:text-gray-300 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl mb-10">
            Wawasan pribadi, dukungan waktu nyata, <br />
            dan alat canggih untuk kesejahteraan mental Anda.
          </p>
          <div className="flex items-center space-x-4">
            <button
              className="text-[#1a1a1a] bg-[#a9bbca] dark:bg-[#1A2947] dark:text-[#BACBD8] text-xs md:text-sm font-normal rounded-full px-4 py-1"
              onClick={() => handleNavigate("/signin")}
            >
              Masuk ke Serenity
            </button>
            <button
              className="text-[#1a1a1a] dark:text-[#BACBD8] text-xs md:text-sm font-normal rounded-full border border-[#1a1a1a] dark:border-[#BACBD8] px-4 py-1"
              onClick={() => handleNavigate("/signup")}
            >
              Bergabung ke Serenity
            </button>
          </div>
        </section>
      </div>

      {/* Cards */}
      <section
        className={`max-w-[2200px] mx-auto px-4 mt-12 flex flex-col sm:flex-row md:justify-center sm:gap-12 gap-8 mb-12 dark:bg-[#161F36]`}
      >
        {/* Responsive: horizontal scroll on mobile, grid on desktop */}
        <div className="flex flex-col lg:flex-row sm:flex-col gap-8 w-full overflow-x-auto sm:overflow-visible">
          {/* Card 1 */}
          <div
            className={`
              bg-[#ffe6cc] dark:bg-[#1A2947] rounded-3xl p-6 md:p-10 md:max-w-[380px] flex-shrink-0
              flex flex-row sm:flex-col items-center
              min-w-[320px] sm:min-w-0 w-[90vw] sm:w-auto
              text-black dark:text-[#BACBD8]
            `}
          >
            <div className="flex-1 flex flex-col justify-center items-start">
              <h2 className="font-semibold text-xl mb-2 sm:mb-3">KECEMASAN</h2>
              <p className="font-regular text-sm leading-relaxed mb-0 sm:mb-4">
                Rasa cemas berlebihan bisa mengganggu aktivitas harian.
              </p>
            </div>
            <img
              src={dep3}
              alt="depresi"
              className="w-25 h-35 sm:w-auto sm:h-auto ml-4 sm:ml-0"
            />
          </div>
          {/* Card 2 */}
          <div
            className={`
              bg-[#ffe6cc] dark:bg-[#1A2947] rounded-3xl p-6 md:p-10 md:max-w-[380px] flex-shrink-0
              flex flex-row sm:flex-col items-center
              min-w-[320px] sm:min-w-0 w-[90vw] sm:w-auto
              text-black dark:text-[#BACBD8]
            `}
          >
            <div className="flex-1 flex flex-col justify-center items-start">
              <h2 className="font-semibold text-xl mb-2 sm:mb-3">PTSD</h2>
              <p className="font-regular text-sm leading-relaxed mb-0 sm:mb-4">
                Trauma masa lalu sering membekas dan memengaruhi kehidupan
                sekarang.
              </p>
            </div>
            <img
              src={dep4}
              alt="depresi"
              className="w-25 h-35 sm:w-auto sm:h-auto ml-4 sm:ml-0"
            />
          </div>
          {/* Card 3 */}
          <div
            className={`
              bg-[#ffe6cc] dark:bg-[#1A2947] rounded-3xl p-6 md:p-10 md:max-w-[380px] flex-shrink-0
              flex flex-row sm:flex-col items-center
              min-w-[320px] sm:min-w-0 w-[90vw] sm:w-auto
              text-black dark:text-[#BACBD8]
            `}
          >
            <div className="flex-1 flex flex-col justify-center items-start">
              <h2 className="font-semibold text-xl mb-2 sm:mb-3">DEPRESI</h2>
              <p className="font-regular text-sm leading-relaxed mb-0 sm:mb-4">
                Merasa kosong, lelah, atau tidak bersemangat setiap hari? Anda
                tidak sendirian.
              </p>
            </div>
            <img
              src={dep2}
              alt="depre"
              className="w-25 h-35 sm:w-auto sm:h-auto ml-4 sm:ml-0"
            />
          </div>
          {/* Card 4 */}
          <div
            className={`
              bg-[#ffe6cc] dark:bg-[#1A2947] rounded-3xl p-6 md:p-10 md:max-w-[380px] flex-shrink-0
              flex flex-row sm:flex-col items-center
              min-w-[320px] sm:min-w-0 w-[90vw] sm:w-auto
              text-black dark:text-[#BACBD8]
            `}
          >
            <div className="flex-1 flex flex-col justify-center items-start">
              <h2 className="font-semibold text-xl mb-2 sm:mb-3">
                Stres dan Tekanan Hidup
              </h2>
              <p className="font-regular text-sm leading-relaxed mb-0 sm:mb-4">
                Tuntutan pekerjaan, keluarga, atau kehidupan bisa menumpuk jadi
                beban mental.
              </p>
            </div>
            <img
              src={dep1}
              alt="dep"
              className="w-25 h-35 sm:w-auto sm:h-auto ml-4 sm:ml-0"
            />
          </div>
        </div>
      </section>

      {/* Showcasing Features */}
      <section className={`max-w-5xl mx-auto px-4 mb-16`}>
        <h2
          className={`text-3xl font-bold mb-8 text-center text-[#161F36] dark:text-[#BACBD8]`}
        >
          Fitur Unggulan Serenity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Video Call */}
          <div className="bg-white dark:bg-[#1A2947] rounded-2xl shadow-md p-6 flex flex-col items-center">
            <img
              src="https://img.icons8.com/ios-filled/100/187DA8/video-call.png"
              alt="Video Call"
              className="w-16 h-16 mb-4"
            />
            <h3 className="text-xl font-semibold mb-2 text-[#161F36] dark:text-[#BACBD8]">
              Video Call
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Konsultasi langsung dengan psikiater melalui video call yang aman
              dan privat.
            </p>
          </div>
          {/* Chat */}
          <div className="bg-white dark:bg-[#1A2947] rounded-2xl shadow-md p-6 flex flex-col items-center">
            <img
              src="https://img.icons8.com/ios-filled/100/187DA8/chat-message.png"
              alt="Chat"
              className="w-16 h-16 mb-4"
            />
            <h3 className="text-xl font-semibold mb-2 text-[#161F36] dark:text-[#BACBD8]">
              Chat
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Fitur chat untuk diskusi cepat dan mudah dengan profesional
              kesehatan mental.
            </p>
          </div>
          {/* Recommendation Psychiatrist */}
          <div className="bg-white dark:bg-[#1A2947] rounded-2xl shadow-md p-6 flex flex-col items-center">
            <img
              src="https://img.icons8.com/ios-filled/100/187DA8/doctor-male.png"
              alt="Rekomendasi Psikiater"
              className="w-16 h-16 mb-4"
            />
            <h3 className="text-md font-semibold mb-2 text-[#161F36] dark:text-[#BACBD8]">
              Rekomendasi Psikiater
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Dapatkan rekomendasi psikiater terbaik yang sesuai dengan
              kebutuhan dan preferensi Anda.
            </p>
          </div>
          {/* Forum */}
          <div className="bg-white dark:bg-[#1A2947] rounded-2xl shadow-md p-6 flex flex-col items-center">
            <img
              src="https://img.icons8.com/ios-filled/100/187DA8/conference-call.png"
              alt="Forum"
              className="w-16 h-16 mb-4"
            />
            <h3 className="text-xl font-semibold mb-2 text-[#161F36] dark:text-[#BACBD8]">
              Forum Diskusi
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Bergabunglah dalam komunitas, berbagi pengalaman, dan dapatkan
              dukungan dari sesama pengguna.
            </p>
          </div>
        </div>
      </section>
      {/* Showcase: List of Psychiatrists as Infinite Carousel */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#161F36] dark:text-[#BACBD8]">
          Daftar Psikiater Kami
        </h2>
        <div className="relative w-full overflow-hidden">
          <div
            ref={carouselRef}
            className={`
              flex transition-transform duration-700 ease-in-out
              flex-col items-center sm:flex-row
            `}
            style={{
              width: "100%",
              minHeight: "220px",
              justifyContent: "center",
              gap: "2rem",
            }}
          >
            {getVisiblePsychiatrists().map((psy) => (
              <div
                key={psy.id}
                className="bg-white dark:bg-[#1A2947] rounded-xl shadow-md p-4 flex flex-col items-center"
                style={{
                  minWidth: "220px",
                  maxWidth: "220px",
                  width: "220px",
                }}
              >
                <img
                  src={psy.image || ProfilePic}
                  alt={psy.name}
                  className="w-20 h-20 rounded-full object-cover mb-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ProfilePic;
                  }}
                />
                <div className="text-lg font-semibold mb-1 text-[#161F36] dark:text-[#BACBD8]">
                  {psy.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 text-center">
                  {psy.specialty}
                </div>
              </div>
            ))}
          </div>
        </div>
        {psychiatrists.length > 3 && (
          <div className="flex justify-center mt-4 gap-2">
            {psychiatrists.map((_, idx) => (
              <span
                key={idx}
                className={`inline-block w-2 h-2 rounded-full ${
                  idx === carouselIndex
                    ? "bg-[#187DA8] dark:bg-[#BACBD8]"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MentalHealthPage;
