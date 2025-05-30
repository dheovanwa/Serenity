import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeController } from "../controllers/HomeController";
import { CarouselDemo } from "../components/RecommendedPsychiatrist";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater"; // Ini asumsi sebagai komponen React.FC
import Footer from "../components/Footer";
import send from "../assets/send.svg";
import p1 from "../assets/p1.png";
import p2 from "../assets/p2.png";
import Loading from "../components/Loading"; // Import Loading component

interface HomepageProps {
  isDarkMode: boolean;
}

const Homepage: React.FC<HomepageProps> = ({ isDarkMode }) => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [isLoading, setIsLoading] = useState(true); // State untuk mengontrol loading

  const navigate = useNavigate();
  const controller = new HomeController();

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      setIsLoading(true); // Mulai loading saat data diambil
      const documentId = localStorage.getItem("documentId");

      // Cek autentikasi
      const isAuthenticated = await controller.checkAuthentication(documentId);

      if (!isAuthenticated) {
        navigate("/signin"); // Redirect jika tidak terautentikasi
        return; // Hentikan eksekusi lebih lanjut
      }

      // Ambil nama pengguna jika terautentikasi
      const name = await controller.fetchUserName(documentId);
      setUserName(name);
      setIsLoading(false); // Akhiri loading setelah data diambil
    };

    checkAuthAndLoadData();
  }, [navigate]);

  // Tampilkan komponen Loading jika sedang dalam proses loading
  if (isLoading) {
    return <Loading isDarkMode={isDarkMode} />;
  }

  // Komponen AppointmentStatusUpdater (jika itu adalah React Functional Component)
  // harus dipanggil di dalam JSX. Jika itu custom hook, panggil di awal komponen.
  // Berdasarkan importnya, ini adalah komponen.
  return (
    <div
      className="min-h-screen w-full bg-cover flex flex-col overflow-x-hidden
                 bg-[#F2EDE2] dark:bg-[#161F36] transition-colors duration-300"
    >
      <AppointmentStatusUpdater />{" "}
      {/* Pastikan ini adalah komponen React.FC yang di-render */}
      <div className="p-15 text-center pt-20">
        <h1
          className="text-6xl font-extrabold mb-4 drop-shadow-md
                       text-[#161F36] dark:text-white"
        >
          Selamat datang,{" "}
          <span className="text-[#ce9d85] dark:text-blue-300">{userName}!</span>
        </h1>
        <p className="text-xl font-medium text-[#161F36] dark:text-gray-300">
          Kami siap membantu perjalanan kesehatan mental Anda.
        </p>
      </div>
      {/* Pesan yang Belum Dibaca Section */}
      <div className="flex justify-center p-4 my-8 flex-col items-center">
        <h2
          className="text-3xl font-semibold mb-4 w-full max-w-4xl xl:max-w-6xl
                       text-gray-800 dark:text-white"
        >
          Pesan yang Belum Dibaca
        </h2>
        <div
          className="rounded-lg shadow-md p-10 w-full max-w-4xl xl:max-w-6xl mt-4
                        bg-[#E4DCCC] dark:bg-gray-800"
        >
          {/* Message 1 */}
          <div className="flex items-center pb-6 mb-6 border-b border-gray-300 dark:border-gray-600">
            <img
              src={p1}
              alt="Dr. Andika Prasetya"
              className="w-20 h-20 rounded-full mr-6 object-cover"
            />
            <div className="flex-1">
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                dr. Andika Prasetya, Sp.KJ
              </p>
              <p className="text-lg text-[#161F36] dark:text-gray-300">
                Apakah ada yang dapat saya bantu lagi?
              </p>
            </div>
            <button
              className="flex items-center font-bold text-2xl ml-6
                               text-[#161F36] dark:text-blue-400"
            >
              Pergi
              <img
                src={send}
                alt="Send icon"
                className="h-8 w-8 ml-2 object-contain dark:filter dark:invert"
              />
            </button>
          </div>
          {/* Message 2 */}
          <div className="flex items-center mb-4">
            <img
              src={p2}
              alt="Dr. Maria Lestari"
              className="w-20 h-20 rounded-full mr-6 object-cover"
            />
            <div className="flex-1">
              <p className="text-xl font-semibold text-[#161F36] dark:text-white">
                dr. Maria Lestari, Sp.KJ
              </p>
              <p className="text-lg text-[#161F36] dark:text-gray-300">
                Kalau menurut saya, seharusnya kamu tidak...
              </p>
            </div>
            <button
              className="flex items-center font-bold text-2xl ml-6
                               text-[#161F36] dark:text-blue-400"
            >
              Pergi
              <img
                src={send}
                alt="Send icon"
                className="h-8 w-8 ml-2 object-contain dark:filter dark:invert"
              />
            </button>
          </div>
          <div className="text-center text-gray-500 text-lg mt-8 dark:text-gray-400">
            Tidak ada pesan belum terbaca lagi...
          </div>
        </div>
      </div>
      {/* Pertemuan Mendatang Section */}
      <div className="flex justify-center p-4 my-8 flex-col items-center">
        <h2
          className="text-3xl font-semibold mb-4 w-full max-w-4xl xl:max-w-6xl
                       text-[#161F36] dark:text-white"
        >
          Pertemuan Mendatang
        </h2>
        <div
          className="rounded-lg shadow-md p-10 w-full max-w-4xl xl:max-w-6xl mt-4
                        bg-[#E4DCCC] dark:bg-gray-800"
        >
          {/* Appointment 1 */}
          <div className="flex items-center mb-4">
            <div
              className="flex flex-col items-center justify-center rounded-lg p-2 w-20 h-20 mr-6 shadow-sm
                            bg-[#F9F1E0] dark:bg-gray-700"
            >
              <p className="text-sm font-semibold text-[#161F36] dark:text-white">
                SEN
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                19
              </p>
            </div>
            <div
              className="flex flex-row flex-1 rounded-lg p-4 shadow-sm items-center
                            bg-[#F9F1E0] dark:bg-gray-700"
            >
              <div className="flex flex-col flex-1">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  dr. Andika Prasetya, Sp.KJ
                </p>
                <p className="text-base text-[#161F36] dark:text-gray-300">
                  Senin, 19 May 2025
                </p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p className="text-lg font-semibold text-[#161F36] dark:text-white">
                  13.20 - 15.00
                </p>
                <p className="text-base text-[#161F36] dark:text-gray-300">
                  Video Call
                </p>
              </div>
              <div className="flex justify-end items-center flex-1">
                <button
                  className="font-semibold py-3 px-4 text-xl
                                   text-[#161F36] dark:text-blue-400"
                >
                  Bergabung
                </button>
              </div>
            </div>
          </div>
          {/* Appointment 2 */}
          <div className="flex items-center mb-4">
            <div
              className="flex flex-col items-center justify-center rounded-lg p-2 w-20 h-20 mr-6 shadow-sm
                            bg-[#F9F1E0] dark:bg-gray-700"
            >
              <p className="text-sm font-semibold text-[#161F36] dark:text-white">
                SEN
              </p>
              <p className="text-4xl font-bold text-[#161F36] dark:text-white">
                26
              </p>
            </div>
            <div
              className="flex flex-row flex-1 rounded-lg p-4 shadow-sm items-center
                            bg-[#F9F1E0] dark:bg-gray-700"
            >
              <div className="flex flex-col flex-1">
                <p className="text-xl font-semibold text-[#161F36] dark:text-white">
                  dr. Maria Lestari, Sp.KJ
                </p>
                <p className="text-base text-[#161F36] dark:text-gray-300">
                  Senin, 26 May 2025
                </p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p className="text-lg font-semibold text-[#161F36] dark:text-white">
                  13.20 - 15.00
                </p>
                <p className="text-base text-[#161F36] dark:text-gray-300">
                  Chat Message
                </p>
              </div>
              <div className="flex justify-end items-center flex-1">
                <button
                  className="font-semibold py-3 px-4 text-xl
                                   text-[#161F36] dark:text-blue-400"
                >
                  Kelola
                </button>
              </div>
            </div>
          </div>
          {/* Appointment 3 */}
          <div className="flex items-center mb-4">
            <div
              className="flex flex-col items-center justify-center rounded-lg p-2 w-20 h-20 mr-6 shadow-sm
                            bg-[#F9F1E0] dark:bg-gray-700"
            >
              <p className="text-sm font-semibold text-[#161F36] dark:text-white">
                SEN
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                3
              </p>
            </div>
            <div
              className="flex flex-row flex-1 rounded-lg p-4 shadow-sm items-center
                            bg-[#F9F1E0] dark:bg-gray-700"
            >
              <div className="flex flex-col flex-1">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  dr. Rafi Sandes, Sp.KJ, M.Kes
                </p>
                <p className="text-base text-[#161F36] dark:text-gray-300">
                  Senin, 3 Juni 2025
                </p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p className="text-lg font-semibold text-[#161F36] dark:text-white">
                  19.20 - 21.00
                </p>
                <p className="text-base text-[#161F36] dark:text-gray-300">
                  Chat Message
                </p>
              </div>
              <div className="flex justify-end items-center flex-1">
                <button
                  className="font-semibold py-3 px-4 text-xl
                                   text-[#161F36] dark:text-blue-400"
                >
                  Kelola
                </button>
              </div>
            </div>
          </div>
          {/* Appointment 4 */}
          <div className="flex items-center mb-4">
            <div
              className="flex flex-col items-center justify-center rounded-lg p-2 w-20 h-20 mr-6 shadow-sm
                            bg-[#F9F1E0] dark:bg-gray-700"
            >
              <p className="text-sm font-semibold text-[#161F36] dark:text-white">
                SEN
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                10
              </p>
            </div>
            <div
              className="flex flex-row flex-1 rounded-lg p-4 shadow-sm items-center
                            bg-[#F9F1E0] dark:bg-gray-700"
            >
              <div className="flex flex-col flex-1">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  dr. Sylvia Nuraini, Sp.KJ, M.Psi
                </p>
                <p className="text-base text-[#161F36] dark:text-gray-300">
                  Senin, 10 Juni 2025
                </p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p className="text-lg font-semibold text-[#161F36] dark:text-white">
                  13.20 - 15.00
                </p>
                <p className="text-base text-[#161F36] dark:text-gray-300">
                  Video Call
                </p>
              </div>
              <div className="flex justify-end items-center flex-1">
                <button
                  className="font-semibold py-3 px-4 text-xl
                                   text-[#161F36] dark:text-blue-400"
                >
                  Kelola
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Recommended Psychiatrist Section */}
      <div className="mt-20 ml-6 sm:ml-15">
        <div className="flex justify-center p-4 mt-8">
          <p className="text-2xl font-semibold text-[#161F36] text-center dark:text-white">
            Berikut kami pilihkan psikiater pilihan kami
          </p>
        </div>
        <div className="flex justify-center items-center mb-10">
          <div className="w-full" style={{ maxWidth: "1200px" }}>
            <CarouselDemo isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
};

export default Homepage;
