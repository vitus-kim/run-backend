const express = require('express');
const router = express.Router();
const {
  getAnalyticsByPeriod,
  getAnalyticsList,
  getGrowthTrend,
  getRankings,
  getPersonalPerformance,
  updateAnalytics
} = require('../controllers/performanceAnalyticsController');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 성능 분석 조회 (기간별)
router.get('/period', getAnalyticsByPeriod);

// 성능 분석 목록 조회
router.get('/list', getAnalyticsList);

// 성장 추이 조회
router.get('/trend', getGrowthTrend);

// 랭킹 조회
router.get('/rankings', getRankings);

// 개인 성과 분석
router.get('/personal', getPersonalPerformance);

// 성능 분석 수동 업데이트
router.post('/update', updateAnalytics);

module.exports = router;
