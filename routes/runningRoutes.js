const express = require('express');
const runningController = require('../controllers/runningController');
const rankingController = require('../controllers/rankingController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// 모든 라우트는 인증이 필요함
router.use(authenticateToken);

// POST /api/running - 새로운 런닝 기록 생성
router.post('/', runningController.createRunning);

// GET /api/running - 사용자의 런닝 기록 조회
router.get('/', runningController.getRunnings);

// GET /api/running/rankings - 주간 종합 랭킹
router.get('/rankings', rankingController.getOverallRankings);

// GET /api/running/rankings/distance - 거리 랭킹
router.get('/rankings/distance', rankingController.getDistanceRankings);

// GET /api/running/rankings/speed - 속도 랭킹
router.get('/rankings/speed', rankingController.getSpeedRankings);


module.exports = router;
