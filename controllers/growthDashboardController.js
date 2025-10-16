const GrowthDashboard = require('../models/GrowthDashboard');
const PerformanceAnalytics = require('../models/PerformanceAnalytics');
const EnhancedRunning = require('../models/EnhancedRunning');
const Running = require('../models/Running');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// 대시보드 조회
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    let dashboard = await GrowthDashboard.findOne({ userId, isActive: true });

    if (!dashboard) {
      // 대시보드가 없으면 새로 생성
      dashboard = await createDashboard(userId);
    } else {
      // 기존 대시보드 업데이트
      dashboard = await updateDashboard(userId, dashboard);
    }

    res.json(successResponse('대시보드를 조회했습니다.', dashboard));
  } catch (error) {
    console.error('대시보드 조회 실패:', error);
    res.status(500).json(errorResponse('대시보드 조회에 실패했습니다.', error.message));
  }
};

// 카드 데이터 조회
const getCardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'all' } = req.query;

    const dashboard = await GrowthDashboard.findOne({ userId, isActive: true });
    
    if (!dashboard) {
      return res.status(404).json(errorResponse('대시보드를 찾을 수 없습니다.'));
    }

    let cardData = {};
    
    if (type === 'all' || type === 'today') {
      cardData.today = dashboard.scoreCards.todayScore;
    }
    
    if (type === 'all' || type === 'weekly') {
      cardData.weekly = dashboard.scoreCards.weeklyScore;
    }
    
    if (type === 'all' || type === 'monthly') {
      cardData.monthly = dashboard.scoreCards.monthlyScore;
    }

    res.json(successResponse('카드 데이터를 조회했습니다.', cardData));
  } catch (error) {
    console.error('카드 데이터 조회 실패:', error);
    res.status(500).json(errorResponse('카드 데이터 조회에 실패했습니다.', error.message));
  }
};

// 그래프 데이터 조회
const getGraphData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'daily', limit = 30 } = req.query;

    console.log('=== 그래프 데이터 조회 시작 ===');
    console.log('사용자 ID:', userId);
    console.log('타입:', type);
    console.log('제한:', limit);

    // 마이그레이션된 데이터에서 그래프 데이터 생성
    const graphData = await generateGraphData(userId, type, parseInt(limit));
    
    console.log('생성된 그래프 데이터:', graphData.length, '개');

    res.json(successResponse('그래프 데이터를 조회했습니다.', graphData));
  } catch (error) {
    console.error('그래프 데이터 조회 실패:', error);
    res.status(500).json(errorResponse('그래프 데이터 조회에 실패했습니다.', error.message));
  }
};

// 성장 분석 조회
const getGrowthAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    const dashboard = await GrowthDashboard.findOne({ userId, isActive: true });
    
    if (!dashboard) {
      return res.status(404).json(errorResponse('대시보드를 찾을 수 없습니다.'));
    }

    const analysis = {
      overallTrend: dashboard.growthAnalysis.overallTrend,
      bestPeriod: dashboard.growthAnalysis.bestPeriod,
      bestScore: dashboard.growthAnalysis.bestScore,
      improvementAreas: dashboard.growthAnalysis.improvementAreas,
      declineAreas: dashboard.growthAnalysis.declineAreas,
      recommendations: dashboard.growthAnalysis.recommendations,
      overallGrowthRate: dashboard.overallGrowthRate,
      overallGrade: dashboard.overallGrade
    };

    res.json(successResponse('성장 분석을 조회했습니다.', analysis));
  } catch (error) {
    console.error('성장 분석 조회 실패:', error);
    res.status(500).json(errorResponse('성장 분석 조회에 실패했습니다.', error.message));
  }
};

// 개인 기록 조회
const getPersonalRecords = async (req, res) => {
  try {
    const userId = req.user.id;

    const dashboard = await GrowthDashboard.findOne({ userId, isActive: true });
    
    if (!dashboard) {
      return res.status(404).json(errorResponse('대시보드를 찾을 수 없습니다.'));
    }

    const records = {
      bestDailyScore: dashboard.personalRecords.bestDailyScore,
      bestWeeklyScore: dashboard.personalRecords.bestWeeklyScore,
      bestMonthlyScore: dashboard.personalRecords.bestMonthlyScore,
      longestStreak: dashboard.personalRecords.longestStreak,
      totalRuns: dashboard.personalRecords.totalRuns,
      totalDistance: dashboard.personalRecords.totalDistance,
      totalDuration: dashboard.personalRecords.totalDuration
    };

    res.json(successResponse('개인 기록을 조회했습니다.', records));
  } catch (error) {
    console.error('개인 기록 조회 실패:', error);
    res.status(500).json(errorResponse('개인 기록 조회에 실패했습니다.', error.message));
  }
};

