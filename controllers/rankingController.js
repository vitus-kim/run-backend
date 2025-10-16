const { sendSuccess, sendError } = require('../utils/responseHelper');
const { calculateWeekStart } = require('../utils/dateHelper');
const { getOverallRankingPipeline, getDistanceRankingPipeline, getSpeedRankingPipeline, executeRankingQuery } = require('../utils/rankingHelper');

// 공통 랭킹 조회 함수
const getRankings = async (req, res, pipelineFunction) => {
  try {
    const { weekStart } = req.query;
    const targetWeekStart = weekStart ? new Date(weekStart) : calculateWeekStart();
    
    const pipeline = pipelineFunction(targetWeekStart);
    const rankings = await executeRankingQuery(pipeline);
    
    return sendSuccess(res, {
      weekStart: targetWeekStart,
      rankings: rankings
    });
  } catch (error) {
    console.error('랭킹 조회 오류:', error);
    return sendError(res, '랭킹을 불러올 수 없습니다');
  }
};

// 전체 랭킹 조회
const getOverallRankings = async (req, res) => {
  return getRankings(req, res, getOverallRankingPipeline);
};

// 거리 랭킹 조회
const getDistanceRankings = async (req, res) => {
  return getRankings(req, res, getDistanceRankingPipeline);
};

// 속도 랭킹 조회
const getSpeedRankings = async (req, res) => {
  return getRankings(req, res, getSpeedRankingPipeline);
};

module.exports = {
  getOverallRankings,
  getDistanceRankings,
  getSpeedRankings
};



