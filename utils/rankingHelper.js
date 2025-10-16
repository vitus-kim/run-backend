const Running = require('../models/Running');

// 공통 랭킹 파이프라인 생성
const createRankingPipeline = (weekStart, groupFields, sortField, additionalMatch = {}) => {
  const baseMatch = {
    isActive: true,
    weekStart: weekStart,
    ...additionalMatch
  };

  const groupStage = {
    _id: '$userId',
    ...groupFields
  };

  return [
    { $match: baseMatch },
    { $group: groupStage },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: '$_id',
        nickname: '$user.nickname',
        ...Object.keys(groupFields).reduce((acc, key) => {
          acc[key] = key.includes('Speed') ? { $round: ['$' + key, 2] } : 1;
          return acc;
        }, {})
      }
    },
    { $sort: { [sortField]: -1 } }
  ];
};

// 전체 랭킹 파이프라인
const getOverallRankingPipeline = (weekStart) => {
  return createRankingPipeline(
    weekStart,
    {
      totalDistance: { $sum: '$distance' },
      totalDuration: { $sum: '$duration' },
      avgSpeed: { $avg: '$avgSpeed' },
      totalScore: { $sum: '$runningScore' },
      runCount: { $sum: 1 }
    },
    'totalScore'
  );
};

// 거리 랭킹 파이프라인
const getDistanceRankingPipeline = (weekStart) => {
  return createRankingPipeline(
    weekStart,
    { totalDistance: { $sum: '$distance' } },
    'totalDistance'
  );
};

// 속도 랭킹 파이프라인
const getSpeedRankingPipeline = (weekStart) => {
  return createRankingPipeline(
    weekStart,
    {
      avgSpeed: { $avg: '$avgSpeed' },
      runCount: { $sum: 1 }
    },
    'avgSpeed',
    { runCount: { $gte: 2 } } // 최소 2회 이상 런닝한 사용자만
  );
};

// 랭킹 조회 실행
const executeRankingQuery = async (pipeline) => {
  return await Running.aggregate(pipeline);
};

module.exports = {
  getOverallRankingPipeline,
  getDistanceRankingPipeline,
  getSpeedRankingPipeline,
  executeRankingQuery
};



