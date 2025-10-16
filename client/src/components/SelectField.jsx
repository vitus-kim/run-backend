import React from 'react';

const SelectField = ({ label, name, value, onChange, options, required = false }) => {
  return (
    <div>
      <label className="block text-white text-sm font-medium mb-2">
        {label} {required && '*'}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: '#666666',
          color: '#FFFFFF'
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;



