import React, { useState, useEffect } from "react";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import mail from "../assets/Mail.png"; // Pastikan path ini benar
import eyesN from "../assets/eyesN.png"; // Pastikan path ini benar
import eyes from "../assets/eyes.png"; // Pastikan path ini benar
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Sesuaikan path jika perlu

// Add interface for input props
interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | string) => void; // Perluas untuk Select
  name?: string;
  error?: string;
  firstName?: string;
  lastName?: string;
  onFirstNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLastNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autocomplete?: string;
  isDarkMode?: boolean; // Tambahkan prop isDarkMode
}

// 1. InputWithLabelNamefirst
export function InputWithLabelNamefirst({
  firstName,
  onFirstNameChange,
  isDarkMode, // Terima prop isDarkMode
}: InputProps) {
  return (
    <div className="grid w-full items-center mt-10 text-black gap-4 dark:text-white">
      <div className="w-full">
        <Label htmlFor="firstname" className="dark:text-white">
          Nama depan*
        </Label>
        <Input
          type="text"
          id="firstname"
          placeholder="Masukkan nama depanmu disini..."
          className="border border-black px-3 py-2 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          value={firstName}
          onChange={onFirstNameChange}
        />
      </div>
    </div>
  );
}

// 2. InputWithLabelNamelast
export function InputWithLabelNamelast({
  lastName,
  onLastNameChange,
  isDarkMode, // Terima prop isDarkMode
}: InputProps) {
  return (
    <div className="grid w-full items-center mt-5 text-black gap-4 dark:text-white">
      <div className="w-full">
        <Label htmlFor="lastname" className="dark:text-white">
          Nama belakang
        </Label>
        <Input
          type="text"
          id="lastname"
          placeholder="Masukkan nama belakangmu disini..."
          className="border border-black px-3 py-2 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          value={lastName}
          onChange={onLastNameChange}
        />
      </div>
    </div>
  );
}

