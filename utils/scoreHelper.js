const Score = require('../models/Score');
const Running = require('../models/Running');
const User = require('../models/User');
const { updateAllRankings } = require('./scoreCalculator');
const { calculateWeekStart, calculateWeekEnd } = require('./dateHelper');

// 주간 시작일 결정 로직
const determineWeekStart = async (weekStart, userId) => {
  if (weekStart) {
    return new Date(weekStart);
  }
  
  // 최신 런닝 기록의 weekStart 사용
  const latestRunning = await Running.findOne({
    userId: userId,
    isActive: true
  }).sort({ date: -1 });
  
  if (!latestRunning) {
    throw new Error('런닝 기록이 없습니다');
  }
  
  return latestRunning.weekStart;
};

// 비투스 사용자 우선 주간 시작일 결정
const determineWeekStartWithVitus = async (weekStart) => {
  console.log('determineWeekStartWithVitus 호출:', { weekStart });
  
  if (weekStart) {
    console.log('weekStart가 제공됨:', weekStart);
    return new Date(weekStart);
  }
  
  // 비투스 사용자 ID를 먼저 찾기
  const vitusUser = await User.findOne({ nickname: '비투스' });
  console.log('비투스 사용자 찾기:', vitusUser ? '찾음' : '없음');
  
  if (vitusUser) {
    // 비투스 사용자의 점수 데이터가 있는 주간을 찾기
    const vitusScore = await Score.findOne({
      userId: vitusUser._id,
      isActive: true
    }).sort({ weekStart: -1 });
    
    console.log('비투스 점수 데이터:', vitusScore ? '찾음' : '없음');
    
    if (vitusScore) {
      console.log('비투스 weekStart 사용:', vitusScore.weekStart);
      return vitusScore.weekStart;
    }
  }
  
  // 비투스 데이터가 없으면 최신 점수 레코드 사용
  const latestScore = await Score.findOne({
    isActive: true
  }).sort({ weekStart: -1 });
  
  console.log('최신 점수 레코드:', latestScore ? '찾음' : '없음');
  
  if (!latestScore) {
    console.log('점수 데이터가 전혀 없음');
    return null;
  }
  
  console.log('최신 weekStart 사용:', latestScore.weekStart);
  return latestScore.weekStart;
};

// 주간 통계 계산
const calculateWeeklyStats = async (userId, weekStart) => {
  const runnings = await Running.find({
    userId: userId,
    isActive: true,
    weekStart: weekStart
  });
  
  const totalDistance = runnings.reduce((sum, run) => sum + run.distance, 0);
  const totalDuration = runnings.reduce((sum, run) => sum + run.duration, 0);
  const avgSpeed = totalDistance > 0 ? (totalDistance / totalDuration) * 60 : 0;
  const runCount = runnings.length;
  
  return {
    totalDistance,
    totalDuration,
    avgSpeed,
    runCount
  };
};

// 점수 레코드 생성 또는 업데이트
const createOrUpdateScore = async (userId, weekStart, stats) => {
  const weekEnd = calculateWeekEnd(weekStart);
  
  let score = await Score.findOne({
    userId: userId,
    weekStart: weekStart
  });
  
  if (!score) {
    score = new Score({
      userId: userId,
      weekStart: weekStart,
      weekEnd: weekEnd
    });
  }
  
  // 통계 업데이트
  score.totalDistance = stats.totalDistance;
  score.totalDuration = stats.totalDuration;
  score.avgSpeed = stats.avgSpeed;
  score.runCount = stats.runCount;
  
  // 점수 계산
  score.calculateScore();
  
  return await score.save();
};

// 정렬 기준 설정
const getSortCriteria = (type) => {
  const sortMap = {
    distance: { totalDistance: -1 },
    speed: { avgSpeed: -1 },
    overall: { totalScore: -1 }
  };
  
  return sortMap[type] || sortMap.overall;
};

// 빈 랭킹 응답 생성
const createEmptyRankingResponse = (type, page, limit) => {
  return {
    success: true,
    weekStart: null,
    type: type,
    rankings: [],
    pagination: {
      currentPage: parseInt(page),
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: parseInt(limit)
    }
  };
};

module.exports = {
  determineWeekStart,
  determineWeekStartWithVitus,
  calculateWeeklyStats,
  createOrUpdateScore,
  getSortCriteria,
  createEmptyRankingResponse,
  updateAllRankings
};
