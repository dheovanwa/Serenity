import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
};

const CompleteSignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate();
  const controller = new LoginController();

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    if (!firstName.trim()) newErrors.firstName = "Nama depan wajib diisi.";
    if (!gender.trim()) newErrors.gender = "Jenis kelamin wajib dipilih.";
    if (!birthDate.trim()) newErrors.birthDate = "Tanggal lahir wajib diisi.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const result = await controller.handleLogin({
      email: "", 
      password: "", 
    });

    if (result.success && result.redirectTo) {
      navigate(result.redirectTo);
    } else if (result.errors) {
      console.log(result.errors);
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
        <form className="space-y-4 text-left" onSubmit={handleLogin}>
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
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
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
