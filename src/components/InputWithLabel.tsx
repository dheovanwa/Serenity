import { useState } from "react";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import mail from "../assets/Mail.png";
import eyesN from "../assets/eyesN.png";
import eyes from "../assets/eyes.png";

export function InputWithLabel() {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5 text-black mt-10">
      <Label htmlFor="email">Email</Label>
      <div className="relative">
        <Input
          type="email"
          id="email"
          placeholder="contoh@gmail.com"
          className="border-1 border-black" 
          style={{
            backgroundImage: `url(${mail})`,
            backgroundPosition: '98% center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '20px 20px', 
          }}
        />
      </div>
    </div>
  );
}

export function InputWithLabelPass() {
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
          className="border-1 border-black" 
          style={{
            backgroundImage: `url(${isPasswordVisible ? eyes : eyesN})`,  
            backgroundPosition: '98% center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '20px 20px',
            cursor: 'pointer',
          }}
          onClick={togglePasswordVisibility} 
        />
      </div>
    </div>
  );
}
