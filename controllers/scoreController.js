const { sendSuccess, sendError, sendValidationError, sendNotFoundError } = require('../utils/responseHelper');
const { validateDate, handleMongooseError } = require('../utils/validationHelper');
const { calculateWeekStart } = require('../utils/dateHelper');
const { 
  determineWeekStart, 
  determineWeekStartWithVitus, 
  calculateWeeklyStats, 
  createOrUpdateScore, 
  getSortCriteria, 
  createEmptyRankingResponse,
  updateAllRankings 
} = require('../utils/scoreHelper');
const { getWeeklyScoreQuery, getScoreRankingsQuery, getScoreHistoryQuery } = require('../utils/scoreQueryHelper');

// POST /api/scores/calculate - 주간 점수 계산 및 저장
const calculateWeeklyScore = async (req, res) => {
  try {
    const { weekStart } = req.body;
    const userId = req.user._id;
    
    // 날짜 검증
    if (weekStart && !validateDate(weekStart)) {
      return sendValidationError(res, ['올바른 날짜 형식이 아닙니다']);
    }
    
    // 주간 시작일 결정
    const targetWeekStart = await determineWeekStart(weekStart, userId);
    
    // 주간 통계 계산
    const stats = await calculateWeeklyStats(userId, targetWeekStart);
    
    // 점수 레코드 생성 또는 업데이트
    const savedScore = await createOrUpdateScore(userId, targetWeekStart, stats);
    
    // 랭킹 업데이트
    await updateAllRankings(targetWeekStart);
    
    return sendSuccess(res, {
      score: savedScore
    }, '주간 점수가 계산되었습니다');
    
  } catch (error) {
    console.error('점수 계산 오류:', error);
    
    if (error.message === '런닝 기록이 없습니다') {
      return sendNotFoundError(res, error.message);
    }
    
    const errorInfo = handleMongooseError(error);
    return sendError(res, errorInfo.message);
  }
};

// GET /api/scores/weekly - 주간 점수 조회
const getWeeklyScore = async (req, res) => {
  try {
    const { weekStart } = req.query;
    const userId = req.user._id;
    
    const targetWeekStart = weekStart ? new Date(weekStart) : calculateWeekStart();
    const score = await getWeeklyScoreQuery(userId, targetWeekStart);
    
    if (!score) {
      return sendNotFoundError(res, '해당 주의 점수 데이터가 없습니다');
    }
    
    return sendSuccess(res, { score });
    
  } catch (error) {
    console.error('점수 조회 오류:', error);
    return sendError(res, '점수 조회에 실패했습니다');
  }
};

// GET /api/scores/rankings - 점수 랭킹 조회
const getScoreRankings = async (req, res) => {
  try {
    const { weekStart, type = 'overall', page = 1, limit = 10 } = req.query;
    
    console.log('랭킹 조회 요청:', { weekStart, type, page, limit });
    
    // 간단한 실제 랭킹 조회
    const Score = require('../models/Score');
    
    // 최신 점수 데이터 조회
    const scores = await Score.find({ isActive: true })
      .populate('userId', 'nickname email')
      .sort({ totalScore: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Score.countDocuments({ isActive: true });
    
    console.log('랭킹 조회 결과:', { rankingsCount: scores.length, total });
    
    return sendSuccess(res, {
      weekStart: scores.length > 0 ? scores[0].weekStart : null,
      type: type,
      rankings: scores,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('랭킹 조회 오류:', error);
    console.error('에러 스택:', error.stack);
    return sendError(res, '랭킹 조회에 실패했습니다');
  }
};

// GET /api/scores/history - 사용자 점수 히스토리
const getScoreHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    
    const paginationOptions = buildPaginationOptions(page, limit);
    const { scores, pagination } = await getScoreHistoryQuery(userId, paginationOptions);
    
    return sendSuccess(res, {
      scores: scores,
      pagination: pagination
    });
    
  } catch (error) {
    console.error('점수 히스토리 조회 오류:', error);
    return sendError(res, '점수 히스토리 조회에 실패했습니다');
  }
};


// 테스트용 간단한 랭킹 조회
const testRankings = async (req, res) => {
  try {
    console.log('테스트 랭킹 조회 시작');
    
    // 간단한 응답 반환
    return res.json({
      success: true,
      message: '테스트 성공',
      data: {
        rankings: [],
        weekStart: null,
        type: 'overall'
      }
    });
  } catch (error) {
    console.error('테스트 랭킹 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '테스트 실패',
      error: error.message
    });
  }
};

// 수동 점수 계산 (디버깅용)
const manualCalculateScore = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('=== 수동 점수 계산 시작 ===');
    console.log('사용자 ID:', userId);
    
    const { calculateUserScore } = require('../utils/scoreCalculator');
    const result = await calculateUserScore(userId, new Date());
    
    return sendSuccess(res, {
      score: result
    }, '수동 점수 계산 완료');
    
  } catch (error) {
    console.error('수동 점수 계산 오류:', error);
    return sendError(res, '수동 점수 계산에 실패했습니다');
  }
};

module.exports = {
  calculateWeeklyScore,
  getWeeklyScore,
  getScoreRankings,
  getScoreHistory,
  testRankings,
  manualCalculateScore
};
