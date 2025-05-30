import React, { useState, useEffect } from "react";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import mail from "../assets/Mail.png";
import eyesN from "../assets/eyesN.png";
import eyes from "../assets/eyes.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Add interface for input props
interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  error?: string;
  firstName?: string;
  lastName?: string;
  onFirstNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLastNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autocomplete?: string;
}

export function InputWithLabelNamefirst({
  firstName,
  onFirstNameChange,
}: InputProps) {
  return (
    <div className="grid w-full items-center mt-10 text-black gap-4">
      <div className="w-full">
        <Label htmlFor="firstname">Nama depan*</Label>
        <Input
          type="text"
          id="firstname"
          placeholder="Masukkan nama depanmu disini..."
          className="border border-black px-3 py-2 w-full"
          value={firstName}
          onChange={onFirstNameChange}
        />
      </div>
    </div>
  );
}
export function InputWithLabelNamelast({
  lastName,
  onLastNameChange,
}: InputProps) {
  return (
    <div className="grid w-full items-center mt-5 text-black gap-4">
      <div className="w-full">
        <Label htmlFor="lastname">Nama belakang</Label>
        <Input
          type="text"
          id="lastname"
          placeholder="Masukkan nama belakangmu disini..."
          className="border border-black px-3 py-2 w-full"
          value={lastName}
          onChange={onLastNameChange}
        />
      </div>
    </div>
  );
}

