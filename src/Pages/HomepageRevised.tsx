import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeController } from "../controllers/HomeController";
import { CarouselDemo } from "../components/RecommendedPsychiatrist";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater";
import Footer from "../components/Footer";
import send from "../assets/send.svg";
import p1 from "../assets/p1.png";
import p2 from "../assets/p2.png";
import NavBar from "../components/NavBar";

const Homepage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  const navigate = useNavigate();
  const controller = new HomeController();

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const documentId = localStorage.getItem("documentId");
      const isAuthenticated = await controller.checkAuthentication(documentId);

      if (!isAuthenticated) {
        navigate("/signin");
        return;
      }

      const name = await controller.fetchUserName(documentId);
      setUserName(name);
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  AppointmentStatusUpdater();

  return (
    <div
      className={`min-h-screen w-full bg-cover flex flex-col overflow-x-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-[#161F36]" : "bg-[#F2EDE2]"
      }`}
    >
      <NavBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div
        className={`p-15 text-center transition-colors duration-300 ${
          isDarkMode ? "bg-[#161F36] text-[#E6E6E6]" : "bg-white text-gray-800"
        }`}
      >
        <p className="text-6xl font-semibold">Selamat datang, {userName}</p>
      </div>

      <div className="flex justify-center p-4 my-8 flex-col items-center">
        <h2
          className={`text-3xl font-semibold mb-4 w-full max-w-4xl xl:max-w-6xl transition-colors duration-300 ${
            isDarkMode ? "text-[#E6E6E6]" : "text-gray-800"
          }`}
        >
          Pesan yang Belum Dibaca
        </h2>
        <div
          className={`rounded-lg shadow-md p-10 w-full max-w-4xl xl:max-w-6xl mt-4 transition-colors duration-300 ${
            isDarkMode ? "bg-[#0f1525]" : "bg-[#E4DCCC]"
          }`}
        >
          <div className="flex items-center pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            <img
              src={p1}
              alt="Dr. Andika Prasetya"
              className="w-20 h-20 rounded-full mr-6 object-cover"
            />
            <div className="flex-1">
              <p
                className={`text-xl font-semibold transition-colors duration-300 ${
                  isDarkMode ? "text-[#E6E6E6]" : "text-gray-900"
                }`}
              >
                dr. Andika Prasetya, Sp.KJ
              </p>
              <p
                className={`text-lg transition-colors duration-300 ${
                  isDarkMode ? "text-[#BACBD8]" : "text-gray-600"
                }`}
              >
                Apakah ada yang dapat saya bantu lagi?
              </p>
            </div>
            <button
              className={`flex items-center font-medium text-lg ml-6 transition-colors duration-300 ${
                isDarkMode ? "text-[#BACBD8]" : "text-blue-600"
              }`}
            >
              Pergi
              <img
                src={send}
                alt="Send icon"
                className="h-8 w-8 ml-2 object-contain"
              />
            </button>
          </div>

          <div className="flex items-center pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            <img
              src={p2}
              alt="Dr. Maria Lestari"
              className="w-20 h-20 rounded-full mr-6 object-cover"
            />
            <div className="flex-1">
              <p
                className={`text-xl font-semibold transition-colors duration-300 ${
                  isDarkMode ? "text-[#E6E6E6]" : "text-gray-900"
                }`}
              >
                dr. Maria Lestari, Sp.KJ
              </p>
              <p
                className={`text-lg transition-colors duration-300 ${
                  isDarkMode ? "text-[#BACBD8]" : "text-gray-600"
                }`}
              >
                Kalau menurut saya, seharusnya kamu tidak...
              </p>
            </div>
            <button
              className={`flex items-center font-medium text-lg ml-6 transition-colors duration-300 ${
                isDarkMode ? "text-[#BACBD8]" : "text-blue-600"
              }`}
            >
              Pergi
              <img
                src={send}
                alt="Send icon"
                className="h-8 w-8 ml-2 object-contain"
              />
            </button>
          </div>

          <div
            className={`text-center text-lg mt-8 transition-colors duration-300 ${
              isDarkMode ? "text-[#BACBD8]" : "text-gray-500"
            }`}
          >
            Tidak ada pesan belum terbaca lagi...
          </div>
        </div>
      </div>

      <div className="flex justify-center p-4 my-8 flex-col items-center">
        <h2
          className={`text-3xl font-semibold mb-4 w-full max-w-4xl xl:max-w-6xl transition-colors duration-300 ${
            isDarkMode ? "text-[#E6E6E6]" : "text-gray-800"
          }`}
        >
          Pertemuan Mendatang
        </h2>
        <div
          className={`rounded-lg shadow-md p-10 w-full max-w-4xl xl:max-w-6xl mt-4 transition-colors duration-300 ${
            isDarkMode ? "bg-[#0f1525]" : "bg-[#E4DCCC]"
          }`}
        >
          <div className="flex items-center pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            <div
              className={`flex flex-col items-center justify-center rounded-lg p-2 w-20 h-20 mr-6 shadow-sm transition-colors duration-300 ${
                isDarkMode ? "bg-[#161F36]" : "bg-white"
              }`}
            >
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#E6E6E6]" : "text-gray-900"
                }`}
              >
                SEN
              </p>
              <p
                className={`text-4xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#E6E6E6]" : "text-gray-900"
                }`}
              >
                19
              </p>
            </div>
            <div
              className={`flex flex-row flex-1 rounded-lg p-4 shadow-sm items-center transition-colors duration-300 ${
                isDarkMode ? "bg-[#161F36]" : "bg-white"
              }`}
            >
              <div className="flex flex-col flex-1">
                <p
                  className={`text-xl font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#E6E6E6]" : "text-gray-900"
                  }`}
                >
                  dr. Andika Prasetya, Sp.KJ
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-[#BACBD8]" : "text-gray-600"
                  }`}
                >
                  Senin, 19 May 2025
                </p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p
                  className={`text-lg font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#E6E6E6]" : "text-gray-800"
                  }`}
                >
                  13.20 - 15.00
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-[#BACBD8]" : "text-gray-600"
                  }`}
                >
                  Video Call
                </p>
              </div>
              <div className="flex justify-end items-center flex-1">
                <button
                  className={`font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Bergabung
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            <div
              className={`flex flex-col items-center justify-center rounded-lg p-2 w-20 h-20 mr-6 shadow-sm transition-colors duration-300 ${
                isDarkMode ? "bg-[#161F36]" : "bg-white"
              }`}
            >
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#E6E6E6]" : "text-gray-900"
                }`}
              >
                SEN
              </p>
              <p
                className={`text-4xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#161F36]" : "text-gray-900"
                }`}
              >
                26
              </p>
            </div>
            <div
              className={`flex flex-row flex-1 rounded-lg p-4 shadow-sm items-center transition-colors duration-300 ${
                isDarkMode ? "bg-[#161F36]" : "bg-white"
              }`}
            >
              <div className="flex flex-col flex-1">
                <p
                  className={`text-xl font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#E6E6E6]" : "text-gray-900"
                  }`}
                >
                  dr. Maria Lestari, Sp.KJ
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-[#BACBD8]" : "text-gray-600"
                  }`}
                >
                  Senin, 26 May 2025
                </p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p
                  className={`text-lg font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#E6E6E6]" : "text-gray-800"
                  }`}
                >
                  13.20 - 15.00
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-[#BACBD8]" : "text-gray-600"
                  }`}
                >
                  Chat Message
                </p>
              </div>
              <div className="flex justify-end items-center flex-1">
                <button
                  className={`font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 text-[#E6E6E6] hover:bg-gray-800"
                      : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  }`}
                >
                  Kelola
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            <div
              className={`flex flex-col items-center justify-center rounded-lg p-2 w-20 h-20 mr-6 shadow-sm transition-colors duration-300 ${
                isDarkMode ? "bg-[#161F36]" : "bg-white"
              }`}
            >
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#E6E6E6]" : "text-gray-900"
                }`}
              >
                SEN
              </p>
              <p
                className={`text-4xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#161F36]" : "text-gray-900"
                }`}
              >
                3
              </p>
            </div>
            <div
              className={`flex flex-row flex-1 rounded-lg p-4 shadow-sm items-center transition-colors duration-300 ${
                isDarkMode ? "bg-[#161F36]" : "bg-white"
              }`}
            >
              <div className="flex flex-col flex-1">
                <p
                  className={`text-xl font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#E6E6E6]" : "text-gray-900"
                  }`}
                >
                  dr. Rafi Sandes, Sp.KJ, M.Kes
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-[#BACBD8]" : "text-gray-600"
                  }`}
                >
                  Senin, 3 Juni 2025
                </p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p
                  className={`text-lg font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#E6E6E6]" : "text-gray-800"
                  }`}
                >
                  19.20 - 21.00
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-[#BACBD8]" : "text-gray-600"
                  }`}
                >
                  Chat Message
                </p>
              </div>
              <div className="flex justify-end items-center flex-1">
                <button
                  className={`font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 text-[#E6E6E6] hover:bg-gray-800"
                      : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  }`}
                >
                  Kelola
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center pb-6 mb-6">
            <div
              className={`flex flex-col items-center justify-center rounded-lg p-2 w-20 h-20 mr-6 shadow-sm transition-colors duration-300 ${
                isDarkMode ? "bg-[#161F36]" : "bg-white"
              }`}
            >
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#E6E6E6]" : "text-gray-900"
                }`}
              >
                SEN
              </p>
              <p
                className={`text-4xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#161F36]" : "text-gray-900"
                }`}
              >
                10
              </p>
            </div>
            <div
              className={`flex flex-row flex-1 rounded-lg p-4 shadow-sm items-center transition-colors duration-300 ${
                isDarkMode ? "bg-[#161F36]" : "bg-white"
              }`}
            >
              <div className="flex flex-col flex-1">
                <p
                  className={`text-xl font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#E6E6E6]" : "text-gray-900"
                  }`}
                >
                  dr. Sylvia Nuraini, Sp.KJ, M.Psi
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-[#BACBD8]" : "text-gray-600"
                  }`}
                >
                  Senin, 10 Juni 2025
                </p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p
                  className={`text-lg font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#E6E6E6]" : "text-gray-800"
                  }`}
                >
                  13.20 - 15.00
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-[#BACBD8]" : "text-gray-600"
                  }`}
                >
                  Video Call
                </p>
              </div>
              <div className="flex justify-end items-center flex-1">
                <button
                  className={`font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-gray-700 text-[#E6E6E6] hover:bg-gray-800"
                      : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  }`}
                >
                  Kelola
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center p-4 mb-2 mt-8">
        <p
          className={`text-3xl font-semibold text-center transition-colors duration-300 ${
            isDarkMode ? "text-[#E6E6E6]" : "text-gray-800"
          }`}
        >
          Berikut kami pilihkan psikiater pilihan kami
        </p>
      </div>

      <div className="mt-2 ml-6 sm:ml-15">
        <div className="flex justify-center items-center mb-10">
          <div className="w-full" style={{ maxWidth: "1200px" }}>
            <CarouselDemo />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Homepage;
