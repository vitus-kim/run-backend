const Running = require('../models/Running');
const EnhancedRunning = require('../models/EnhancedRunning');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const cacheHelper = require('../utils/cacheHelper');

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

// 사용자의 모든 런닝 데이터 조회 (캐싱 적용 버전)
const getAllRunnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;

    console.log('=== 캐싱 적용된 런닝 데이터 조회 ===');
    console.log('사용자 ID:', userId);
    console.log('정렬:', sortBy, sortOrder);

    const startTime = Date.now();

    // 캐시 키 생성
    const cacheKey = cacheHelper.getUserCacheKey(userId, 'runnings', { page, limit, sortBy, sortOrder });
    
    // 캐시에서 데이터 조회 시도
    const cachedData = await cacheHelper.get(cacheKey);
    if (cachedData) {
      console.log('캐시에서 데이터 조회 성공');
      const endTime = Date.now();
      console.log(`캐시 조회 시간: ${endTime - startTime}ms`);
      
      return res.json(successResponse('런닝 기록을 조회했습니다.', cachedData));
    }

    // 캐시에 없으면 데이터베이스에서 조회
    console.log('캐시에 데이터 없음, 데이터베이스에서 조회');
    
    // MongoDB 집계 파이프라인으로 최적화된 쿼리
    const pipeline = [
      {
        $match: { 
          userId: userId, 
          isActive: true 
        }
      },
      {
        $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
      },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: parseInt(limit) }
          ],
          totalCount: [
            { $count: "count" }
          ]
        }
      }
    ];

    const [result] = await Running.aggregate(pipeline);
    const runnings = result.data || [];
    const total = result.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    const responseData = {
      runnings: runnings,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total
      }
    };

    // 캐시에 저장 (5분 TTL)
    await cacheHelper.set(cacheKey, responseData, 300);

    const endTime = Date.now();
    console.log(`쿼리 실행 시간: ${endTime - startTime}ms`);
    console.log('조회된 데이터:', runnings.length);
    console.log('총 데이터:', total);

    res.json(successResponse('런닝 기록을 조회했습니다.', responseData));

  } catch (error) {
    console.error('런닝 기록 조회 실패:', error);
    res.status(500).json(errorResponse('런닝 기록 조회에 실패했습니다.', error.message));
  }
};

// 개인 기록 조회 (최적화된 버전)
const getPersonalRecordsCombined = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('=== 최적화된 개인 기록 조회 ===');
    console.log('사용자 ID:', userId);

    const startTime = Date.now();

    // MongoDB 집계 파이프라인으로 통계 계산
    const pipeline = [
      {
        $match: { 
          userId: userId, 
          isActive: true 
        }
      },
      {
        $group: {
          _id: null,
          totalRuns: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          totalDuration: { $sum: '$duration' },
          bestScore: { $max: '$runningScore' },
          longestDistance: { $max: '$distance' },
          fastestSpeed: { $max: '$avgSpeed' },
          longestDuration: { $max: '$duration' },
          avgScore: { $avg: '$runningScore' },
          avgDistance: { $avg: '$distance' },
          avgSpeed: { $avg: '$avgSpeed' }
        }
      }
    ];

    const [stats] = await Running.aggregate(pipeline);

    const endTime = Date.now();
    console.log(`통계 계산 시간: ${endTime - startTime}ms`);

    if (!stats) {
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

    console.log('개인 기록 계산 완료:', {
      totalRuns: stats.totalRuns,
      totalDistance: stats.totalDistance,
      bestScore: stats.bestScore
    });

    res.json(successResponse('개인 기록을 조회했습니다.', {
      bestScore: stats.bestScore || 0,
      longestDistance: stats.longestDistance || 0,
      fastestSpeed: stats.fastestSpeed || 0,
      longestDuration: stats.longestDuration || 0,
      totalRuns: stats.totalRuns || 0,
      totalDistance: stats.totalDistance || 0,
      totalDuration: stats.totalDuration || 0,
      avgScore: Math.round((stats.avgScore || 0) * 100) / 100,
      avgDistance: Math.round((stats.avgDistance || 0) * 100) / 100,
      avgSpeed: Math.round((stats.avgSpeed || 0) * 100) / 100
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

