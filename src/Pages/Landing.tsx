import React from "react";
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
const MentalHealthPage: React.FC = () => {
     const navigate = useNavigate();  // Initialize useNavigate hook

  // Function to handle button click for navigation
  const handleNavigate = (path: string) => {
    navigate(path);  // Navigate to the provided path
  };
  return (
    <div className="bg-[#f0eadf] min-h-screen flex flex-col">
      {/* Main content */}
      <div className="px-4 mt-30 ml-10 flex items-start justify-start gap-8 xl:mt-40 xl:ml-30 lg:mt-40 lg:ml-20 md:mt-30 md:ml-10 sm:mt-30 sm:ml-10">
        <section className=" ">
          <h1 className="text-[#1a1a1a] font-semibold text-4xl leading-tight mb-2">
            Perjalanan Anda Menuju Kesehatan Mental
            <br />
            yang Lebih Baik Dimulai di Sini
          </h1>
          <p className="text-[#4a4a4a] text-xl mb-10">
            Wawasan pribadi, dukungan waktu nyata, <br />
            dan alat canggih untuk kesejahteraan mental Anda.
          </p>
          <div className="flex items-center space-x-4">
            <button className="text-[#1a1a1a] bg-[#a9bbca] text-xs md:text-sm font-normal rounded-full px-4 py-1"
            onClick={() => handleNavigate('/manage-appointment')}
            >
              Buat Janji Temu
            </button>
            <button className="text-[#1a1a1a] text-xs md:text-sm font-normal rounded-full border border-[#1a1a1a] px-4 py-1"
            onClick={() => handleNavigate('/dashboard')}
            >
              Lihat Lebih Lanjut
            </button>
          </div>
        </section>
      </div>

      {/* Cards */}
      <section className="max-w-[2200px] mx-auto px-4 mt-12 flex flex-col sm:flex-row md:justify-center sm:gap-12 gap-8 mb-12">
        <article className="bg-[#ffe6cc] rounded-3xl p-10 md:max-w-[380px] md:flex-1 flex-shrink-0">
          <h2 className="text-black font-semibold text-xl mb-3">KECEMASAN</h2>
          <p className="text-black font-regular text-sm leading-relaxed">
            Rasa cemas berlebihan bisa mengganggu aktivitas harian. 

          </p>
          <img src={dep3} alt="depresi" />
        </article>
         <article className="bg-[#ffe6cc] rounded-3xl p-10 md:max-w-[380px] md:flex-1 flex-shrink-0">
          <h2 className="text-black font-semibold text-xl mb-3">PTSD</h2>
          <p className="text-black font-regular text-sm leading-relaxed">
            Trauma masa lalu sering membekas dan memengaruhi kehidupan sekarang.
          </p>
          <img src={dep4} alt="depresi" />
        </article>
        <article className="bg-[#9bd9ff] rounded-3xl p-10 md:max-w-[380px] md:flex-1 flex-shrink-0">
          <h2 className="text-black font-semibold text-xl mb-3">DEPRESI</h2>
          <p className="text-black font-regular text-sm leading-relaxed">
            Merasa kosong, lelah, atau tidak bersemangat setiap hari? Anda tidak sendirian.
          </p>
          <img src={dep2} alt="depre" className="md:max-w-[290px] "/>
        </article>

        <article className="bg-[#ffe6cc] rounded-3xl p-10 md:max-w-[380px] md:flex-1 flex-shrink-0">
          <h2 className="text-black font-semibold text-xl mb-3">Stres dan Tekanan Hidup</h2>
          <p className="text-black font-regular text-sm leading-relaxed">
            Tuntutan pekerjaan, keluarga, atau kehidupan bisa menumpuk jadi beban mental.
          </p>
          <img src={dep1} alt="dep" className=""/>
        </article>
      </section>

      {/* Footer */}
      <footer className="text-center text-[#4a4a4a] text-[10px] pb-4 select-none">
        @ 2024 · 2025 Mental Health J&D Sp so.co
      </footer>
    </div>
  );
};

export default MentalHealthPage;
