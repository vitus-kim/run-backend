import React from 'react';
import RankingCard from './RankingCard';

const RankingList = ({ rankings, activeTab, currentPage, rankingsLoading }) => {
  if (rankingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg">랭킹을 불러오는 중...</div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-white text-lg mb-2">아직 랭킹 데이터가 없습니다</div>
        <div className="text-sm" style={{ color: '#999999' }}>
          첫 번째 런닝 기록을 작성해보세요!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {rankings.map((score, index) => (
        <RankingCard
          key={score._id || index}
          score={score}
          index={index}
          activeTab={activeTab}
          currentPage={currentPage}
        />
      ))}
    </div>
  );
};

export default RankingList;


