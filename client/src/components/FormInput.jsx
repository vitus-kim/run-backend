import React from 'react';

const FormInput = ({ 
  id, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  error, 
  required = false,
  min,
  max,
  label,
  description,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  ...otherProps 
}) => {
  return (
    <div>
      <div className="flex items-center mb-3">
        <label htmlFor={id} className="text-white text-sm font-medium">
          {label}
        </label>
        {required && (
          <div className="w-2 h-2 rounded-full ml-1" style={{ backgroundColor: '#FF2B3D' }}></div>
        )}
      </div>
      
      {description && (
        <p className="text-xs mb-3" style={{ color: '#999999' }}>
          {description}
        </p>
      )}
      
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          className={`w-full px-4 py-3 pr-12 rounded-lg border-2 bg-transparent text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
            error 
              ? 'border-red-500 shadow-red-500/50' 
              : 'border-gray-600 focus:border-0DFCBD focus:shadow-lg focus:shadow-0DFCBD/30'
          }`}
          style={{
            borderColor: error ? '#FF2B3D' : '#666666',
            boxShadow: error ? '0 0 20px rgba(255, 43, 61, 0.3)' : 'none'
          }}
          {...otherProps}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showPassword ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              )}
            </svg>
          </button>
        )}
      </div>
      
      {error && <p className="mt-2 text-sm" style={{ color: '#FF2B3D' }}>{error}</p>}
    </div>
  );
};

export default FormInput;


