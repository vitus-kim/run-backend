const PerformanceAnalytics = require('../models/PerformanceAnalytics');
const EnhancedRunning = require('../models/EnhancedRunning');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// 기간 계산 헬퍼 함수
const calculatePeriod = (period, startDate, endDate) => {
  if (startDate && endDate) {
    return {
      periodStart: new Date(startDate),
      periodEnd: new Date(endDate)
    };
  }

  const now = new Date();
  const periods = {
    daily: () => {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { periodStart: start, periodEnd: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
    },
    weekly: () => {
      const dayOfWeek = now.getDay();
      const start = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
      return { periodStart: start, periodEnd: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000) };
    },
    monthly: () => {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { periodStart: start, periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
    }
  };

  return periods[period] ? periods[period]() : periods.monthly();
};

// 성능 분석 조회 (기간별)
const getAnalyticsByPeriod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'monthly', startDate, endDate } = req.query;

    const { periodStart, periodEnd } = calculatePeriod(period, startDate, endDate);

    let analytics = await PerformanceAnalytics.findOne({
      userId,
      period,
      periodStart,
      periodEnd
    });

    if (!analytics) {
      analytics = await createAnalyticsForPeriod(userId, period, periodStart, periodEnd);
    }

    res.json(successResponse('성능 분석을 조회했습니다.', analytics));
  } catch (error) {
    console.error('성능 분석 조회 실패:', error);
    res.status(500).json(errorResponse('성능 분석 조회에 실패했습니다.', error.message));
  }
};

// 성능 분석 목록 조회
const getAnalyticsList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'monthly', page = 1, limit = 10 } = req.query;

    const analytics = await PerformanceAnalytics.find({ userId, period, isActive: true })
      .sort({ periodStart: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PerformanceAnalytics.countDocuments({ userId, period, isActive: true });

    res.json(successResponse('성능 분석 목록을 조회했습니다.', {
      analytics,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }));
  } catch (error) {
    console.error('성능 분석 목록 조회 실패:', error);
    res.status(500).json(errorResponse('성능 분석 목록 조회에 실패했습니다.', error.message));
  }
};

// 성장 추이 조회
const getGrowthTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'monthly', months = 12 } = req.query;

    const analytics = await PerformanceAnalytics.find({
      userId,
      period,
      isActive: true
    })
    .sort({ periodStart: -1 })
    .limit(parseInt(months));

    const trendData = analytics.map(analytics => ({
      period: analytics.periodInfo,
      periodStart: analytics.periodStart,
      totalScore: analytics.scoreAnalytics.totalScore,
      avgScore: analytics.scoreAnalytics.avgScore,
      growthRate: analytics.growthMetrics.growthRate,
      trend: analytics.growthMetrics.trend
    }));

    res.json(successResponse('성장 추이를 조회했습니다.', trendData));
  } catch (error) {
    console.error('성장 추이 조회 실패:', error);
    res.status(500).json(errorResponse('성장 추이 조회에 실패했습니다.', error.message));
  }
};

// 랭킹 조회
const getRankings = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate, type = 'overall', page = 1, limit = 20 } = req.query;

    const { periodStart, periodEnd } = calculatePeriod(period, startDate, endDate);

    const sortFields = {
      score: 'scoreAnalytics.totalScore',
      distance: 'runningStats.totalDistance',
      speed: 'runningStats.avgSpeed',
      overall: 'scoreAnalytics.totalScore'
    };

    const sortField = sortFields[type] || sortFields.overall;

    const [rankings, total] = await Promise.all([
      PerformanceAnalytics.find({
        period,
        periodStart,
        periodEnd,
        isActive: true
      })
      .populate('userId', 'nickname email')
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit)),
      
      PerformanceAnalytics.countDocuments({
        period,
        periodStart,
        periodEnd,
        isActive: true
      })
    ]);

    res.json(successResponse('랭킹을 조회했습니다.', {
      rankings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    }));
  } catch (error) {
    console.error('랭킹 조회 실패:', error);
    res.status(500).json(errorResponse('랭킹 조회에 실패했습니다.', error.message));
  }
};

// 개인 성과 분석
const getPersonalPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'monthly', months = 6 } = req.query;

    const analytics = await PerformanceAnalytics.find({
      userId,
      period,
      isActive: true
    })
    .sort({ periodStart: -1 })
    .limit(parseInt(months));

    if (analytics.length === 0) {
      return res.json(successResponse('개인 성과 분석을 조회했습니다.', {
        currentScore: 0,
        previousScore: 0,
        growthRate: 0,
        trend: 'stable',
        improvementAreas: [],
        declineAreas: []
      }));
    }

    const current = analytics[0];
    const previous = analytics[1] || null;

    const performance = {
      currentScore: current.scoreAnalytics.totalScore,
      previousScore: previous ? previous.scoreAnalytics.totalScore : 0,
      growthRate: current.growthMetrics.growthRate,
      trend: current.growthMetrics.trend,
      improvementAreas: current.growthMetrics.improvementAreas,
      declineAreas: current.growthMetrics.declineAreas,
      personalRecords: current.personalRecords,
      rankings: current.rankings
    };

    res.json(successResponse('개인 성과 분석을 조회했습니다.', performance));
  } catch (error) {
    console.error('개인 성과 분석 조회 실패:', error);
    res.status(500).json(errorResponse('개인 성과 분석 조회에 실패했습니다.', error.message));
  }
};

