import React from 'react';

const GenderSelector = ({ value, onChange, error }) => {
  const genders = [
    { value: 'male', label: '남자' },
    { value: 'female', label: '여자' }
  ];

  return (
    <div>
      <div className="flex items-center mb-3">
        <label className="text-white text-sm font-medium">
          성별
        </label>
        <div className="w-2 h-2 rounded-full ml-1" style={{ backgroundColor: '#FF2B3D' }}></div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {genders.map((gender) => (
          <label 
            key={gender.value}
            className={`flex items-center justify-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
              value === gender.value 
                ? 'border-0DFCBD shadow-lg' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            style={{
              borderColor: value === gender.value ? '#0DFCBD' : '#666666',
              boxShadow: value === gender.value ? '0 0 20px rgba(13, 252, 189, 0.3)' : 'none'
            }}
          >
            <input
              type="radio"
              name="gender"
              value={gender.value}
              checked={value === gender.value}
              onChange={onChange}
              className="sr-only"
            />
            <span className="text-white text-sm font-medium">{gender.label}</span>
          </label>
        ))}
      </div>
      
      {error && <p className="mt-2 text-sm" style={{ color: '#FF2B3D' }}>{error}</p>}
    </div>
  );
};

export default GenderSelector;


