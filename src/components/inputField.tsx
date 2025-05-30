import React from "react";

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string; // Prop className tambahan
  readOnly?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isDarkMode?: boolean; // Tambahkan prop isDarkMode
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  readOnly = false,
  className = "", // Terima prop className
  icon,
  iconPosition = "right",
  isDarkMode, // Terima prop isDarkMode
}) => {
  const hasIcon = Boolean(icon);
  const iconPaddingClass = hasIcon
    ? iconPosition === "left"
      ? "pl-10"
      : "pr-10"
    : "";

  return (
    <div className="mb-0.5">
      <label className="block lg:text-[22px] text-[#161F36] mb-1 font-regular dark:text-white">
        {label}
      </label>
      <div className="relative w-full lg:text-lg font-regular ">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-[90%] p-3 rounded-[6px] focus:outline-none 
            ${
              readOnly
                ? "bg-transparent text-[#161F36] border-2 border-[#161F36] dark:text-gray-300 dark:border-gray-600 dark:bg-[#161F36]"
                : "bg-transparent text-[#161F36] border-2 border-[#161F36] dark:bg-gray-700 dark:text-[#E6E6E6] dark:border-gray-600"
            } 
            placeholder-gray-900 placeholder-opacity-90 ml-0 dark:placeholder-gray-400
            ${iconPaddingClass} ${className}`}
        />
        {icon && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 pointer-events-none 
              ${iconPosition === "left" ? "left-3 " : "right-3"}`} // KOREKSI DI SINI: Template literal ditutup dengan backtick
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;
