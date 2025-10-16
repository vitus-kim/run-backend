import React from 'react';

const DurationInput = ({ durationMinutes, durationSeconds, onDurationChange, error }) => {
  return (
    <div>
      <label className="block text-white text-sm font-medium mb-3">
        시간 *
      </label>
      <div className="relative">
        <div className="flex items-center justify-center space-x-1 bg-gray-800 rounded-xl p-2 border-2 transition-all duration-300 hover:border-blue-400 focus-within:border-blue-500 focus-within:shadow-lg focus-within:shadow-blue-500/20" 
             style={{ borderColor: error ? '#FF2B3D' : '#404040' }}>
          
          {/* 분 입력 */}
          <div className="relative">
            <input
              type="number"
              name="durationMinutes"
              value={durationMinutes}
              onChange={onDurationChange}
              min="0"
              max="1440"
              className="w-16 h-12 text-center text-white text-lg font-semibold bg-transparent border-none outline-none"
              placeholder="00"
              style={{ 
                backgroundColor: 'transparent',
                color: '#FFFFFF'
              }}
            />
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <span className="text-xs font-medium" style={{ color: '#999999' }}>분</span>
            </div>
          </div>
          
          {/* 구분자 */}
          <div className="flex items-center justify-center w-2">
            <span className="text-white text-xl font-bold">:</span>
          </div>
          
          {/* 초 입력 */}
          <div className="relative">
            <input
              type="number"
              name="durationSeconds"
              value={durationSeconds}
              onChange={onDurationChange}
              min="0"
              max="59"
              className="w-16 h-12 text-center text-white text-lg font-semibold bg-transparent border-none outline-none"
              placeholder="00"
              style={{ 
                backgroundColor: 'transparent',
                color: '#FFFFFF'
              }}
            />
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <span className="text-xs font-medium" style={{ color: '#999999' }}>초</span>
            </div>
          </div>
        </div>
        
        {/* 시간 표시 예시 */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: '#666666' }}>
            예: 30분 30초 = 30.5분으로 저장됩니다
          </p>
        </div>
      </div>
      {error && (
        <p className="text-sm mt-2 text-center" style={{ color: '#FF2B3D' }}>{error}</p>
      )}
    </div>
  );
};

export default DurationInput;



