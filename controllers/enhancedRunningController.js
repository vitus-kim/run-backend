const EnhancedRunning = require('../models/EnhancedRunning');
const PerformanceAnalytics = require('../models/PerformanceAnalytics');
const GrowthDashboard = require('../models/GrowthDashboard');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// 런닝 기록 생성
const createRunning = async (req, res) => {
  try {
    const userId = req.user.id;
    const runningData = {
      ...req.body,
      userId
    };

    const running = new EnhancedRunning(runningData);
    await running.save();

    // 성능 분석 업데이트
    await updatePerformanceAnalytics(userId, running);
    
    // 대시보드 업데이트
    await updateGrowthDashboard(userId);

    res.status(201).json(successResponse('런닝 기록이 생성되었습니다.', running));
  } catch (error) {
    console.error('런닝 기록 생성 실패:', error);
    res.status(500).json(errorResponse('런닝 기록 생성에 실패했습니다.', error.message));
  }
};

// 런닝 기록 조회 (사용자별)
const getRunningsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const runnings = await EnhancedRunning.find({ userId, isActive: true })
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'nickname email');

    const total = await EnhancedRunning.countDocuments({ userId, isActive: true });

    res.json(successResponse('런닝 기록을 조회했습니다.', {
      runnings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }));
  } catch (error) {
    console.error('런닝 기록 조회 실패:', error);
    res.status(500).json(errorResponse('런닝 기록 조회에 실패했습니다.', error.message));
  }
};

// 런닝 기록 상세 조회
const getRunningById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const running = await EnhancedRunning.findOne({ _id: id, userId, isActive: true })
      .populate('userId', 'nickname email');

    if (!running) {
      return res.status(404).json(errorResponse('런닝 기록을 찾을 수 없습니다.'));
    }

    res.json(successResponse('런닝 기록을 조회했습니다.', running));
  } catch (error) {
    console.error('런닝 기록 조회 실패:', error);
    res.status(500).json(errorResponse('런닝 기록 조회에 실패했습니다.', error.message));
  }
};

// 런닝 기록 수정
const updateRunning = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const running = await EnhancedRunning.findOneAndUpdate(
      { _id: id, userId, isActive: true },
      updateData,
      { new: true, runValidators: true }
    );

    if (!running) {
      return res.status(404).json(errorResponse('런닝 기록을 찾을 수 없습니다.'));
    }

    // 성능 분석 업데이트
    await updatePerformanceAnalytics(userId, running);
    
    // 대시보드 업데이트
    await updateGrowthDashboard(userId);

    res.json(successResponse('런닝 기록이 수정되었습니다.', running));
  } catch (error) {
    console.error('런닝 기록 수정 실패:', error);
    res.status(500).json(errorResponse('런닝 기록 수정에 실패했습니다.', error.message));
  }
};

// 런닝 기록 삭제
const deleteRunning = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const running = await EnhancedRunning.findOneAndUpdate(
      { _id: id, userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!running) {
      return res.status(404).json(errorResponse('런닝 기록을 찾을 수 없습니다.'));
    }

    // 성능 분석 업데이트
    await updatePerformanceAnalytics(userId, null, true);
    
    // 대시보드 업데이트
    await updateGrowthDashboard(userId);

    res.json(successResponse('런닝 기록이 삭제되었습니다.'));
  } catch (error) {
    console.error('런닝 기록 삭제 실패:', error);
    res.status(500).json(errorResponse('런닝 기록 삭제에 실패했습니다.', error.message));
  }
};

// 개인 기록 조회
const getPersonalRecords = async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await EnhancedRunning.aggregate([
      { $match: { userId: userId, isActive: true } },
      {
        $group: {
          _id: null,
          bestScore: { $max: '$totalScore' },
          bestScoreDate: { $first: '$date' },
          longestDistance: { $max: '$distance' },
          longestDistanceDate: { $first: '$date' },
          fastestSpeed: { $max: '$avgSpeed' },
          fastestSpeedDate: { $first: '$date' },
          longestDuration: { $max: '$duration' },
          longestDurationDate: { $first: '$date' },
          totalRuns: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          totalDuration: { $sum: '$duration' },
          avgScore: { $avg: '$totalScore' },
          avgDistance: { $avg: '$distance' },
          avgSpeed: { $avg: '$avgSpeed' }
        }
      }
    ]);

    if (records.length === 0) {
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

    res.json(successResponse('개인 기록을 조회했습니다.', records[0]));
  } catch (error) {
    console.error('개인 기록 조회 실패:', error);
    res.status(500).json(errorResponse('개인 기록 조회에 실패했습니다.', error.message));
  }
};

// 점수 통계 조회
const getScoreStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'monthly' } = req.query;

    let startDate;
    const now = new Date();

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const stats = await EnhancedRunning.aggregate([
      {
        $match: {
          userId: userId,
          isActive: true,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalScore: { $sum: '$totalScore' },
          avgScore: { $avg: '$totalScore' },
          maxScore: { $max: '$totalScore' },
          minScore: { $min: '$totalScore' },
          runCount: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          totalDuration: { $sum: '$duration' },
          avgDistance: { $avg: '$distance' },
          avgSpeed: { $avg: '$avgSpeed' }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json(successResponse('점수 통계를 조회했습니다.', {
        totalScore: 0,
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
        runCount: 0,
        totalDistance: 0,
        totalDuration: 0,
        avgDistance: 0,
        avgSpeed: 0
      }));
    }

    res.json(successResponse('점수 통계를 조회했습니다.', stats[0]));
  } catch (error) {
    console.error('점수 통계 조회 실패:', error);
    res.status(500).json(errorResponse('점수 통계 조회에 실패했습니다.', error.message));
  }
};

// 성능 분석 업데이트 헬퍼 함수
const updatePerformanceAnalytics = async (userId, running, isDelete = false) => {
  try {
    const now = new Date();
    
    // 일별 분석 업데이트
    const dailyStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    await updateAnalyticsForPeriod(userId, 'daily', dailyStart, now);

    // 주별 분석 업데이트
    const dayOfWeek = now.getDay();
    const weeklyStart = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
    await updateAnalyticsForPeriod(userId, 'weekly', weeklyStart, now);

    // 월별 분석 업데이트
    const monthlyStart = new Date(now.getFullYear(), now.getMonth(), 1);
    await updateAnalyticsForPeriod(userId, 'monthly', monthlyStart, now);

  } catch (error) {
    console.error('성능 분석 업데이트 실패:', error);
  }
};

// 특정 기간의 분석 업데이트
const updateAnalyticsForPeriod = async (userId, period, periodStart, periodEnd) => {
  const analytics = await PerformanceAnalytics.findOne({
    userId,
    period,
    periodStart
  });

  if (!analytics) {
    // 새 분석 생성
    const newAnalytics = new PerformanceAnalytics({
      userId,
      period,
      periodStart,
      periodEnd
    });
    await newAnalytics.save();
  } else {
    // 기존 분석 업데이트
    await analytics.save();
  }
};

// 대시보드 업데이트 헬퍼 함수
const updateGrowthDashboard = async (userId) => {
  try {
    let dashboard = await GrowthDashboard.findOne({ userId });
    
    if (!dashboard) {
      dashboard = new GrowthDashboard({ userId });
    }

    // 최근 데이터로 업데이트
    await dashboard.save();
  } catch (error) {
    console.error('대시보드 업데이트 실패:', error);
  }
};

module.exports = {
  createRunning,
  getRunningsByUser,
  getRunningById,
  updateRunning,
  deleteRunning,
  getPersonalRecords,
  getScoreStats
};