// 목표 설정
const setGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { daily, weekly, monthly } = req.body;

    let dashboard = await GrowthDashboard.findOne({ userId, isActive: true });
    
    if (!dashboard) {
      dashboard = await createDashboard(userId);
    }

    if (daily) {
      dashboard.goals.daily = {
        targetScore: daily.targetScore || 0,
        targetDistance: daily.targetDistance || 0,
        targetDuration: daily.targetDuration || 0
      };
    }

    if (weekly) {
      dashboard.goals.weekly = {
        targetScore: weekly.targetScore || 0,
        targetDistance: weekly.targetDistance || 0,
        targetRuns: weekly.targetRuns || 0
      };
    }

    if (monthly) {
      dashboard.goals.monthly = {
        targetScore: monthly.targetScore || 0,
        targetDistance: monthly.targetDistance || 0,
        targetRuns: monthly.targetRuns || 0
      };
    }

    await dashboard.save();

    res.json(successResponse('목표가 설정되었습니다.', dashboard.goals));
  } catch (error) {
    console.error('목표 설정 실패:', error);
    res.status(500).json(errorResponse('목표 설정에 실패했습니다.', error.message));
  }
};

// 목표 달성률 조회
const getGoalAchievement = async (req, res) => {
  try {
    const userId = req.user.id;

    const dashboard = await GrowthDashboard.findOne({ userId, isActive: true });
    
    if (!dashboard) {
      return res.status(404).json(errorResponse('대시보드를 찾을 수 없습니다.'));
    }

    const achievement = {
      daily: dashboard.goalAchievement.daily,
      weekly: dashboard.goalAchievement.weekly,
      monthly: dashboard.goalAchievement.monthly,
      overall: dashboard.overallGoalAchievement
    };

    res.json(successResponse('목표 달성률을 조회했습니다.', achievement));
  } catch (error) {
    console.error('목표 달성률 조회 실패:', error);
    res.status(500).json(errorResponse('목표 달성률 조회에 실패했습니다.', error.message));
  }
};

// 대시보드 생성 헬퍼 함수
const createDashboard = async (userId) => {
  try {
    const dashboard = new GrowthDashboard({ userId });
    
    // 기본 데이터로 초기화
    await updateDashboard(userId, dashboard);
    
    return dashboard;
  } catch (error) {
    console.error('대시보드 생성 실패:', error);
    throw error;
  }
};

// 기간별 데이터 조회 헬퍼 함수
const getPeriodData = async (userId, startDate, endDate) => {
  const runs = await EnhancedRunning.find({
    userId,
    isActive: true,
    date: { $gte: startDate, $lt: endDate }
  });

  return {
    score: runs.reduce((sum, run) => sum + (run.totalScore || 0), 0),
    distance: runs.reduce((sum, run) => sum + (run.distance || 0), 0),
    duration: runs.reduce((sum, run) => sum + (run.duration || 0), 0),
    count: runs.length
  };
};

// 개선률 계산 헬퍼 함수
const calculateImprovement = (current, previous) => {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
};

