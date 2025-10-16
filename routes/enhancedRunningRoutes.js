const express = require('express');
const router = express.Router();
const {
  createRunning,
  getRunningsByUser,
  getRunningById,
  updateRunning,
  deleteRunning,
  getPersonalRecords,
  getScoreStats
} = require('../controllers/enhancedRunningController');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 런닝 기록 생성
router.post('/', createRunning);

// 사용자별 런닝 기록 조회
router.get('/', getRunningsByUser);

// 런닝 기록 상세 조회
router.get('/:id', getRunningById);

// 런닝 기록 수정
router.put('/:id', updateRunning);

// 런닝 기록 삭제
router.delete('/:id', deleteRunning);

// 개인 기록 조회
router.get('/records/personal', getPersonalRecords);

// 점수 통계 조회
router.get('/stats/scores', getScoreStats);

module.exports = router;
