const Running = require('../models/Running');
const EnhancedRunning = require('../models/EnhancedRunning');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// 기존 Running 데이터를 EnhancedRunning으로 마이그레이션
const migrateRunningData = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('=== 마이그레이션 시작 ===');
    console.log('사용자 ID:', userId);

    // 기존 Running 데이터 조회
    const existingRunnings = await Running.find({ userId, isActive: true });
    console.log('기존 런닝 데이터 개수:', existingRunnings.length);

    if (existingRunnings.length === 0) {
      return res.json(successResponse('마이그레이션할 데이터가 없습니다.', { migrated: 0 }));
    }

    let migratedCount = 0;
    const errors = [];

    for (const running of existingRunnings) {
      try {
        // EnhancedRunning에 이미 존재하는지 확인
        const existingEnhanced = await EnhancedRunning.findOne({
          userId: running.userId,
          date: running.date,
          distance: running.distance,
          duration: running.duration
        });

        if (existingEnhanced) {
          console.log('이미 존재하는 데이터 건너뛰기:', running._id);
          continue;
        }

        // EnhancedRunning 데이터 생성
        const enhancedRunningData = {
          userId: running.userId,
          distance: running.distance,
          duration: running.duration,
          date: running.date,
          type: running.type || 'easy',
          weather: running.weather || 'sunny',
          feeling: running.feeling || 'good',
          notes: running.notes,
          weekStart: running.weekStart,
          isActive: running.isActive
        };

        const enhancedRunning = new EnhancedRunning(enhancedRunningData);
        await enhancedRunning.save();

        console.log('마이그레이션 완료:', running._id, '->', enhancedRunning._id);
        migratedCount++;

      } catch (error) {
        console.error('개별 데이터 마이그레이션 실패:', running._id, error.message);
        errors.push({
          originalId: running._id,
          error: error.message
        });
      }
    }

    console.log('=== 마이그레이션 완료 ===');
    console.log('마이그레이션된 데이터:', migratedCount);
    console.log('에러 개수:', errors.length);

    res.json(successResponse('데이터 마이그레이션이 완료되었습니다.', {
      migrated: migratedCount,
      total: existingRunnings.length,
      errors: errors
    }));

  } catch (error) {
    console.error('마이그레이션 실패:', error);
    res.status(500).json(errorResponse('데이터 마이그레이션에 실패했습니다.', error.message));
  }
};

// 사용자의 모든 런닝 데이터 조회 (기존 + 새로운)
const getAllRunnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;

    console.log('=== 모든 런닝 데이터 조회 ===');
    console.log('사용자 ID:', userId);

    // 기존 Running 데이터 조회
    const existingRunnings = await Running.find({ userId, isActive: true })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .populate('userId', 'nickname email');

    // EnhancedRunning 데이터 조회
    const enhancedRunnings = await EnhancedRunning.find({ userId, isActive: true })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .populate('userId', 'nickname email');

    console.log('기존 런닝 데이터:', existingRunnings.length);
    console.log('새로운 런닝 데이터:', enhancedRunnings.length);

    // 데이터 통합 및 정렬
    const allRunnings = [...existingRunnings, ...enhancedRunnings]
      .sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRunnings = allRunnings.slice(startIndex, endIndex);

    const total = allRunnings.length;
    const totalPages = Math.ceil(total / limit);

    console.log('총 데이터:', total);
    console.log('페이지네이션된 데이터:', paginatedRunnings.length);

    res.json(successResponse('런닝 기록을 조회했습니다.', {
      runnings: paginatedRunnings,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total
      }
    }));

  } catch (error) {
    console.error('런닝 기록 조회 실패:', error);
    res.status(500).json(errorResponse('런닝 기록 조회에 실패했습니다.', error.message));
  }
};

// 개인 기록 조회 (기존 + 새로운)
const getPersonalRecordsCombined = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('=== 개인 기록 조회 ===');
    console.log('사용자 ID:', userId);

    // Running 데이터만 사용 (그래프와 일치시키기 위해)
    const existingRunnings = await Running.find({ userId, isActive: true });
    
    // EnhancedRunning 데이터는 사용하지 않음
    const enhancedRunnings = [];

    console.log('기존 런닝 데이터:', existingRunnings.length);
    console.log('새로운 런닝 데이터:', enhancedRunnings.length);

    // Running 데이터만 사용
    const allRunnings = existingRunnings;

    if (allRunnings.length === 0) {
      return res.json(successResponse('개인 기록을 조회했습니다.', {
        bestScore: 0,
        longestDistance: 0,
        fastestSpeed: 0,
        longestDuration: 0,
        totalRuns: 0,
        totalDistance: 0,
        totalDuration: 0,
        avgScore: 0,
        avgDistance: 0,
        avgSpeed: 0
      }));
    }

    // 통계 계산
    const totalRuns = allRunnings.length;
    const totalDistance = allRunnings.reduce((sum, run) => sum + (run.distance || 0), 0);
    const totalDuration = allRunnings.reduce((sum, run) => sum + (run.duration || 0), 0);
    
    const scores = allRunnings.map(run => run.runningScore || 0);
    const distances = allRunnings.map(run => run.distance || 0);
    const speeds = allRunnings.map(run => run.avgSpeed || 0);
    const durations = allRunnings.map(run => run.duration || 0);

    const bestScore = Math.max(...scores);
    const longestDistance = Math.max(...distances);
    const fastestSpeed = Math.max(...speeds);
    const longestDuration = Math.max(...durations);

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / totalRuns;
    const avgDistance = totalDistance / totalRuns;
    const avgSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / totalRuns;

    console.log('개인 기록 계산 완료:', {
      totalRuns,
      totalDistance,
      bestScore,
      longestDistance,
      fastestSpeed
    });

    res.json(successResponse('개인 기록을 조회했습니다.', {
      bestScore,
      longestDistance,
      fastestSpeed,
      longestDuration,
      totalRuns,
      totalDistance,
      totalDuration,
      avgScore,
      avgDistance,
      avgSpeed
    }));

  } catch (error) {
    console.error('개인 기록 조회 실패:', error);
    res.status(500).json(errorResponse('개인 기록 조회에 실패했습니다.', error.message));
  }
};

module.exports = {
  migrateRunningData,
  getAllRunnings,
  getPersonalRecordsCombined
};

