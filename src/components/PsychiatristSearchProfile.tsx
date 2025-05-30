import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import starIcon from "../assets/star.svg";
import briefcase from "../assets/briefcase.svg";

interface PsychiatristProps {
  id: string;
  name: string;
  specialty: string;
  price: number;
  rating: number;
  tahunPengalaman: number;
  jadwal: {
    [key: string]: { start: number; end: number } | null;
  };
  image: string;
  isDarkMode: boolean;
}

const PsychiatristSearchProfile: React.FC<PsychiatristProps> = ({
  id,
  name,
  specialty,
  price,
  rating,
  tahunPengalaman,
  jadwal = {},
  image,
  isDarkMode,
}) => {
  const navigate = useNavigate();
  const [buttonClicked, setButtonClicked] = useState(false);

  const getDayName = (date: Date): string => {
    const days = [
      "minggu",
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
    ];
    return days[date.getDay()];
  };

  const getNextAvailableDay = (): string => {
    const today = new Date();
    let currentDay = today.getDay();
    const days = [
      "minggu",
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
    ];

    for (let i = 0; i < 7; i++) {
      const checkDay = (currentDay + i) % 7;
      if (
        jadwal[days[checkDay]] !== null &&
        jadwal[days[checkDay]] !== undefined
      ) {
        return days[checkDay];
      }
    }
    return days[currentDay];
  };

  const today = getDayName(new Date());
  const nextAvailableDay = getNextAvailableDay();
  const isNotAvailableToday =
    !jadwal || !jadwal[today] || jadwal[today] === null;

  const handleMakeAppointment = () => {
    setButtonClicked(true);
    navigate(`/schedule-appointment/${id}`);
  };

  return (
    <div
      className="flex flex-col items-center p-4 rounded-lg shadow-xl
                 transition-all duration-300 focus:outline-none pt-10 pb-10
                 bg-[#F8F0E0] hover:bg-[#E4DCCC]
                 border-2 border-gray-300 hover:border-gray-400 transform-gpu
                 dark:bg-gray-800 dark:shadow-md dark:hover:bg-gray-700 dark:hover:border-gray-500
                 max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-[320px] w-full"
    >
      <img
        src={image ? image : "https://via.placeholder.com/213"}
        alt={name}
        className="w-full h-auto max-w-[213px] rounded-lg object-cover"
      />
      <h3 className="text-xl font-semibold text-[#161F36] mt-2 dark:text-white">
        {name}{" "}
      </h3>
      <p className="text-sm text-[#161F36] opacity-70 dark:text-gray-300">
        {specialty}
      </p>
      {/* Container flexbox untuk Tahun Pengalaman dan Rating */}
      <div className="flex justify-center items-center space-x-5 mt-2 w-full px-2">
        {" "}
        {/* PERUBAHAN DI SINI: space-x-px */}
        {/* Tahun Pengalaman */}
        <div
          className="inline-flex rounded-md justify-center items-center py-1 px-3
                       bg-[#BACBD8] dark:bg-gray-700 dark:text-white"
        >
          <img
            src={briefcase}
            alt="icon"
            className="w-4 h-4 mr-1 dark:filter dark:invert"
          />
          <span className="text-sm"> {tahunPengalaman} Tahun</span>
        </div>
        {/* Rating */}
        <div
          className="inline-flex rounded-md justify-center items-center py-1 px-3
                       bg-[#BACBD8] dark:bg-gray-700 dark:text-white"
        >
          {Array.from({ length: 1 }).map((_, index) => (
            <img
              key={index}
              src={starIcon}
              alt="star"
              className={`w-4 h-4 mr-1 dark:filter dark:invert ${
                index < rating
                  ? "text-[#161F36] dark:text-yellow-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            />
          ))}
          <span className="ml-1 text-sm text-[#161F36] dark:text-white">
            {rating}
          </span>
        </div>
      </div>

      <div className="flex items-center mt-5">
        <p className="text-base text-[#161F36] font-semibold dark:text-white">{`Rp${price}`}</p>
      </div>

      <button
        onClick={handleMakeAppointment}
        className={`mt-1 py-2 px-4 font-semibold w-[140px] rounded-[10px] transition-all duration-100
                   ${
                     buttonClicked
                       ? "bg-[#E6E6E6] text-black dark:bg-gray-600 dark:text-[#161F36]"
                       : "bg-[#187DA8] text-white dark:text-[#161F36] hover:bg-[#155D8A] dark:bg-[#BACBD8] dark:hover:bg-[#556281]"
                   }`}
      >
        Detail
      </button>

      {isNotAvailableToday && (
        <p className="text-xs text-red-500 mt-1 w-full px-2 text-center leading-tight">
          {`Tidak tersedia untuk hari ini, tersedia lagi ${nextAvailableDay} 09:00-16:00`}
        </p>
      )}
    </div>
  );
};

export default PsychiatristSearchProfile;
