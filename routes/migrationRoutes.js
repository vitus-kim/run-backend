const express = require('express');
const router = express.Router();
const {
  migrateRunningData,
  getAllRunnings,
  getPersonalRecordsCombined
} = require('../controllers/migrationController');
const { authenticateToken } = require('../middleware/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 기존 Running 데이터를 EnhancedRunning으로 마이그레이션
router.post('/migrate', migrateRunningData);

// 모든 런닝 데이터 조회 (기존 + 새로운)
router.get('/runnings', getAllRunnings);

// 개인 기록 조회 (기존 + 새로운)
router.get('/personal-records', getPersonalRecordsCombined);

module.exports = router;
