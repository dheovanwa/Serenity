import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/BackgroundLayout";
import { SurveyController } from "../controllers/SurveyController";
import type { SurveyPoints } from "../models/SurveyModel";

const questions = [
  {
    text: "I felt cheerful and in a good mood.",
    options: ["All the time", "Often", "Occasionally", "Rarely", "Never"],
  },
  {
    text: "I wake up feeling refreshed and with enough energy to get through the day.",
    options: ["All the time", "Often", "Occasionally", "Rarely", "Never"],
  },
  {
    text: "I feel interested and motivated to engage in my daily activities.",
    options: ["All the time", "Often", "Occasionally", "Rarely", "Never"],
  },
  {
    text: "I have felt calm, relaxed, and at ease.",
    options: ["All the time", "Often", "Sometimes", "Rarely", "Never"],
  },
  {
    text: "I have been able to manage my worries effectively.",
    options: ["All the time", "Often", "Sometimes", "Rarely", "Never"],
  },
  {
    text: "Negative thoughts do not interfere with my daily activities.",
    options: ["All the time", "Often", "Sometimes", "Rarely", "Never"],
  },
  {
    text: "I have felt emotionally balanced and hopeful.",
    options: [
      "All the time",
      "Almost Every Day",
      "More than Half the Time",
      "Occasionally",
      "Never",
    ],
  },
  {
    text: "I have felt that my life is meaningful and full of hope.",
    options: [
      "All the time",
      "Almost Every Day",
      "More than Half the Time",
      "Occasionally",
      "Never",
    ],
  },
  {
    text: "I have someone to talk to when I feel stressed.",
    options: [
      "Strongly Agree",
      "Agree",
      "Neutral",
      "Disagree",
      "Strongly Disagree",
    ],
  },
  {
    text: "I feel supported by my friends or family.",
    options: [
      "Strongly Agree",
      "Agree",
      "Neutral",
      "Disagree",
      "Strongly Disagree",
    ],
  },
  {
    text: "When stressed, I seek solutions or talk to someone I trust.",
    options: ["All the time", "Often", "Sometimes", "Rarely", "Never"],
  },
  {
    text: "When faced with difficulties, I actively face the issue and seek solutions.",
    options: ["All the time", "Often", "Sometimes", "Rarely", "Never"],
  },
  {
    text: "Have you had thoughts of harming yourself or that you would be better off dead today?",
    options: [
      "Never",
      "Sometimes",
      "Often",
      "Frequently and hard to control",
      "Always",
    ],
  },
];

export default function UserSurvey() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const navigate = useNavigate();
  const controller = new SurveyController();

  useEffect(() => {
    const checkAuthorization = async () => {
      const documentId = localStorage.getItem("documentId");
      const { isAuthorized, shouldRedirect } =
        await controller.checkAuthorization(documentId);

      if (!isAuthorized || shouldRedirect) {
        navigate(isAuthorized ? "/" : "/signin");
      }
    };

    checkAuthorization();
  }, [navigate]);

  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(questions.length).fill(null)
  );
  const selected = answers[questionIndex];
  const [points, setPoints] = useState<SurveyPoints>({
    who5: 0,
    gad7: 0,
    phq9: 0,
    mspss: 0,
    cope: 0,
    highRisk: 0,
  });

  const handleNext = async () => {
    const updatedPoints = { ...points };
    const pointsScale = controller.getPointsScale();

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prevIndex) => prevIndex + 1);

      if (questionIndex <= 2) updatedPoints.who5 += pointsScale[selected!];
      else if (questionIndex <= 5) updatedPoints.gad7 += pointsScale[selected!];
      else if (questionIndex <= 7) updatedPoints.phq9 += pointsScale[selected!];
      else if (questionIndex <= 9)
        updatedPoints.mspss += pointsScale[selected!];
      else if (questionIndex <= 11)
        updatedPoints.cope += pointsScale[selected!];

      setPoints(updatedPoints);
    } else {
      if (questionIndex === 12 && selected !== null) {
        const reversedScale = [...pointsScale].reverse();
        updatedPoints.highRisk += reversedScale[selected];
      }

      const success = await controller.handleSurveyCompletion(updatedPoints);
      if (success) {
        setIsFinished(true);
      }
    }
  };

  const handlePrevious = () => {
    if (questionIndex > 0) {
      setQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const updateAnswer = (value: number) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[questionIndex] = value;
      return updated;
    });
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center h-screen px-6 z-10">
        {isFinished ? (
          <div className="flex flex-col items-center justify-center h-screen px-6 z-10">
            <div className="text-center">
              <p className="text-2xl text-white font-medium">
                Your responses have been successfully submitted. We appreciate
                your participation.
              </p>
              <Link
                to="/"
                className="mt-8 inline-block px-6 py-2 bg-white text-blue-300 font-bold rounded-xl"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-3xl my-2 font-bold mb-2 text-white">
                Question {questionIndex + 1}
              </h2>
              <hr className="my-2 border-t-2 border-white" />
              <p className="text-2xl font-bold text-white mb-6 max-w-3xl mx-auto text-center leading-snug">
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
                    onClick={() => updateAnswer(index)}
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
                    onChange={(e) => updateAnswer(Number(e.target.value) - 1)}
                    className="w-95 accent-blue-500 cursor-pointer"
                  />
                  <div className="grid grid-cols-6 w-full mt-2 gap-x-1 text-center">
                    {questions[questionIndex].scale.map((num, index) => (
                      <div
                        key={num}
                        className="text-blue-500 font-semibold flex flex-col items-center"
                      >
                        <span className="mb-1">{num}</span>
                        <span
                          className={`${
                            questionIndex === 10
                              ? "text-xs leading-tight" // smaller text for long labels
                              : "text-l"
                          } text-white font-bold break-words`}
                        >
                          {questions[questionIndex].scaleLabels[index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrevious}
                  disabled={questionIndex === 0}
                  className={`font-bold py-2 px-6 rounded-xl flex items-center gap-2 ${
                    questionIndex === 0
                      ? "bg-gray-400"
                      : "bg-white text-blue-500 cursor-pointer"
                  }`}
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={selected === null}
                  className={`font-bold py-2 px-6 rounded-xl flex items-center gap-2 ${
                    selected === null
                      ? "bg-gray-400"
                      : "bg-white text-blue-500 cursor-pointer"
                  }`}
                >
                  {" "}
                  {questionIndex < questions.length - 1 ? "Next →" : "Finish"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
