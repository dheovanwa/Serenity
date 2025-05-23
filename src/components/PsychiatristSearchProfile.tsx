import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import starIcon from "../assets/star.svg";
import briefcase from "../assets/briefcase.svg";

interface PsychiatristProps {
  id?: string;
  name: string;
  specialty: string;
  price: number;
  rating: number;
  tahunPengalaman: number;
  jadwal: {
    [key: string]: { start: number; end: number } | null;
  };
  image: string;
}

const PsychiatristSearchProfile: React.FC<PsychiatristProps> = ({
  id,
  name,
  specialty,
  price,
  rating,
  tahunPengalaman,
  jadwal = {}, // Add default empty object
  image,
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
      if (jadwal[days[checkDay]] !== null) {
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
    <div className="flex flex-col items-center bg-[#F8F0E0] p-4 rounded-lg shadow-xl hover:shadow-lg hover:bg-[#E4DCCC] hover:border-2 transition-all duration-300 focus:outline-none">
      <img
        src={image}
        alt={name}
        className="w-full h-auto max-w-[213px] max-h- rounded-lg object-cover"
      />
      <h3 className="text-xl font-semibold text-[#161F36] mt-2">{name} </h3>
      <p className="text-sm text-[#161F36] opacity-70">{specialty}</p>
      <div className="grid grid-cols-2 gap-5 justify-center pl-12">
        <div className="flex mt-2 bg-[#BACBD8] rounded-md justify-start w-27 pl-2 pt-1">
          <img src={briefcase} alt="icon" className="w-4 h-4 mr-2 mt-0.5" />
          <span> {tahunPengalaman} Tahun</span>
        </div>
        <div className="flex mt-2 bg-[#BACBD8] rounded-md justify-center items-center w-13">
          {Array.from({ length: 1 }).map((_, index) => (
            <img
              key={index}
              src={starIcon}
              alt="star"
              className={`${
                index < rating ? "text-[#161F36]" : "text-gray-400"
              } w-4 h-4 mb-0.5`}
            />
          ))}
          <span className="ml-2 text-[#161F36]">{rating}</span>
        </div>
      </div>

      <div className="flex items-center mt-5">
        <p className="text-base text-[#161F36] font-semibold">
          {`Rp${price.toLocaleString("id-ID")}`}
        </p>
      </div>

      <button
        onClick={handleMakeAppointment}
        className={`mt-1 py-2 px-4 font-semibold w-[140px] rounded-[10px] transition-all duration-100 ${
          buttonClicked
            ? "bg-[#E6E6E6] text-white"
            : "bg-[#187DA8] text-white hover:bg-[#155D8A]"
        }`}
      >
        Detail
      </button>

      {isNotAvailableToday && (
        <p className="text-xs text-red-500 mt-1">
          {`Tidak tersedia untuk hari ini, tersedia lagi ${nextAvailableDay} 09:00-16:00`}
        </p>
      )}
    </div>
  );
};

export default PsychiatristSearchProfile;
