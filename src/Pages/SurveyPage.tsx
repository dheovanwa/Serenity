import { useState } from "react";
// import { Button } from "../components/Button";
import AuthLayout from "../components/BackgroundLayout";
import { Link } from "react-router-dom";

const questions = [
  {
    text: "What kind of emotions do you experience upon waking up during the day?",
    options: [
      "Energized and refreshed",
      "Neutral, neither too tired nor too refreshed",
      "Slightly tired and lacking energy",
      "Very tired and struggling to wake up",
    ],
  },
  {
    text: "What are your typical methods for managing stressful encounters that arise during your life?",
    options: [
      "I stay calm and quickly find solutions",
      "I feel a little overwhelmed but can manage it",
      "I often feel pressured and find it hard to think clearly",
      "I panic and struggle to handle stress properly",
    ],
  },
  {
    text: "How often do you interact with friends, family, or colleagues in person in the past week? often do you get enough sleep?",
    options: [
      "Almost every day",
      "Some A few times a week",
      "Most Only once a week",
      "Not at all",
    ],
  },
  {
    text: "When you feel sad or stressed, what do you usually do?",
    options: [
      "Talk to someone I trust",
      "Engage in enjoyable or relaxing activities",
      "Isolate myself and avoid others",
      "I don’t know what to do, I just let it pass",
    ],
  },
  {
    text: "What was your sleep quality throughout the previous week?",
    options: [
      "I slept well and felt refreshed every morning",
      "I had enough sleep but sometimes felt tired upon waking up",
      "My sleep was often disturbed, and I woke up multiple times at night",
      "I had trouble sleeping and often felt exhausted during the day",
    ],
  },
  {
    text: "How often do you interact with friends, family, or colleagues in person in the past week? often do you get enough sleep?",
    options: [
      "Almost every day",
      "Some A few times a week",
      "Most Only once a week",
      "Not at all",
    ],
  },
  {
    text: "What level of happiness have you experienced during the past week?",
    scale: [1, 2, 3, 4, 5, 6],
    scaleLabels: [
      "Very Poor",
      "Poor",
      "Fair",
      "Good",
      "Very Good",
      "Excellent",
    ],
  },
];

export default function UserSurvey() {
  const [selected, setSelected] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);

  const handleNext = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setSelected(null);
    } else {
      alert("Survey Completed!");
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center h-screen px-6 z-10">
        <div className="text-center">
          <h2 className="text-3xl my-2 font-bold mb-2 text-white">
            Question {questionIndex + 1}
          </h2>
          <hr className="my-2 border-t-2 border-white" />
          <p className="text-2xl font-bold text-white mb-6">
            {questions[questionIndex].text}
          </p>
        </div>
        <div className="w-full max-w-md space-y-4">
          {questions[questionIndex].options ? (
            questions[questionIndex].options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-xl cursor-pointer border transition-all w-full ${
                  selected === index
                    ? "bg-blue-400 border-blue-400"
                    : "bg-white border-gray-300"
                }`}
                onClick={() => setSelected(index)}
              >
                <span
                  className={`font-bold w-8 h-8 flex justify-center items-center rounded-full shrink-0 border mr-3 ${
                    selected === index
                      ? "bg-white text-blue-400"
                      : "bg-blue-400 text-white"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span
                  className={`font-semibold
                    ${selected === index ? "text-white" : "text-blue-300"}
                  `}
                >
                  {option}
                </span>
              </label>
            ))
          ) : (
            <div className="flex flex-col items-center w-full">
              <input
                type="range"
                min="1"
                max="6"
                value={selected !== null ? selected + 1 : 3}
                onChange={(e) => setSelected(Number(e.target.value) - 1)}
                className="w-95 accent-blue-500 cursor-pointer"
              />
              <div className="grid grid-cols-6 w-full mt-2">
                {questions[questionIndex].scale.map((num, index) => (
                  <div
                    key={num}
                    className="text-blue-500 font-semibold flex flex-col items-center"
                  >
                    <span>{num}</span>
                    <span className="text-sm text-white font-bold">
                      {questions[questionIndex].scaleLabels[index]}
                    </span>{" "}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleNext}
              disabled={selected === null}
              className={`font-bold py-2 px-6 rounded-xl flex items-center gap-2 ${
                selected === null
                  ? "bg-gray-400"
                  : "bg-white text-blue-500 cursor-pointer"
              }`}
            >
              {questionIndex < questions.length - 1 ? "Next →" : "Finish"}
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
