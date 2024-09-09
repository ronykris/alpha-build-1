import React, { useState } from 'react';

interface CustomSelectProps {
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, placeholder, onChange }) => {
  const [selectedValue, setSelectedValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <select
      value={selectedValue}
      onChange={handleChange}
      className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
      style={{ appearance: 'auto' }}
    >
      <option value="" disabled hidden>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default CustomSelect;