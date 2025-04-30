import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, addDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import AuthLayout from "../components/BackgroundLayout";

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
  {
    text: "The past week brought out feelings of anger and frustration in you how many times?",
    scale: [1, 2, 3, 4, 5, 6],
    scaleLabels: [
      "Never",
      "Rarely",
      "Sometimes",
      "Often",
      "Most of the time",
      "Always",
    ],
  },
  {
    text: "The past week brought out feelings of anger and frustration in you how many times?",
    scale: [1, 2, 3, 4, 5, 6],
    scaleLabels: [
      "Never",
      "Rarely",
      "Sometimes",
      "Often",
      "Most of the time",
      "Always",
    ],
  },
  {
    text: "Does anxiousness or excessive worry affect you frequently throughout the last week?",
    scale: [1, 2, 3, 4, 5, 6],
    scaleLabels: [
      "Never",
      "Rarely",
      "Sometimes",
      "Often",
      "Most of the time",
      "Always",
    ],
  },
  {
    text: "What level of satisfaction do you have with the way you interact with others at this moment?",
    scale: [1, 2, 3, 4, 5, 6],
    scaleLabels: [
      "Very dissatisfied",
      "Dissatisfied",
      "Somewhat dissatisfied",
      "Somewhat satisfied",
      "Satisfied",
      "Very satisfied",
    ],
  },
  {
    text: "Have you maintained a state of peacefulness during any instances within the previous week?",
    scale: [1, 2, 3, 4, 5, 6],
    scaleLabels: [
      "Never",
      "Rarely",
      "Sometimes",
      "Often",
      "Most of the time",
      "Always",
    ],
  },
];

export default function UserSurvey() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthorized = Boolean(localStorage.getItem("documentId")); // Check document ID
    if (!isAuthorized) {
      navigate("/signin");
    }
  }, [navigate]);

  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(questions.length).fill(null)
  );
  const selected = answers[questionIndex];
  const pointsScale = [5, 4, 2, 1];
  const [points, setPoints] = useState(0);

  const handleNext = async () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((prevIndex) => prevIndex + 1);
      setPoints(
        points + (questionIndex <= 5 ? pointsScale[selected!] : selected! + 1)
      );
      console.log(points);
    } else {
      // const finalPoints =
      // points + (questionIndex <= 5 ? pointsScale[selected!] : selected! + 1);
      const stressPercentage = (points / 60) * 100;
      console.log(points);

      try {
        const documentId = localStorage.getItem("documentId");
        // check if documentId is not null
        if (documentId) {
          const userDocRef = doc(db, "users", documentId);
          const historyCollectionRef = collection(userDocRef, "history_stress");

          await addDoc(historyCollectionRef, {
            stressPercentage,
            time: new Date(),
          });

          // Optionally update the user's dailySurveyCompleted status
          await updateDoc(userDocRef, { dailySurveyCompleted: true });
        }
      } catch (error) {
        console.error("Error saving survey result:", error);
      }

      alert("Survey Completed!");
      console.log("Stress Percentage:", stressPercentage);
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
              <p className="text-2xl text-white mb-2 font-medium">
                your calculated stress percentage:
              </p>
              <h2 className="text-6xl font-bold text-white mb-4">80%</h2>
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
