import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputField: React.FC<InputFieldProps> = ({ className, ...props }) => {
  return (
    <input
      {...props}
      className={`w-full h-[57px] px-4 py-2 rounded-md bg-white bg-opacity-30 text-gray-900 focus:placeholder-transparent ${className}`}
    />
  );
};

export default InputField;
