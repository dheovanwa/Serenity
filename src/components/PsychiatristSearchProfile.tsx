import React from "react";
import starIcon from "../assets/star.png";

interface PsychiatristProps {
  name: string;
  specialty: string;
  price: string;
  rating: number;
  sessions: number;
  image: string;
}

const PsychiatristSearchProfile: React.FC<PsychiatristProps> = ({
  name,
  specialty,
  price,
  rating,
  sessions,
  image,
}) => {
  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-xl hover:shadow-lg hover:border-2 hover:border-[#187DA8] transition-all duration-300 focus:outline-none">
      <img
        src={image}
        alt={name}
        className="w-full h-auto max-w-[213px] max-h- rounded-lg object-cover"
      />
      <h3 className="text-xl font-semibold text-black mt-2">{name}</h3>
      <p className="text-sm text-black">{specialty}</p>
      <div className="flex items-center space-x-2 mt-2">
        <p className="text-lg font-semibold">{price}</p>
        <p className="text-lg font-semibold">/</p>
        <p className="text-lg font-semibold">{sessions} sessions</p>
      </div>
      <div className="flex mt-2">
        {Array.from({ length: rating }).map((_, i) => (
          <img key={i} src={starIcon} alt="Star" />
        ))}
      </div>
      <button className="mt-4 bg-[#187DA8] text-white font-semibold rounded-[10px] py-2 px-4 hover:bg-[#155D8A] transition-all duration-300">
        Make Appointment
      </button>
    </div>
  );
};

export default PsychiatristSearchProfile;
