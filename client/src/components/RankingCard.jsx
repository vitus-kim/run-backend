import React from 'react';

const RankingCard = ({ score, index, activeTab, currentPage }) => {
  const user = score.userId; // populate된 사용자 정보
  const globalIndex = (currentPage - 1) * 10 + index;
  
  return (
    <div 
      key={score._id || index}
      className="p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: globalIndex < 3 ? '#0DFCBD' : '#666666',
        boxShadow: globalIndex < 3 ? '0 0 20px rgba(13, 252, 189, 0.3)' : 'none'
      }}
    >
      <div className="flex items-center justify-between">
        {/* 순위 및 사용자 정보 */}
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              backgroundColor: globalIndex < 3 ? '#0DFCBD' : '#666666',
              color: '#000000'
            }}
          >
            {globalIndex + 1}
          </div>
          <div className="text-2xl">🏃‍♂️</div>
          <div>
            <div className="text-white font-medium">{user?.nickname || '익명'}</div>
            <div className="text-sm" style={{ color: '#999999' }}>
              {activeTab === 'overall' ? `${score.runCount || 0}회 런닝` : 
               activeTab === 'distance' ? `${(score.totalDistance || 0).toFixed(1)}km` :
               `${(score.avgSpeed || 0).toFixed(1)}km/h`}
            </div>
          </div>
        </div>

        {/* 기록 정보 */}
        <div className="text-right">
          {activeTab === 'overall' && (
            <>
              <div className="text-white font-bold">{(score.totalScore || 0).toFixed(2)}점</div>
              <div className="text-sm" style={{ color: '#0DFCBD' }}>
                {(score.totalDistance || 0).toFixed(1)}km
              </div>
              <div className="text-xs" style={{ color: '#999999' }}>
                평균: {(score.avgSpeed || 0).toFixed(1)}km/h
              </div>
            </>
          )}
          {activeTab === 'distance' && (
            <>
              <div className="text-white font-bold">{(score.totalDistance || 0).toFixed(1)}km</div>
              <div className="text-sm" style={{ color: '#0DFCBD' }}>
                총 거리
              </div>
              <div className="text-xs" style={{ color: '#999999' }}>
                {score.runCount || 0}회 런닝
              </div>
            </>
          )}
          {activeTab === 'speed' && (
            <>
              <div className="text-white font-bold">{(score.avgSpeed || 0).toFixed(1)}km/h</div>
              <div className="text-sm" style={{ color: '#0DFCBD' }}>
                평균 속도
              </div>
              <div className="text-xs" style={{ color: '#999999' }}>
                {score.runCount || 0}회 런닝
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingCard;