export function InputWithLabelGender({ value, onChange }: InputProps) {
  return (
    <div className="relative w-full">
      <Label htmlFor="gender">Jenis Kelamin*</Label>
      <Select
        value={value}
        onValueChange={(value) => {
          if (onChange) {
            onChange({
              target: { value },
            } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
      >
        <SelectTrigger className="w-full border border-black rounded-sm px-3 py-2 appearance-none bg-[#F2EDE2] relative h-12">
          <SelectValue placeholder="Pilih jenis kelamin" />
        </SelectTrigger>
        <SelectContent className="bg-[#F2EDE2] border border-black rounded-sm">
          <SelectItem value="Laki-laki" className="hover:bg-[#BACBD8]">
            Laki-laki
          </SelectItem>
          <SelectItem value="Perempuan" className="hover:bg-[#BACBD8]">
            Perempuan
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

type Props = {
  day: string;
  month: string;
  year: string;
  onDayChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  error?: string;
};

export function InputWithLabelBirth({
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
  error,
}: Props) {
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

  const years = Array.from({ length: 100 }, (_, i) => 2025 - i); // 100 years back from 2025

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
        // Update days when month changes
        const newDaysMonth = getDaysInMonth(value, selectedYear);
        setAvailableDays(newDaysMonth);
        // Reset day if it exceeds new maximum
        if (selectedDay && parseInt(selectedDay) > newDaysMonth.length) {
          newDay = "";
          setSelectedDay("");
        }
        break;
      case "year":
        newYear = value;
        setSelectedYear(value);
        // Update days when year changes
        const newDaysYear = getDaysInMonth(selectedMonth, value);
        setAvailableDays(newDaysYear);
        // Reset day if it exceeds new maximum
        if (selectedDay && parseInt(selectedDay) > newDaysYear.length) {
          newDay = "";
          setSelectedDay("");
        }
        break;
    }

    // Immediately trigger onChange with the new values
    if (onChange && newDay && newMonth && newYear) {
      const dateString = `${newYear}-${String(
        months.indexOf(newMonth) + 1
      ).padStart(2, "0")}-${newDay.padStart(2, "0")}`;
      const event = {
        target: { value: dateString },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  // Initialize available days
  useEffect(() => {
    setAvailableDays(getDaysInMonth(selectedMonth, selectedYear));
  }, [selectedMonth, selectedYear]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1); // 1 to 31

  return (
    <div className="w-full">
      <Label htmlFor="birthdate" className="block mb-2">
        Tanggal Lahir*
      </Label>
      <div className="flex gap-2">
        {/* Day Select */}
        <Select value={day} onValueChange={onDayChange}>
          <SelectTrigger className="w-[100px] border border-black rounded-md px-3 py-2 appearance-none bg-[#F2EDE2] relative h-12">
            <SelectValue placeholder="Tanggal" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] bg-[#F2EDE2] border border-black rounded-md">
            {availableDays.map((day) => (
              <SelectItem
                key={day}
                value={String(day).padStart(2, "0")}
                className="hover:bg-[#BACBD8]"
              >
                {String(day).padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month Select */}
        <Select
          value={month}
          onValueChange={(value) => {
            onMonthChange(value);
          }}
        >
          <SelectTrigger className="w-[130px] border border-black rounded-md px-3 py-2 appearance-none bg-[#F2EDE2] relative h-12">
            <SelectValue placeholder="Bulan" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] bg-[#F2EDE2] border border-black rounded-md">
            {months.map((month) => (
              <SelectItem
                key={month}
                value={month}
                className="hover:bg-[#BACBD8]"
              >
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Select */}
        <Select
          value={year}
          onValueChange={(value) => {
            onYearChange(value);
          }}
        >
          <SelectTrigger className="w-[100px] border border-black rounded-md px-3 py-2 appearance-none bg-[#F2EDE2] relative h-12">
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] bg-[#F2EDE2] border border-black rounded-md">
            {years.map((year) => (
              <SelectItem
                key={year}
                value={String(year)}
                className="hover:bg-[#BACBD8]"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function InputWithLabelPhone({ value, onChange }: InputProps) {
  const [error, setError] = useState<string>("");

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/[^0-9]/g, "");

    if (numeric.length > 0 && !numeric.startsWith("08")) {
      setError("Nomor telepon harus dimulai dengan '08'");
      // Keep the invalid input but show error
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
    <div className="w-full">
      <Label htmlFor="phone">Nomor Telepon</Label>
      <Input
        type="tel"
        id="phone"
        placeholder="08xxxxxxxxxx"
        className={`border border-black px-3 py-2 w-full ${
          error ? "border-red-500" : ""
        }`}
        value={value}
        onChange={handlePhoneInput}
        inputMode="numeric"
        pattern="[0-9]*"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function InputWithLabelAddress({ value, onChange }: InputProps) {
  return (
    <div className="w-full">
      <Label htmlFor="address">Alamat</Label>
      <Input
        type="text"
        id="address"
        placeholder="Masukkan alamatmu disini..."
        className="border border-black px-3 py-2 w-full"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export function InputWithLabel({
  value = "",
  onChange,
  name,
  error,
}: InputProps) {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5 text-black mt-10">
      <Label htmlFor="email">Email</Label>
      <div className="relative">
        <Input
          type="email"
          id="email"
          placeholder="contoh@gmail.com"
          className={`border-1 ${error ? "border-red-500" : "border-black"}`}
          style={{
            backgroundImage: `url(${mail})`,
            backgroundPosition: "98% center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "20px 20px",
          }}
          value={value}
          onChange={onChange}
          name={name}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function InputWithLabelPass({
  value,
  onChange,
  name,
  error,
  autocomplete,
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
          }`} // tambahkan padding kanan
          value={value}
          onChange={onChange}
          name={name}
          autoComplete={autocomplete} // Add this prop
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <img
            src={isPasswordVisible ? eyes : eyesN}
            alt="Toggle visibility"
            className="w-5 h-5"
          />
        </button>
      </div>
    </div>
  );
}

export function InputWithLabelPassConfirm({
  value,
  onChange,
  name,
  error,
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
          className="border-1 border-black pr-10"
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
            className="w-5 h-5"
          />
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function InputWithLabelName() {
  return (
    <div className="grid w-full max-w-sm gap-6 text-black mt-10">
      <div className="grid items-center gap-1.5">
        <Label htmlFor="firstname">Nama Depan</Label>
        <Input
          type="text"
          id="firstname"
          placeholder="Masukkan nama depan"
          className="border border-black"
        />
      </div>

      <div className="grid items-center gap-1.5">
        <Label htmlFor="lastname">Nama Belakang</Label>
        <Input
          type="text"
          id="lastname"
          placeholder="Masukkan nama belakang"
          className="border border-black"
        />
      </div>
    </div>
  );
}
