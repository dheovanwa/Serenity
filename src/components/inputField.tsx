interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  readOnly = false,
  className = "",
}) => {
  return (
    <div className="mb-0.5 relative">
      <label className="block text-white mb-1 font-semibold">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full p-3 rounded-lg focus:outline-none 
          ${
            readOnly
              ? "bg-transparent text-white border-2 border-white"
              : "bg-white text-gray-700"
          } 
          placeholder-gray-300 placeholder-opacity-90 ml-0 ${className}`}
      />
    </div>
  );
};

export default InputField;
