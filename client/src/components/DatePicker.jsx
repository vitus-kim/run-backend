import React, { useState, useEffect } from 'react';

const DatePicker = ({ selectedDate, onDateSelect, error }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 데이트 피커 관련 함수들
  const formatDate = (date) => {
    // UTC 기준으로 변환하여 시간대 문제 방지
    const d = new Date(date);
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // 이전 달의 마지막 날들
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonth.getDate() - i)
      });
    }
    
    // 현재 달의 날들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month, day)
      });
    }
    
    // 다음 달의 첫 날들 (6주를 채우기 위해)
    const remainingDays = 42 - days.length; // 6주 * 7일 = 42
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, day)
      });
    }
    
    return days;
  };

  const handleDateSelect = (day) => {
    const selectedDate = formatDate(day.fullDate);
    onDateSelect(selectedDate);
    setShowDatePicker(false);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const isToday = (day) => {
    const today = new Date();
    return day.fullDate.toDateString() === today.toDateString();
  };

  const isSelected = (day) => {
    return formatDate(day.fullDate) === selectedDate;
  };

  // 데이트 피커 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && !event.target.closest('.date-picker-container')) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  return (
    <div>
      <label className="block text-white text-sm font-medium mb-2">
        날짜 *
      </label>
      <div className="relative date-picker-container">
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-300 focus:outline-none text-left"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderColor: error ? '#FF2B3D' : '#666666',
            color: '#FFFFFF'
          }}
        >
          {selectedDate ? new Date(selectedDate).toLocaleDateString('ko-KR') : '날짜를 선택해주세요'}
        </button>
        
        {showDatePicker && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200">
            {/* 달력 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-lg font-semibold text-gray-800">
                {currentMonth.getFullYear()}.{(currentMonth.getMonth() + 1).toString().padStart(2, '0')}
              </h3>
              
              <button
                type="button"
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* 달력 그리드 */}
            <div className="grid grid-cols-7 gap-1 p-2">
              {getDaysInMonth(currentMonth).map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`
                    w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
                    ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-800 hover:bg-gray-100'}
                    ${isToday(day) ? 'bg-green-500 text-white' : ''}
                    ${isSelected(day) ? 'bg-blue-500 text-white' : ''}
                    ${!day.isCurrentMonth && isToday(day) ? 'bg-green-500 text-white' : ''}
                  `}
                >
                  {day.date}
                  {isToday(day) && (
                    <div className="text-xs">오늘</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm mt-1" style={{ color: '#FF2B3D' }}>{error}</p>
      )}
    </div>
  );
};

export default DatePicker;



