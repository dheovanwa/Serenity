import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import {
  InputWithLabelGender,
  InputWithLabelBirth,
  InputWithLabelPhone,
  InputWithLabelAddress,
  InputWithLabelNamefirst,
  InputWithLabelNamelast,
} from "../components/InputWithLabel"; // Asumsi komponen ini dark mode aware
import logoLight from "../assets/Logo - Light.png";
import logoDark from "../assets/Logo - Dark.png"; // Import logo dark
import { Button } from "../components/Button"; // Asumsi komponen ini dark mode aware
import { LoginController } from "../controllers/LoginController";

// Import ikon Sun dan Moon
import Sun from "../assets/Sun.svg";
import Moon from "../assets/Do not Disturb iOS.svg";

type FormErrors = {
  firstName?: string;
  gender?: string;
  birthDate?: string;
  day?: string;
  month?: string;
  year?: string;
};

interface CompleteSignUpProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const CompleteSignUp: React.FC<CompleteSignUpProps> = ({
  isDarkMode,
  toggleTheme,
}) => {
  const location = useLocation();
  const [firstName, setFirstName] = useState(location.state?.firstName || "");
  const [lastName, setLastName] = useState(location.state?.lastName || "");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isClicked, setIsClicked] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const navigate = useNavigate();
  const controller = new LoginController();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log("User not authenticated, redirecting to signup");
        navigate("/signup");
      } else {
        console.log("User authenticated:", user.uid);
        const docId = localStorage.getItem("documentId");
        if (docId) {
          const userDocRef = doc(db, "users", docId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const birthOfDate = userDoc.data().birthOfDate;
            if (birthOfDate && birthOfDate !== "") {
              console.log(
                "User already completed profile, redirecting to home"
              );
              navigate("/home");
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (location.state?.firstName) {
      setFirstName(location.state.firstName);
    }
    if (location.state?.lastName) {
      setLastName(location.state.lastName);
    }
  }, [location.state]);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    if (!firstName.trim()) newErrors.firstName = "Nama depan wajib diisi.";
    if (!gender.trim()) newErrors.gender = "Jenis kelamin wajib dipilih.";
    if (!selectedDay || !selectedMonth || !selectedYear) {
      newErrors.birthDate = "Tanggal lahir wajib diisi lengkap.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const docId = localStorage.getItem("documentId");
      if (!docId) {
        console.error("No document ID found");
        return;
      }

      const userDocRef = doc(db, "users", docId);
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        sex: gender,
        birthOfDate: `${selectedYear}-${String(
          new Date(Date.parse(`${selectedMonth} 1, 2000`)).getMonth() + 1
        ).padStart(2, "0")}-${selectedDay.padStart(2, "0")}`,
        phoneNumber: phone,
        address,
      });

      navigate("/home");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const navSpecificThemeColors = {
    toggleBg: isDarkMode ? "bg-gray-700" : "bg-gray-300",
  };

  return (
    <div className="w-full h-screen flex items-center justify-center relative px-4 sm:px-6 bg-[#F2EDE2] dark:bg-[#1A2947] transition-colors duration-300">
      {/* Logo di pojok kiri atas */}
      <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
        <img
          src={isDarkMode ? logoLight : logoDark}
          alt="logo"
          className="w-12 h-12"
        />
        <h1 className="text-xl text-[#78716C] dark:text-gray-300 font-light">
          Serenity
        </h1>
      </div>

      <div className="w-full max-w-[500px] flex flex-col mx-auto bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
        {" "}
        {/* Card background */}
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-light text-[#161F36] mb-1 text-center dark:text-white">
          Mari lengkapi data dirimu
        </h2>
        <p className="text-xl sm:text-2xl font-semibold text-[#161F36] mb-6 text-center dark:text-white">
          Sebelum masuk ke Serenity
        </p>
        {/* Form */}
        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <InputWithLabelNamefirst
              firstName={firstName}
              onFirstNameChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
              isDarkMode={isDarkMode}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1 dark:text-red-400">
                {errors.firstName}
              </p>
            )}
          </div>
          <div>
            <InputWithLabelNamelast
              lastName={lastName}
              onLastNameChange={(e) => setLastName(e.target.value)}
              isDarkMode={isDarkMode}
            />
          </div>

          <div>
            <InputWithLabelGender
              value={gender}
              onChange={(e: any) => {
                const value = e && e.target ? e.target.value : e;
                setGender(value);
              }}
              isDarkMode={isDarkMode}
            />
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1 dark:text-red-400">
                {errors.gender}
              </p>
            )}
          </div>

          <div>
            <InputWithLabelBirth
              day={selectedDay}
              month={selectedMonth}
              year={selectedYear}
              onDayChange={(e) => setSelectedDay(e)}
              onMonthChange={(e) => setSelectedMonth(e)}
              onYearChange={(e) => setSelectedYear(e)}
              error={errors.birthDate}
              isDarkMode={isDarkMode}
            />
            {errors.birthDate && (
              <p className="text-red-500 text-sm mt-1 dark:text-red-400">
                {errors.birthDate}
              </p>
            )}
          </div>

          <InputWithLabelPhone
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            isDarkMode={isDarkMode}
          />
          <InputWithLabelAddress
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            isDarkMode={isDarkMode}
          />

          <Button
            variant="outline"
            type="submit"
            className="w-full h-12 mt-6 rounded-md transition-colors
                       bg-[#BACBD8] text-black hover:bg-[#bad2e5] dark:bg-[#BACBD8] dark:text-[#161F36] dark:hover:bg-[#96a5b1]"
            onClick={handleClick}
          >
            Selesai
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteSignUp;
