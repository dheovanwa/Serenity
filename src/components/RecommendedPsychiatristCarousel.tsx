import * as React from "react";
import psychiatristPhoto from "../assets/psychiatristPhoto.png";

export function RecommendedPsychiatrists() {
  const psychiatrists = [
    {
      name: "Titin Sulaiman",
      job: "Anxiety & Depression Specialist",
      image: psychiatristPhoto,
    },
    {
      name: "John Doe",
      job: "Mental Health Specialist",
      image: psychiatristPhoto,
    },
    {
      name: "Jane Smith",
      job: "Therapist",
      image: psychiatristPhoto,
    },
    {
      name: "Titin Sulaiman",
      job: "Anxiety & Depression Specialist",
      image: psychiatristPhoto,
    },
    {
      name: "John Doe",
      job: "Mental Health Specialist",
      image: psychiatristPhoto,
    },
    {
      name: "Jane Smith",
      job: "Therapist",
      image: psychiatristPhoto,
    },
  ];

  return (
    <div className="w-full max-w-screen-lg mx-auto">
      <div className="flex overflow-x-auto gap-4">
        {psychiatrists.map((psychiatrist, index) => (
          <div
            key={index}
            className="w-64 h-96 bg-white rounded-lg shadow-lg p-4 flex-shrink-0"
          >
            <img
              src={psychiatrist.image}
              alt={psychiatrist.name}
              className="w-32 h-32 rounded-full object-cover mb-4 mx-auto"
            />
            <h2 className="text-xl font-semibold text-center mb-2">
              {psychiatrist.name}
            </h2>
            <p className="text-sm text-center text-gray-500">
              {psychiatrist.job}
            </p>
            <div className="text-center mt-4">
              <button className="p-2 bg-blue-500 text-white rounded-full">
                <span className="sr-only">View Profile</span> 🔍
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
