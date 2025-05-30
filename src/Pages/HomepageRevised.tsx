import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeController } from "../controllers/HomeController";
import { CarouselDemo } from "../components/RecommendedPsychiatrist";
import AppointmentStatusUpdater from "../components/AppointmentStatusUpdater";
import Footer from "../components/Footer";
import send from "../assets/send.svg";
import p1 from "../assets/p1.png";
import p2 from "../assets/p2.png";

const Homepage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Loading...");

  const navigate = useNavigate();
  const controller = new HomeController();

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

  AppointmentStatusUpdater();

  return (
    <div
      className="min-h-screen w-full bg-cover flex flex-col overflow-x-hidden"
      style={{ backgroundColor: `#F2EDE2` }}
    >
      <div className="p-15 text-center pt-20">
        <h1 className="text-6xl font-extrabold text-[#161F36] mb-4 drop-shadow-md">
          Selamat datang, <span className="text-[#ce9d85]">{userName}!</span>
        </h1>
        <p className="text-xl text-[#161F36] font-medium">
          Kami siap membantu perjalanan kesehatan mental Anda.
        </p>
      </div>
      <div className="flex justify-center p-4 my-8 flex-col items-center">
        <h2 className="text-3xl font-semibold mb-4 text-gray-800 w-full max-w-4xl xl:max-w-6xl">
          Pesan yang Belum Dibaca
        </h2>
        <div className="bg-[#E4DCCC] rounded-lg shadow-md p-10 w-full max-w-4xl xl:max-w-6xl mt-4">
          <div className="flex items-center pb-6 mb-6">
            <img
              src={p1}
              alt="Dr. Andika Prasetya"
              className="w-20 h-20 rounded-full mr-6 object-cover"
            />
            <div className="flex-1">
              <p className="text-xl font-semibold text-gray-900">
                dr. Andika Prasetya, Sp.KJ
              </p>
              <p className="text-lg text-[#161F36]">
                Apakah ada yang dapat saya bantu lagi?
              </p>
            </div>
            <button className="flex items-center text-[#161F36] font-bold text-2xl ml-6">
              Pergi
              <img
                src={send}
                alt="Send icon"
                className="h-8 w-8 ml-2 object-contain"
              />
            </button>
          </div>
          <div className="flex items-center mb-4">
            <img
              src={p2}
              alt="Dr. Maria Lestari"
              className="w-20 h-20 rounded-full mr-6 object-cover"
            />
            <div className="flex-1">
              <p className="text-xl font-semibold text-[#161F36]">
                dr. Maria Lestari, Sp.KJ
              </p>
              <p className="text-lg text-[#161F36]">
                Kalau menurut saya, seharusnya kamu tidak...
              </p>
            </div>
            <button className="flex items-center text-[#161F36] font-bold text-2xl ml-6">
              Pergi
              <img
                src={send}
                alt="Send icon"
                className="h-8 w-8 ml-2 object-contain"
              />
            </button>
          </div>
          <div className="text-center text-gray-500 text-lg mt-8">
            Tidak ada pesan belum terbaca lagi...
          </div>
        </div>
      </div>
      <div className="flex justify-center p-4 my-8 flex-col items-center">
        <h2 className="text-3xl font-semibold mb-4 text-[#161F36] w-full max-w-4xl xl:max-w-6xl">
          Pertemuan Mendatang
        </h2>
        <div className="bg-[#E4DCCC] rounded-lg shadow-md p-10 w-full max-w-4xl xl:max-w-6xl mt-4">
          <div className="flex items-center mb-4">
            <div className="flex flex-col items-center justify-center bg-[#F9F1E0] rounded-lg p-2 w-20 h-20 mr-6 shadow-sm">
              <p className="text-sm font-semibold text-[#161F36]">SEN</p>
              <p className="text-4xl font-bold text-gray-900">19</p>
            </div>
            <div className="flex flex-row flex-1 bg-[#F9F1E0] rounded-lg p-4 shadow-sm items-center">
              <div className="flex flex-col flex-1">
                <p className="text-xl font-semibold text-gray-900">
                  dr. Andika Prasetya, Sp.KJ
                </p>
                <p className="text-base text-[#161F36]">Senin, 19 May 2025</p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p className="text-lg font-semibold text-[#161F36]">
                  13.20 - 15.00
                </p>
                <p className="text-base text-[#161F36]">Video Call</p>
              </div>
              <div className="flex justify-end items-center flex-1">
                <button className="text-[#161F36] font-semibold py-3 px-4 text-xl">
                  Bergabung
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center mb-4">
            <div className="flex flex-col items-center justify-center bg-[#F9F1E0] rounded-lg p-2 w-20 h-20 mr-6 shadow-sm">
              <p className="text-sm font-semibold text-[#161F36]">SEN</p>
              <p className="text-4xl font-bold text-[#161F36]">26</p>
            </div>
            <div className="flex flex-row flex-1 bg-[#F9F1E0] rounded-lg p-4 shadow-sm items-center">
              <div className="flex flex-col flex-1">
                <p className="text-xl font-semibold text-[#161F36]">
                  dr. Maria Lestari, Sp.KJ
                </p>
                <p className="text-base text-[#161F36]">Senin, 26 May 2025</p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p className="text-lg font-semibold text-[#161F36]">
                  13.20 - 15.00
                </p>
                <p className="text-base text-[#161F36]">Chat Message</p>
              </div>
              <div className="flex justify-end items-center flex-1">
                <button className="text-[#161F36] font-semibold py-3 px-4 text-xl">
                  Kelola
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center mb-4">
            <div className="flex flex-col items-center justify-center bg-[#F9F1E0] rounded-lg p-2 w-20 h-20 mr-6 shadow-sm">
              <p className="text-sm font-semibold text-[#161F36]">SEN</p>
              <p className="text-4xl font-bold text-gray-900">3</p>
            </div>
            <div className="flex flex-row flex-1 bg-[#F9F1E0] rounded-lg p-4 shadow-sm items-center">
              <div className="flex flex-col flex-1">
                <p className="text-xl font-semibold text-gray-900">
                  dr. Rafi Sandes, Sp.KJ, M.Kes
                </p>
                <p className="text-base text-[#161F36]">Senin, 3 Juni 2025</p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p className="text-lg font-semibold text-[#161F36]">
                  19.20 - 21.00
                </p>
                <p className="text-base text-[#161F36]">Chat Message</p>
              </div>
              <div className="flex justify-end items-center flex-1">
                <button className="text-[#161F36] font-semibold py-3 px-4 text-xl">
                  Kelola
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center mb-4">
            {" "}
            <div className="flex flex-col items-center justify-center bg-[#F9F1E0] rounded-lg p-2 w-20 h-20 mr-6 shadow-sm">
              <p className="text-sm font-semibold text-[#161F36]">SEN</p>
              <p className="text-4xl font-bold text-gray-900">10</p>
            </div>
            <div className="flex flex-row flex-1 bg-[#F9F1E0] rounded-lg p-4 shadow-sm items-center">
              <div className="flex flex-col flex-1">
                <p className="text-xl font-semibold text-gray-900">
                  dr. Sylvia Nuraini, Sp.KJ, M.Psi
                </p>
                <p className="text-base text-[#161F36]">Senin, 10 Juni 2025</p>
              </div>
              <div className="flex flex-col items-center flex-1">
                <p className="text-lg font-semibold text-[#161F36]">
                  13.20 - 15.00
                </p>
                <p className="text-base text-[#161F36]">Video Call</p>
              </div>
              <div className="flex justify-end items-center flex-1">
                <button className=" text-[#161F36] font-semibold py-3 px-4 text-xl">
                  Kelola
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-20 ml-6 sm:ml-15">
        <div className="flex justify-center p-4 mt-8">
          <p className="text-2xl font-semibold text-[#161F36] text-center">
            Berikut kami pilihkan psikiater pilihan kami
          </p>
        </div>
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
