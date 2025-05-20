import { useState } from "react";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import mail from "../assets/Mail.png";
import eyesN from "../assets/eyesN.png";
import eyes from "../assets/eyes.png";




export function InputWithLabelNamefirst({ firstName,  onFirstNameChange }: InputProps) {
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
export function InputWithLabelNamelast({lastName, onLastNameChange }: InputProps) {
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
      <select
        id="gender"
        value={value}
        onChange={onChange}
        className="border border-black px-3 py-2 w-full rounded-md appearance-none"
      >
        <option value="Laki-laki">Laki-laki</option>
        <option value="Perempuan">Perempuan</option>
        <option value="Lainnya">Lainnya</option>
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black mt-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export function InputWithLabelBirth({ value, onChange }: InputProps) {
  return (
    <div
      className="w-full"
      onClick={() => {
        const input = document.getElementById('birthdate');
        if (input) input.showPicker ? input.showPicker() : input.focus(); 
      }}
      style={{ cursor: 'text' }}
    >
      <Label htmlFor="birthdate">Tanggal Lahir*</Label>
      <input
        type="date"
        id="birthdate"
        placeholder="dd/mm/yyyy"
        value={value}
        onChange={onChange}
        className="border border-black px-3 py-2 w-full rounded-md"
      />
    </div>
  );
}

export function InputWithLabelPhone({ value, onChange }: InputProps) {
  return (
    <div className="w-full">
      <Label htmlFor="phone">Nomor Telepon</Label>
      <Input
        type="tel"
        id="phone"
        placeholder="08xxxxxxxxxx"
        className="border border-black px-3 py-2 w-full"
        value={value}
        onChange={onChange}
      />
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


export function InputWithLabel() {

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