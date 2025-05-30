import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeController } from "../controllers/HomeController";
import { CarouselDemo } from "../components/RecommendedPsychiatrist";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater";
import Footer from "../components/Footer";
import send from "../assets/send.svg"; // Import SVG sebagai path
import p1 from "../assets/p1.png"; // Import gambar profil
import p2 from "../assets/p2.png"; // Import gambar profil
import NavBar from "../components/NavBar"; // Import NavBar

const Homepage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Loading...");
  // State untuk dark mode, diinisialisasi dari localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  const navigate = useNavigate();
  const controller = new HomeController();

  // Fungsi untuk mengubah tema
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

  // Efek untuk menerapkan kelas 'dark' pada elemen <html>
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
      // Menggunakan kelas dark:bg untuk latar belakang utama
      className={`min-h-screen w-full bg-cover flex flex-col overflow-x-hidden transition-colors duration-300 ${
        isDarkMode ? "bg-[#161F36]" : "bg-[#F2EDE2]"
      }`}
    >
      {/* NavBar diaktifkan dan diteruskan props isDarkMode dan toggleTheme */}
      <NavBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      {/* Bagian Selamat Datang */}
      <div
        // Menggunakan kelas dark:bg dan dark:text
        className={`p-15 text-center transition-colors duration-300 ${
          isDarkMode ? "bg-[#161F36] text-[#E6E6E6]" : "bg-white text-gray-800"
        }`}
      >
        <p className="text-6xl font-semibold">Selamat datang, {userName}</p>
      </div>

      {/* Bagian Pesan yang Belum Dibaca */}
      <div className="flex justify-center p-4 my-8 flex-col items-center">
        {/* Judul dipindahkan ke luar container pesan */}
        <h2
          className={`text-3xl font-semibold mb-4 w-full max-w-4xl xl:max-w-6xl transition-colors duration-300 ${
            isDarkMode ? "text-[#E6E6E6]" : "text-gray-800"
          }`}
        >
          Pesan yang Belum Dibaca
        </h2>
        <div
          // Menggunakan kelas dark:bg
          className={`rounded-lg shadow-md p-10 w-full max-w-4xl xl:max-w-6xl mt-4 transition-colors duration-300 ${
            isDarkMode ? "bg-[#BACBD8]" : "bg-[#E4DCCC]"
          }`}
        >
          {/* Message 1 */}
          <div className="flex items-center pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            <img
              src={p1} // Menggunakan gambar p1 yang diimpor
              alt="Dr. Andika Prasetya"
              className="w-20 h-20 rounded-full mr-6 object-cover"
            />
            <div className="flex-1">
              <p
                className={`text-xl font-semibold transition-colors duration-300 ${
                  isDarkMode ? "text-[#161F36]" : "text-gray-900"
                }`}
              >
                dr. Andika Prasetya, Sp.KJ
              </p>
              <p
                className={`text-lg transition-colors duration-300 ${
                  isDarkMode ? "text-gray-700" : "text-gray-600"
                }`}
              >
                Apakah ada yang dapat saya bantu lagi?
              </p>
            </div>
            <button
              className={`flex items-center font-medium text-lg ml-6 transition-colors duration-300 ${
                isDarkMode ? "text-[#161F36]" : "text-blue-600"
              }`}
            >
              Pergi
              {/* Menggunakan <img> untuk SVG dengan src={send} */}
              <img
                src={send} // Menggunakan SVG yang diimpor
                alt="Send icon"
                className="h-8 w-8 ml-2 object-contain"
              />
            </button>
          </div>

          {/* Message 2 */}
          <div className="flex items-center pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            <img
              src={p2} // Menggunakan gambar p2 yang diimpor
              alt="Dr. Maria Lestari"
              className="w-20 h-20 rounded-full mr-6 object-cover"
            />
            <div className="flex-1">
              <p
                className={`text-xl font-semibold transition-colors duration-300 ${
                  isDarkMode ? "text-[#161F36]" : "text-gray-900"
                }`}
              >
                dr. Maria Lestari, Sp.KJ
              </p>
              <p
                className={`text-lg transition-colors duration-300 ${
                  isDarkMode ? "text-gray-700" : "text-gray-600"
                }`}
              >
                Kalau menurut saya, seharusnya kamu tidak...
              </p>
            </div>
            <button
              className={`flex items-center font-medium text-lg ml-6 transition-colors duration-300 ${
                isDarkMode ? "text-[#161F36]" : "text-blue-600"
              }`}
            >
              Pergi
              {/* Menggunakan <img> untuk SVG dengan src={send} */}
              <img
                src={send} // Menggunakan SVG yang diimpor
                alt="Send icon"
                className="h-8 w-8 ml-2 object-contain"
              />
            </button>
          </div>

          {/* Tidak ada pesan belum terbaca */}
          <div
            className={`text-center text-lg mt-8 transition-colors duration-300 ${
              isDarkMode ? "text-gray-700" : "text-gray-500"
            }`}
          >
            Tidak ada pesan belum terbaca lagi...
          </div>
        </div>
      </div>

      {/* Bagian Pertemuan Mendatang */}
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
            isDarkMode ? "bg-[#BACBD8]" : "bg-[#E4DCCC]"
          }`}
        >
          {/* Appointment 1 */}
          <div className="flex items-center pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            {/* Kiri: Kotak Tanggal */}
            <div
              className={`flex flex-col items-center justify-center rounded-lg p-2 w-20 h-20 mr-6 shadow-sm transition-colors duration-300 ${
                isDarkMode ? "bg-[#E6E6E6]" : "bg-white"
              }`}
            >
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#161F36]" : "text-gray-900"
                }`}
              >
                SEN
              </p>
              <p
                className={`text-4xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#161F36]" : "text-gray-900"
                }`}
              >
                19
              </p>
            </div>
            {/* Kanan: Kotak Besar untuk Detail & Tombol (diatur sebagai flex-row) */}
            <div
              className={`flex flex-row flex-1 rounded-lg p-4 shadow-sm items-center transition-colors duration-300 ${
                isDarkMode ? "bg-[#E6E6E6]" : "bg-white"
              }`}
            >
              {/* Kiri dari kotak besar: Nama Psikiater & Tanggal */}
              <div className="flex flex-col flex-1">
                <p
                  className={`text-xl font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#161F36]" : "text-gray-900"
                  }`}
                >
                  dr. Andika Prasetya, Sp.KJ
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-gray-700" : "text-gray-600"
                  }`}
                >
                  Senin, 19 May 2025
                </p>
              </div>
              {/* Tengah dari kotak besar: Jam & Metode Konsultasi */}
              <div className="flex flex-col items-center flex-1">
                <p
                  className={`text-lg font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#161F36]" : "text-gray-800"
                  }`}
                >
                  13.20 - 15.00
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-gray-700" : "text-gray-600"
                  }`}
                >
                  Video Call
                </p>
              </div>
              {/* Kanan dari kotak besar: Tombol */}
              <div className="flex justify-end items-center flex-1">
                <button
                  className={`font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#161F36] text-[#E6E6E6] hover:bg-[#0f1525]"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Bergabung
                </button>
              </div>
            </div>
          </div>

          {/* Appointment 2 */}
          <div className="flex items-center pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            {/* Kiri: Kotak Tanggal */}
            <div
              className={`flex flex-col items-center justify-center rounded-lg p-2 w-20 h-20 mr-6 shadow-sm transition-colors duration-300 ${
                isDarkMode ? "bg-[#E6E6E6]" : "bg-white"
              }`}
            >
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#161F36]" : "text-gray-900"
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
            {/* Kanan: Kotak Besar untuk Detail & Tombol */}
            <div
              className={`flex flex-row flex-1 rounded-lg p-4 shadow-sm items-center transition-colors duration-300 ${
                isDarkMode ? "bg-[#E6E6E6]" : "bg-white"
              }`}
            >
              {/* Kiri dari kotak besar: Nama Psikiater & Tanggal */}
              <div className="flex flex-col flex-1">
                <p
                  className={`text-xl font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#161F36]" : "text-gray-900"
                  }`}
                >
                  dr. Maria Lestari, Sp.KJ
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-gray-700" : "text-gray-600"
                  }`}
                >
                  Senin, 26 May 2025
                </p>
              </div>
              {/* Tengah dari kotak besar: Jam & Metode Konsultasi */}
              <div className="flex flex-col items-center flex-1">
                <p
                  className={`text-lg font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#161F36]" : "text-gray-800"
                  }`}
                >
                  13.20 - 15.00
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-gray-700" : "text-gray-600"
                  }`}
                >
                  Chat Message
                </p>
              </div>
              {/* Kanan dari kotak besar: Tombol */}
              <div className="flex justify-end items-center flex-1">
                <button
                  className={`font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#161F36] text-[#E6E6E6] hover:bg-[#0f1525]"
                      : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  }`}
                >
                  Kelola
                </button>
              </div>
            </div>
          </div>

          {/* Appointment 3 */}
          <div className="flex items-center pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
            {/* Kiri: Kotak Tanggal */}
            <div
              className={`flex flex-col items-center justify-center rounded-lg p-2 w-20 h-20 mr-6 shadow-sm transition-colors duration-300 ${
                isDarkMode ? "bg-[#E6E6E6]" : "bg-white"
              }`}
            >
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#161F36]" : "text-gray-900"
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
            {/* Kanan: Kotak Besar untuk Detail & Tombol */}
            <div
              className={`flex flex-row flex-1 rounded-lg p-4 shadow-sm items-center transition-colors duration-300 ${
                isDarkMode ? "bg-[#E6E6E6]" : "bg-white"
              }`}
            >
              {/* Kiri dari kotak besar: Nama Psikiater & Tanggal */}
              <div className="flex flex-col flex-1">
                <p
                  className={`text-xl font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#161F36]" : "text-gray-900"
                  }`}
                >
                  dr. Rafi Sandes, Sp.KJ, M.Kes
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-gray-700" : "text-gray-600"
                  }`}
                >
                  Senin, 3 Juni 2025
                </p>
              </div>
              {/* Tengah dari kotak besar: Jam & Metode Konsultasi */}
              <div className="flex flex-col items-center flex-1">
                <p
                  className={`text-lg font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#161F36]" : "text-gray-800"
                  }`}
                >
                  19.20 - 21.00
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-gray-700" : "text-gray-600"
                  }`}
                >
                  Chat Message
                </p>
              </div>
              {/* Kanan dari kotak besar: Tombol */}
              <div className="flex justify-end items-center flex-1">
                <button
                  className={`font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#161F36] text-[#E6E6E6] hover:bg-[#0f1525]"
                      : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                  }`}
                >
                  Kelola
                </button>
              </div>
            </div>
          </div>

          {/* Appointment 4 */}
          <div className="flex items-center pb-6 mb-6">
            {/* Kiri: Kotak Tanggal */}
            <div
              className={`flex flex-col items-center justify-center rounded-lg p-2 w-20 h-20 mr-6 shadow-sm transition-colors duration-300 ${
                isDarkMode ? "bg-[#E6E6E6]" : "bg-white"
              }`}
            >
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-[#161F36]" : "text-gray-900"
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
            {/* Kanan: Kotak Besar untuk Detail & Tombol */}
            <div
              className={`flex flex-row flex-1 rounded-lg p-4 shadow-sm items-center transition-colors duration-300 ${
                isDarkMode ? "bg-[#E6E6E6]" : "bg-white"
              }`}
            >
              {/* Kiri dari kotak besar: Nama Psikiater & Tanggal */}
              <div className="flex flex-col flex-1">
                <p
                  className={`text-xl font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#161F36]" : "text-gray-900"
                  }`}
                >
                  dr. Sylvia Nuraini, Sp.KJ, M.Psi
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-gray-700" : "text-gray-600"
                  }`}
                >
                  Senin, 10 Juni 2025
                </p>
              </div>
              {/* Tengah dari kotak besar: Jam & Metode Konsultasi */}
              <div className="flex flex-col items-center flex-1">
                <p
                  className={`text-lg font-semibold transition-colors duration-300 ${
                    isDarkMode ? "text-[#161F36]" : "text-gray-800"
                  }`}
                >
                  13.20 - 15.00
                </p>
                <p
                  className={`text-base transition-colors duration-300 ${
                    isDarkMode ? "text-gray-700" : "text-gray-600"
                  }`}
                >
                  Video Call
                </p>
              </div>
              {/* Kanan dari kotak besar: Tombol */}
              <div className="flex justify-end items-center flex-1">
                <button
                  className={`font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 ${
                    isDarkMode
                      ? "bg-[#161F36] text-[#E6E6E6] hover:bg-[#0f1525]"
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

      {/* Teks "Berikut kami pilihkan psikiater pilihan kami" */}
      <div className="flex justify-center p-4 mb-2 mt-8">
        {" "}
        {/* Adjusted mt-30 to mt-8 for better spacing */}
        <p
          className={`text-3xl font-semibold text-center transition-colors duration-300 ${
            isDarkMode ? "text-[#E6E6E6]" : "text-gray-800"
          }`}
        >
          Berikut kami pilihkan psikiater pilihan kami
        </p>
      </div>

      {/* Recommended Psychiatrists */}
      <div className="mt-2 ml-6 sm:ml-15">
        {" "}
        {/* Adjusted mt-2 for better spacing */}
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
