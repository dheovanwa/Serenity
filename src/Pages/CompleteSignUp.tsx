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
} from "../components/InputWithLabel";
import logoLight from "../assets/Logo - Light.png";
import { Button } from "../components/Button";
import { LoginController } from "../controllers/LoginController";

type FormErrors = {
  firstName?: string;
  gender?: string;
  birthDate?: string;
  day?: string;
  month?: string;
  year?: string;
};

const CompleteSignUp = () => {
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

  // Add auth check effect
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log("User not authenticated, redirecting to signup");
        navigate("/signup");
      } else {
        console.log("User authenticated:", user.uid);
        // Check if user has completed profile by checking birthOfDate
        const docId = localStorage.getItem("documentId");
        if (docId) {
          const userDocRef = doc(db, "users", docId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() && userDoc.data().birthOfDate) {
            console.log("User already completed profile, redirecting to home");
            navigate("/");
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

      navigate("/"); // Changed from /user-survey to /
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="w-full h-screen bg-[#F2EDE2] flex items-center justify-center relative px-4 sm:px-6">
      {/* Logo */}
      <div className="absolute top-5 left-5 flex items-center gap-2">
        <img src={logoLight} alt="logoLight" className="w-12 h-12" />
        <h1 className="text-xl text-[#78716C] font-light">Serenity</h1>
      </div>

      <div className="w-full max-w-[500px] flex flex-col mx-auto">
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-light text-[#161F36] mb-1 text-center">
          Mari lengkapi data dirimu
        </h2>
        <p className="text-xl sm:text-2xl font-semibold text-[#161F36] mb-6 text-center">
          Sebelum masuk ke Serenity
        </p>

        {/* Form */}
        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <InputWithLabelNamefirst
              firstName={firstName}
              onFirstNameChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <InputWithLabelNamelast
              lastName={lastName}
              onLastNameChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div>
            <InputWithLabelGender
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
            {errors.gender && (
              <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
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
            />
            {errors.birthDate && (
              <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
            )}
          </div>

          <InputWithLabelPhone
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <InputWithLabelAddress
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Button
            variant="outline"
            type="submit"
            className="w-full h-12 mt-6 rounded-md bg-[#BACBD8] text-black hover:bg-[#bad2e5]"
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