// 3. InputWithLabelGender
export function InputWithLabelGender({
  value,
  onChange,
  isDarkMode,
}: InputProps) {
  return (
    <div className="relative w-full text-black dark:text-white">
      <Label htmlFor="gender" className="dark:text-white">
        Jenis Kelamin*
      </Label>
      <Select
        value={value}
        onValueChange={(value) => {
          if (onChange) {
            onChange(value);
          }
        }}
      >
        <SelectTrigger
          className="w-full border border-black rounded-sm px-3 py-2 appearance-none bg-[#F2EDE2] relative h-12
                                       dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-gray-500 transition-colors duration-300"
        >
          <SelectValue placeholder="Pilih jenis kelamin" />
        </SelectTrigger>
        <SelectContent
          className="bg-[#F2EDE2] border border-black rounded-sm
                                       dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors duration-300"
        >
          <SelectItem
            value="Laki-laki"
            className="hover:bg-[#BACBD8] dark:hover:bg-gray-700"
          >
            Laki-laki
          </SelectItem>
          <SelectItem
            value="Perempuan"
            className="hover:bg-[#BACBD8] dark:hover:bg-gray-700"
          >
            Perempuan
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// 4. InputWithLabelBirth
type BirthProps = {
  day: string;
  month: string;
  year: string;
  onDayChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  error?: string;
  isDarkMode?: boolean; // Tambahkan ini
};

export function InputWithLabelBirth({
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
  error,
  isDarkMode, // Terima prop isDarkMode
}: BirthProps) {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [availableDays, setAvailableDays] = useState<number[]>([]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from({ length: 100 }, (_, i) => 2025 - i);

  const getDaysInMonth = (month: string, year: string) => {
    if (!month || !year) return Array.from({ length: 31 }, (_, i) => i + 1);

    const monthIndex = months.indexOf(month);
    const yearNum = parseInt(year);

    const daysInMonth = new Date(yearNum, monthIndex + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleDateChange = (type: string, value: string) => {
    let newDay = selectedDay;
    let newMonth = selectedMonth;
    let newYear = selectedYear;

    switch (type) {
      case "day":
        newDay = value;
        setSelectedDay(value);
        break;
      case "month":
        newMonth = value;
        setSelectedMonth(value);
        const newDaysMonth = getDaysInMonth(value, selectedYear);
        setAvailableDays(newDaysMonth);
        if (selectedDay && parseInt(selectedDay) > newDaysMonth.length) {
          newDay = "";
          setSelectedDay("");
        }
        break;
      case "year":
        newYear = value;
        setSelectedYear(value);
        const newDaysYear = getDaysInMonth(selectedMonth, value);
        setAvailableDays(newDaysYear);
        if (selectedDay && parseInt(selectedDay) > newDaysYear.length) {
          newDay = "";
          setSelectedDay("");
        }
        break;
    }
    if (type === "day") onDayChange(newDay);
    if (type === "month") onMonthChange(newMonth);
    if (type === "year") onYearChange(newYear);
  };

  useEffect(() => {
    setAvailableDays(getDaysInMonth(selectedMonth, selectedYear));
  }, [selectedMonth, selectedYear]);

  return (
    <div className="w-full text-black dark:text-white">
      <Label htmlFor="birthdate" className="block mb-2 dark:text-white">
        Tanggal Lahir*
      </Label>
      <div className="flex gap-2">
        <Select
          value={day}
          onValueChange={(val) => handleDateChange("day", val)}
        >
          <SelectTrigger
            className="w-[100px] border border-black rounded-md px-3 py-2 appearance-none bg-[#F2EDE2] relative h-12
                                       dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-gray-500 transition-colors duration-300"
          >
            <SelectValue placeholder="Tanggal" />
          </SelectTrigger>
          <SelectContent
            className="max-h-[200px] bg-[#F2EDE2] border border-black rounded-md
                                       dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors duration-300"
          >
            {availableDays.map((day) => (
              <SelectItem
                key={day}
                value={String(day).padStart(2, "0")}
                className="hover:bg-[#BACBD8] dark:hover:bg-gray-700"
              >
                {String(day).padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={month}
          onValueChange={(val) => handleDateChange("month", val)}
        >
          <SelectTrigger
            className="w-[130px] border border-black rounded-md px-3 py-2 appearance-none bg-[#F2EDE2] relative h-12
                                       dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-gray-500 transition-colors duration-300"
          >
            <SelectValue placeholder="Bulan" />
          </SelectTrigger>
          <SelectContent
            className="max-h-[200px] bg-[#F2EDE2] border border-black rounded-md
                                       dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors duration-300"
          >
            {months.map((month) => (
              <SelectItem
                key={month}
                value={month}
                className="hover:bg-[#BACBD8] dark:hover:bg-gray-700"
              >
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year}
          onValueChange={(val) => handleDateChange("year", val)}
        >
          <SelectTrigger
            className="w-[100px] border border-black rounded-md px-3 py-2 appearance-none bg-[#F2EDE2] relative h-12
                                       dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-gray-500 transition-colors duration-300"
          >
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent
            className="max-h-[200px] bg-[#F2EDE2] border border-black rounded-md
                                       dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors duration-300"
          >
            {years.map((year) => (
              <SelectItem
                key={year}
                value={String(year)}
                className="hover:bg-[#BACBD8] dark:hover:bg-gray-700"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// 5. InputWithLabelPhone
export function InputWithLabelPhone({
  value,
  onChange,
  isDarkMode,
}: InputProps) {
  const [error, setError] = useState<string>("");

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/[^0-9]/g, "");

    if (numeric.length > 0 && !numeric.startsWith("08")) {
      setError("Nomor telepon harus dimulai dengan '08'");
      if (onChange) {
        onChange({
          ...e,
          target: {
            ...e.target,
            value: numeric,
          },
        });
      }
      return;
    }

    setError("");
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          value: numeric,
        },
      });
    }
  };

  return (
    <div className="w-full text-black dark:text-white">
      <Label htmlFor="phone" className="dark:text-white">
        Nomor Telepon
      </Label>
      <Input
        type="tel"
        id="phone"
        placeholder="08xxxxxxxxxx"
        className={`border border-black px-3 py-2 w-full ${
          error ? "border-red-500" : ""
        } dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400`}
        value={value}
        onChange={handlePhoneInput}
        inputMode="numeric"
        pattern="[0-9]*"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// 6. InputWithLabelAddress
export function InputWithLabelAddress({
  value,
  onChange,
  isDarkMode,
}: InputProps) {
  return (
    <div className="w-full text-black dark:text-white">
      <Label htmlFor="address" className="dark:text-white">
        Alamat
      </Label>
      <Input
        type="text"
        id="address"
        placeholder="Masukkan alamatmu disini..."
        className="border border-black px-3 py-2 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

// 7. InputWithLabel (Email) - Sudah dimodifikasi dari pertanyaan sebelumnya, hanya verifikasi
export function InputWithLabel({
  value = "",
  onChange,
  name,
  error,
  isDarkMode, // Terima prop isDarkMode
}: InputProps) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5 text-black mt-10 dark:text-white">
      <Label htmlFor="email" className="dark:text-white">
        Email
      </Label>
      <div className="relative">
        <Input
          type="email"
          id="email"
          placeholder="contoh@gmail.com"
          className={`border-1 pr-10 ${
            error ? "border-red-500" : "border-black"
          } dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400`}
          value={value}
          onChange={onChange}
          name={name}
        />
        <img
          src={mail}
          alt="Mail icon"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 dark:filter dark:invert"
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// 8. InputWithLabelPass - Sudah dimodifikasi dari pertanyaan sebelumnya, hanya verifikasi
export function InputWithLabelPass({
  value,
  onChange,
  name,
  error,
  autocomplete,
  isDarkMode,
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5 mt-10 text-black">
      <Label htmlFor="password">Kata Sandi</Label>
      <div className="relative">
        <Input
          type={isPasswordVisible ? "text" : "password"}
          id="password"
          placeholder="•••••••"
          className={`border-1 pr-10 ${
            error ? "border-red-500" : "border-black"
          } dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400`}
          value={value}
          onChange={onChange}
          name={name}
          autoComplete={autocomplete}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <img
            src={isPasswordVisible ? eyes : eyesN}
            alt="Toggle visibility"
            className="w-5 h-5 dark:filter dark:invert"
          />
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// 9. InputWithLabelPassConfirm - Tambahkan isDarkMode dan styling dark mode
export function InputWithLabelPassConfirm({
  value,
  onChange,
  name,
  error,
  isDarkMode, // Terima prop isDarkMode
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5 mt-10 text-black">
      <Label htmlFor="password">Konfirmasi Kata Sandi</Label>
      <div className="relative">
        <Input
          type={isPasswordVisible ? "text" : "password"}
          id="password"
          placeholder="•••••••"
          className={`border-1 border-black pr-10 ${
            error ? "border-red-500" : "border-black"
          } dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400`}
          value={value}
          onChange={onChange}
          name={name}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <img
            src={isPasswordVisible ? eyes : eyesN}
            alt="Toggle visibility"
            className="w-5 h-5 dark:filter dark:invert"
          />
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