// 성능 분석 생성/업데이트
const createAnalyticsForPeriod = async (userId, period, periodStart, periodEnd) => {
  try {
    // 해당 기간의 런닝 데이터 조회
    const runnings = await EnhancedRunning.find({
      userId,
      isActive: true,
      date: { $gte: periodStart, $lt: periodEnd }
    });

    // 기본 통계 계산
    const totalScore = runnings.reduce((sum, run) => sum + run.totalScore, 0);
    const avgScore = runnings.length > 0 ? totalScore / runnings.length : 0;
    const maxScore = runnings.length > 0 ? Math.max(...runnings.map(run => run.totalScore)) : 0;
    const minScore = runnings.length > 0 ? Math.min(...runnings.map(run => run.totalScore)) : 0;

    const totalDistance = runnings.reduce((sum, run) => sum + run.distance, 0);
    const totalDuration = runnings.reduce((sum, run) => sum + run.duration, 0);
    const avgDistance = runnings.length > 0 ? totalDistance / runnings.length : 0;
    const avgDuration = runnings.length > 0 ? totalDuration / runnings.length : 0;
    const avgSpeed = runnings.length > 0 ? runnings.reduce((sum, run) => sum + run.avgSpeed, 0) / runnings.length : 0;

    const maxDistance = runnings.length > 0 ? Math.max(...runnings.map(run => run.distance)) : 0;
    const maxSpeed = runnings.length > 0 ? Math.max(...runnings.map(run => run.avgSpeed)) : 0;

    // 개인 기록
    const bestScore = maxScore;
    const bestScoreDate = runnings.find(run => run.totalScore === maxScore)?.date;
    const longestDistance = maxDistance;
    const longestDistanceDate = runnings.find(run => run.distance === maxDistance)?.date;
    const fastestSpeed = maxSpeed;
    const fastestSpeedDate = runnings.find(run => run.avgSpeed === maxSpeed)?.date;
    const longestDuration = runnings.length > 0 ? Math.max(...runnings.map(run => run.duration)) : 0;
    const longestDurationDate = runnings.find(run => run.duration === longestDuration)?.date;

    // 이전 기간과 비교하여 성장률 계산
    const previousAnalytics = await PerformanceAnalytics.findOne({
      userId,
      period,
      periodStart: { $lt: periodStart }
    }).sort({ periodStart: -1 });

    let growthRate = 0;
    let trend = 'stable';
    
    if (previousAnalytics) {
      const previousScore = previousAnalytics.scoreAnalytics.totalScore;
      if (previousScore > 0) {
        growthRate = Math.round(((totalScore - previousScore) / previousScore) * 100 * 100) / 100;
      } else {
        growthRate = totalScore > 0 ? 100 : 0;
      }
      
      if (growthRate > 5) {
        trend = 'improving';
      } else if (growthRate < -5) {
        trend = 'declining';
      }
    }

    // 분석 데이터 생성
    const analytics = new PerformanceAnalytics({
      userId,
      period,
      periodStart,
      periodEnd,
      scoreAnalytics: {
        totalScore,
        avgScore,
        maxScore,
        minScore,
        scoreTrend: growthRate,
        scoreVariance: 0 // TODO: 분산 계산
      },
      runningStats: {
        runCount: runnings.length,
        totalDistance,
        totalDuration,
        avgDistance,
        avgDuration,
        avgSpeed,
        maxDistance,
        maxSpeed
      },
      growthMetrics: {
        currentScore: totalScore,
        previousScore: previousAnalytics ? previousAnalytics.scoreAnalytics.totalScore : 0,
        growthRate,
        trend,
        improvementAreas: [],
        declineAreas: []
      },
      personalRecords: {
        bestScore,
        bestScoreDate,
        longestDistance,
        longestDistanceDate,
        fastestSpeed,
        fastestSpeedDate,
        longestDuration,
        longestDurationDate
      }
    });

    await analytics.save();
    return analytics;
  } catch (error) {
    console.error('성능 분석 생성 실패:', error);
    throw error;
  }
};

// 성능 분석 수동 업데이트
const updateAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'monthly', startDate, endDate } = req.body;

    const { periodStart, periodEnd } = calculatePeriod(period, startDate, endDate);

    // 기존 분석 삭제 후 새 분석 생성
    await PerformanceAnalytics.deleteOne({ userId, period, periodStart });
    const analytics = await createAnalyticsForPeriod(userId, period, periodStart, periodEnd);

    res.json(successResponse('성능 분석이 업데이트되었습니다.', analytics));
  } catch (error) {
    console.error('성능 분석 업데이트 실패:', error);
    res.status(500).json(errorResponse('성능 분석 업데이트에 실패했습니다.', error.message));
  }
};

module.exports = {
  getAnalyticsByPeriod,
  getAnalyticsList,
  getGrowthTrend,
  getRankings,
  getPersonalPerformance,
  updateAnalytics
};

