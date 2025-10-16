const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getCardData,
  getGraphData,
  getGrowthAnalysis,
  getPersonalRecords,
  setGoals,
  getGoalAchievement
} = require('../controllers/growthDashboardController');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 대시보드 조회
router.get('/', getDashboard);

// 카드 데이터 조회
router.get('/cards', getCardData);

// 그래프 데이터 조회
router.get('/graphs', getGraphData);

// 성장 분석 조회
router.get('/analysis', getGrowthAnalysis);

// 개인 기록 조회
router.get('/records', getPersonalRecords);

// 목표 설정
router.post('/goals', setGoals);

// 목표 달성률 조회
router.get('/goals/achievement', getGoalAchievement);

module.exports = router;
