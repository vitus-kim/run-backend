import React from 'react';

const RunningRecordCard = ({ 
  record, 
  formatDate, 
  formatDuration, 
  formatPace, 
  scoreGrade 
}) => {
  const getWeatherIcon = (weather) => {
    const icons = {
      sunny: '☀️',
      cloudy: '☁️',
      rainy: '🌧️',
      windy: '💨'
    };
    return icons[weather] || '☀️';
  };

  const getFeelingIcon = (feeling) => {
    const icons = {
      excellent: '😍',
      good: '😊',
      average: '😐',
      poor: '😔'
    };
    return icons[feeling] || '😊';
  };

  const getTypeColor = (type) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      tempo: 'bg-blue-100 text-blue-800',
      interval: 'bg-red-100 text-red-800',
      long: 'bg-purple-100 text-purple-800',
      race: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type) => {
    const labels = {
      easy: '이지',
      tempo: '템포',
      interval: '인터벌',
      long: '롱런',
      race: '레이스'
    };
    return labels[type] || '이지';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors touch-manipulation">
      {/* 상단 정보 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-xl">{getWeatherIcon(record.weather)}</div>
          <div>
            <div className="text-white font-semibold text-sm">
              {formatDate(record.date)}
            </div>
            <div className="text-gray-400 text-xs">
              {getTypeLabel(record.type)} · {getFeelingIcon(record.feeling)}
            </div>
          </div>
        </div>
        
        {/* 점수 등급 */}
        <div className="text-right">
          <div className={`text-xl font-bold ${scoreGrade.color}`}>
            {scoreGrade.grade}
          </div>
          <div className="text-gray-400 text-xs">
            {(record.runningScore || 0).toFixed(2)}점
          </div>
        </div>
      </div>

      {/* 런닝 정보 */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-gray-400 text-xs">거리</div>
          <div className="text-white font-semibold text-sm">
            {record.distance?.toFixed(2) || 0}km
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs">시간</div>
          <div className="text-white font-semibold text-sm">
            {formatDuration(record.duration || 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs">페이스</div>
          <div className="text-white font-semibold text-sm">
            {formatPace(record.pace || (record.distance && record.duration ? record.duration / record.distance : 0))}
          </div>
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <span className="text-gray-400">속도:</span>
            <span className="text-white">
              {(record.avgSpeed || (record.distance && record.duration ? (record.distance / (record.duration / 60)).toFixed(2) : 0))}km/h
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-gray-400">타입:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(record.type)}`}>
              {getTypeLabel(record.type)}
            </span>
          </div>
        </div>
        
        {/* 성장 메타데이터 */}
        {record.growthMetadata?.isPersonalRecord && (
          <div className="flex items-center space-x-1 text-yellow-400">
            <span>🏆</span>
            <span className="text-xs">신기록</span>
          </div>
        )}
      </div>

      {/* 메모 */}
      {record.notes && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-gray-400 text-xs">메모</div>
          <div className="text-white text-xs mt-1">{record.notes}</div>
        </div>
      )}
    </div>
  );
};

export default RunningRecordCard;
