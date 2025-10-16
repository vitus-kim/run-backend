const Score = require('../models/Score');
const { buildPaginationOptions, buildPaginationResponse } = require('./queryHelper');

// 주간 점수 조회
const getWeeklyScoreQuery = async (userId, weekStart) => {
  return await Score.findOne({
    userId: userId,
    weekStart: weekStart
  }).populate('userId', 'nickname email');
};

// 점수 랭킹 조회
const getScoreRankingsQuery = async (weekStart, sortCriteria, paginationOptions) => {
  const rankings = await Score.find({
    weekStart: weekStart,
    isActive: true
  })
  .populate('userId', 'nickname email')
  .sort(sortCriteria)
  .skip(paginationOptions.skip)
  .limit(paginationOptions.limit);
  
  const total = await Score.countDocuments({
    weekStart: weekStart,
    isActive: true
  });
  
  return {
    rankings,
    total,
    pagination: buildPaginationResponse(rankings, total, paginationOptions)
  };
};

// 사용자 점수 히스토리 조회
const getScoreHistoryQuery = async (userId, paginationOptions) => {
  const scores = await Score.find({
    userId: userId,
    isActive: true
  })
  .sort({ weekStart: -1 })
  .skip(paginationOptions.skip)
  .limit(paginationOptions.limit);
  
  const total = await Score.countDocuments({
    userId: userId,
    isActive: true
  });
  
  return {
    scores,
    total,
    pagination: buildPaginationResponse(scores, total, paginationOptions)
  };
};

module.exports = {
  getWeeklyScoreQuery,
  getScoreRankingsQuery,
  getScoreHistoryQuery
};



