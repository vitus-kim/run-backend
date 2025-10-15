import React from 'react';

const FormField = ({ label, name, type = 'text', value, onChange, error, required = false, ...props }) => {
  const baseInputStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: error ? '#FF2B3D' : '#666666',
    color: '#FFFFFF'
  };

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div>
      <label className="block text-white text-sm font-medium mb-2">
        {label} {required && '*'}
      </label>
      <InputComponent
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none ${
          type === 'textarea' ? 'resize-none' : ''
        }`}
        style={baseInputStyle}
        {...props}
      />
      {error && (
        <p className="text-sm mt-1" style={{ color: '#FF2B3D' }}>{error}</p>
      )}
    </div>
  );
};

export default FormField;


