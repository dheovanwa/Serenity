import { useState } from "react";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import mail from "../assets/Mail.png";
import eyesN from "../assets/eyesN.png";
import eyes from "../assets/eyes.png";

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
}

export function InputWithLabel({ value, onChange, name, error }: InputProps) {
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
    </div>
  );
}

export function InputWithLabelPass({
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
    <div className="grid w-full max-w-sm items-center mt-10 text-black">
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
    <div className="grid w-full max-w-sm items-center mt-10 text-black">
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
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
