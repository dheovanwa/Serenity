interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
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
        className="w-full p-3 rounded-lg focus:outline-none bg-white placeholder-gray-300 placeholder-opacity-90"
      />
    </div>
  );
};

export default InputField;
