import React from 'react';

const TrendGraph = ({ data, period }) => {
  // 데이터 타입 확인 및 배열 변환
  let graphData = [];
  
  if (Array.isArray(data)) {
    graphData = data;
  } else if (data && typeof data === 'object') {
    // 객체인 경우 배열로 변환 시도
    if (data.data && Array.isArray(data.data)) {
      graphData = data.data;
    } else if (data.graphData && Array.isArray(data.graphData)) {
      graphData = data.graphData;
    } else {
      // 객체의 값들을 배열로 변환
      graphData = Object.values(data).filter(item => 
        typeof item === 'object' && item !== null
      );
    }
  }

  // 데이터가 없을 때의 기본값
  if (!graphData || graphData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <div className="text-lg mb-2">📊</div>
          <div>데이터가 없습니다</div>
        </div>
      </div>
    );
  }

  // 그래프 크기 설정 - Y축 라벨을 위한 더 작은 크기
  const width = 350;
  const height = 180;
  const padding = 25;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // 점수 데이터 추출
  const scores = graphData.map(item => item.score || 0);
  const maxScore = Math.max(...scores, 100); // 최소 100으로 설정
  const minScore = Math.min(...scores, 0);

  // 좌표 계산 함수 - 완전히 새로운 계산 방식
  const getX = (index) => {
    if (graphData.length === 1) {
      return padding + chartWidth / 2; // 데이터가 1개일 때 가운데
    }
    // 각 데이터 포인트가 차트 영역 내에 정확히 위치하도록 계산
    const step = chartWidth / (graphData.length - 1);
    return padding + (index * step);
  };
  const getY = (score) => {
    if (maxScore === minScore) return padding + chartHeight / 2;
    return padding + chartHeight - ((score - minScore) / (maxScore - minScore)) * chartHeight;
  };

  // 선 경로 생성
  const pathData = graphData.map((item, index) => {
    const x = getX(index);
    const y = getY(item.score || 0);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // 점들 생성
  const points = graphData.map((item, index) => {
    const x = getX(index);
    const y = getY(item.score || 0);
    return { x, y, score: item.score || 0, date: item.date };
  });

  // 기간별 라벨 생성
  const getLabel = (item, index) => {
    if (!item.date) return '';
    
    const date = new Date(item.date);
    switch (period) {
      case 'daily':
        return `${date.getMonth() + 1}/${date.getDate()}`;
      case 'weekly':
        return `W${Math.ceil(date.getDate() / 7)}`;
      case 'monthly':
        return `${date.getMonth() + 1}월`;
      default:
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">점수 트렌드</h3>
        <div className="text-sm text-gray-400">
          {period === 'daily' ? '일별' : period === 'weekly' ? '주별' : '월별'} 데이터
        </div>
      </div>
      
      <div className="relative w-full flex justify-center">
        <div className="relative" style={{ width: width }}>
          <svg 
            width={width} 
            height={height} 
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
          >
          {/* 배경 그리드 */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />
          
          {/* Y축 라벨 - 그래프 영역 내부로 조정 */}
          <text x={padding - 5} y={padding + 5} fill="#9CA3AF" fontSize="10" textAnchor="end">
            {maxScore}
          </text>
          <text x={padding - 5} y={padding + chartHeight / 2} fill="#9CA3AF" fontSize="10" textAnchor="end">
            {Math.round((maxScore + minScore) / 2)}
          </text>
          <text x={padding - 5} y={padding + chartHeight - 5} fill="#9CA3AF" fontSize="10" textAnchor="end">
            {minScore}
          </text>
          
          {/* 선 그래프 */}
          <path
            d={pathData}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* 점들 */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#3B82F6"
                stroke="#1E40AF"
                strokeWidth="2"
              />
              {/* 호버 효과를 위한 투명한 큰 원 */}
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="transparent"
                className="cursor-pointer"
              />
            </g>
          ))}
          </svg>
          
          {/* X축 라벨 - 정확한 위치에 배치 */}
          <div className="relative mt-2" style={{ width: width, height: '20px' }}>
          {graphData.map((item, index) => {
            const x = getX(index);
            return (
              <div 
                key={index} 
                className="absolute text-xs text-gray-400 text-center"
                style={{ 
                  left: `${x - 15}px`, 
                  width: '30px',
                  transform: 'translateX(0)'
                }}
              >
                {getLabel(item, index)}
              </div>
            );
          })}
          </div>
        </div>
      </div>
      
      {/* 범례 */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-400">점수</span>
        </div>
        <div className="text-sm text-gray-500">
          최고: {maxScore}점 | 최저: {minScore}점
        </div>
      </div>
    </div>
  );
};

export default TrendGraph;