// 대시보드 업데이트 헬퍼 함수
const updateDashboard = async (userId, dashboard) => {
  try {
    const now = new Date();
    
    // 기간 설정
    const periods = {
      today: {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      },
      yesterday: {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate())
      },
      thisWeek: {
        start: new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000)),
        end: new Date(now.getTime() + ((7 - now.getDay()) * 24 * 60 * 60 * 1000))
      },
      lastWeek: {
        start: new Date(now.getTime() - ((now.getDay() + 7) * 24 * 60 * 60 * 1000)),
        end: new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000))
      },
      thisMonth: {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      },
      lastMonth: {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 1)
      }
    };

    // 모든 기간 데이터를 병렬로 조회
    const [
      todayData, yesterdayData, thisWeekData, lastWeekData, 
      thisMonthData, lastMonthData, allRuns
    ] = await Promise.all([
      getPeriodData(userId, periods.today.start, periods.today.end),
      getPeriodData(userId, periods.yesterday.start, periods.yesterday.end),
      getPeriodData(userId, periods.thisWeek.start, periods.thisWeek.end),
      getPeriodData(userId, periods.lastWeek.start, periods.lastWeek.end),
      getPeriodData(userId, periods.thisMonth.start, periods.thisMonth.end),
      getPeriodData(userId, periods.lastMonth.start, periods.lastMonth.end),
      EnhancedRunning.find({ userId, isActive: true })
    ]);

    // 개선률 계산
    const todayImprovement = calculateImprovement(todayData.score, yesterdayData.score);
    const weeklyImprovement = calculateImprovement(thisWeekData.score, lastWeekData.score);
    const monthlyImprovement = calculateImprovement(thisMonthData.score, lastMonthData.score);

    // 카드 데이터 업데이트
    dashboard.scoreCards.todayScore = {
      totalScore: todayData.score,
      rank: null,
      improvement: todayImprovement,
      grade: getScoreGrade(todayData.score)
    };

    dashboard.scoreCards.weeklyScore = {
      totalScore: thisWeekData.score,
      avgScore: thisWeekData.count > 0 ? thisWeekData.score / thisWeekData.count : 0,
      rank: null,
      improvement: weeklyImprovement,
      grade: getScoreGrade(thisWeekData.score / 7)
    };

    dashboard.scoreCards.monthlyScore = {
      totalScore: thisMonthData.score,
      avgScore: thisMonthData.count > 0 ? thisMonthData.score / thisMonthData.count : 0,
      rank: null,
      improvement: monthlyImprovement,
      grade: getScoreGrade(thisMonthData.score / 30)
    };

    // 개인 기록 업데이트
    dashboard.personalRecords.totalRuns = allRuns.length;
    dashboard.personalRecords.totalDistance = allRuns.reduce((sum, run) => sum + (run.distance || 0), 0);
    dashboard.personalRecords.totalDuration = allRuns.reduce((sum, run) => sum + (run.duration || 0), 0);

    // 성장 분석 및 목표 달성률 업데이트
    dashboard.updateGrowthAnalysis();
    dashboard.calculateGoalAchievement({
      dailyScore: todayData.score,
      dailyDistance: todayData.distance,
      weeklyScore: thisWeekData.score,
      weeklyDistance: thisWeekData.distance,
      monthlyScore: thisMonthData.score,
      monthlyDistance: thisMonthData.distance
    });

    await dashboard.save();
    return dashboard;
  } catch (error) {
    console.error('대시보드 업데이트 실패:', error);
    throw error;
  }
};

// 점수 등급 계산 헬퍼 함수
const getScoreGrade = (score) => {
  if (score >= 500) return 'S';
  if (score >= 400) return 'A';
  if (score >= 300) return 'B';
  if (score >= 200) return 'C';
  return 'D';
};

// 데이터 그룹화 헬퍼 함수
const groupDataByPeriod = (runs, type) => {
  const groupedData = {};
  
  runs.forEach(run => {
    const runDate = new Date(run.date);
    const score = run.runningScore || 0;
    
    let key, dateField;
    
    switch (type) {
      case 'daily':
        key = runDate.toISOString().split('T')[0];
        dateField = 'date';
        break;
      case 'weekly':
        const dayOfWeek = runDate.getDay();
        const weekStart = new Date(runDate);
        weekStart.setDate(runDate.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        key = weekStart.toISOString().split('T')[0];
        dateField = 'weekStart';
        break;
      case 'monthly':
        key = runDate.toISOString().substring(0, 7);
        dateField = 'month';
        break;
      default:
        return;
    }
    
    if (!groupedData[key]) {
      groupedData[key] = {
        [dateField]: key,
        score: 0,
        distance: 0,
        duration: 0,
        runCount: 0
      };
    }
    
    groupedData[key].score += score;
    groupedData[key].distance += (run.distance || 0);
    groupedData[key].duration += (run.duration || 0);
    groupedData[key].runCount += 1;
  });
  
  return groupedData;
};

// 그래프 데이터 생성 헬퍼 함수
const generateGraphData = async (userId, type, limit) => {
  try {
    console.log('=== 그래프 데이터 생성 시작 ===');
    console.log('사용자 ID:', userId, '타입:', type, '제한:', limit);

    // Running 데이터만 사용 (개인 기록과 일치)
    const allRunnings = await Running.find({ userId, isActive: true })
      .sort({ date: -1 })
      .populate('userId', 'nickname email');

    console.log('런닝 데이터:', allRunnings.length, '개');

    if (allRunnings.length === 0) {
      return [];
    }

    // 데이터 그룹화
    const groupedData = groupDataByPeriod(allRunnings, type);
    
    // 실제 데이터가 있는 항목만 필터링하고 정렬
    const validData = Object.values(groupedData)
      .filter(item => item.runCount > 0)
      .sort((a, b) => {
        const dateA = new Date(a.date || a.weekStart || a.month + '-01');
        const dateB = new Date(b.date || b.weekStart || b.month + '-01');
        return dateA - dateB; // 오름차순 정렬
      })
      .slice(-limit); // 최근 limit개만 선택

    console.log('생성된 그래프 데이터:', validData.length, '개');
    return validData;
  } catch (error) {
    console.error('그래프 데이터 생성 실패:', error);
    throw error;
  }
};

module.exports = {
  getDashboard,
  getCardData,
  getGraphData,
  getGrowthAnalysis,
  getPersonalRecords,
  setGoals,
  getGoalAchievement
};
