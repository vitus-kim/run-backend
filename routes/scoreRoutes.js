const express = require('express');
const scoreController = require('../controllers/scoreController');
const debugController = require('../controllers/debugController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// 모든 라우트는 인증이 필요함
router.use(authenticateToken);

// POST /api/scores/calculate - 주간 점수 계산 및 저장
router.post('/calculate', scoreController.calculateWeeklyScore);

// GET /api/scores/weekly - 주간 점수 조회
router.get('/weekly', scoreController.getWeeklyScore);

// GET /api/scores/rankings - 점수 랭킹 조회
router.get('/rankings', scoreController.getScoreRankings);

// GET /api/scores/history - 사용자 점수 히스토리
router.get('/history', scoreController.getScoreHistory);

// GET /api/scores/test - 테스트용 랭킹 조회
router.get('/test', scoreController.testRankings);

// GET /api/scores/debug - 디버깅용 데이터 확인 (인증 없이)
router.get('/debug', debugController.debugData);

// POST /api/scores/manual-calculate - 수동 점수 계산 (디버깅용)
router.post('/manual-calculate', scoreController.manualCalculateScore);

module.exports = router;
