const Score = require('../models/Score');
const Running = require('../models/Running');

// 사용자 점수 계산 함수
const calculateUserScore = async (userId, runningDate) => {
  try {
    console.log('=== 점수 계산 시작 ===');
    console.log('사용자 ID:', userId);
    console.log('런닝 날짜:', runningDate);
    
    // 런닝 기록에서 weekStart 필드를 사용하여 주간 시작일 계산
    const latestRunning = await Running.findOne({
      userId: userId,
      isActive: true
    }).sort({ date: -1 });
    
    if (!latestRunning) {
      console.log('런닝 기록이 없습니다.');
      return null;
    }
    
    const weekStart = latestRunning.weekStart;
    console.log('주간 시작일:', weekStart);
    
    // 주간 종료일 계산
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // 해당 주의 런닝 기록 조회
    const runnings = await Running.find({
      userId: userId,
      isActive: true,
      weekStart: weekStart
    });
    
    // 통계 계산
    const totalDistance = runnings.reduce((sum, run) => sum + run.distance, 0);
    const totalDuration = runnings.reduce((sum, run) => sum + run.duration, 0);
    const avgSpeed = totalDistance > 0 ? (totalDistance / totalDuration) * 60 : 0;
    const runCount = runnings.length;
    
    console.log('통계 계산 결과:');
    console.log('- 총 거리:', totalDistance);
    console.log('- 총 시간:', totalDuration);
    console.log('- 평균 속도:', avgSpeed);
    console.log('- 런닝 횟수:', runCount);
    
    // 기존 점수 레코드 찾기 또는 생성
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
    score.totalDistance = totalDistance;
    score.totalDuration = totalDuration;
    score.avgSpeed = avgSpeed;
    score.runCount = runCount;
    
    // 점수 계산
    score.calculateScore();
    
    console.log('점수 계산 결과:');
    console.log('- 총 점수:', score.totalScore);
    console.log('- 거리 점수:', score.scoreBreakdown.distanceScore);
    console.log('- 속도 점수:', score.scoreBreakdown.speedScore);
    console.log('- 일관성 점수:', score.scoreBreakdown.consistencyScore);
    
    // 저장
    await score.save();
    
    console.log('점수 저장 완료:', score.totalScore);
    
    // 모든 사용자의 랭킹 업데이트
    await updateAllRankings(weekStart);
    
    console.log(`사용자 ${userId}의 주간 점수가 업데이트되었습니다: ${score.totalScore}점`);
    console.log('=== 점수 계산 완료 ===');
    
    return score;
    
  } catch (error) {
    console.error('사용자 점수 계산 오류:', error);
    throw error;
  }
};

// 모든 사용자의 랭킹 업데이트
const updateAllRankings = async (weekStart) => {
  try {
    // 해당 주의 모든 점수 조회
    const scores = await Score.find({
      weekStart: weekStart,
      isActive: true
    }).sort({ totalScore: -1 });
    
    // 종합 랭킹 업데이트
    for (let i = 0; i < scores.length; i++) {
      scores[i].overallRank = i + 1;
    }
    
    // 거리 랭킹 업데이트
    const distanceSorted = [...scores].sort((a, b) => b.totalDistance - a.totalDistance);
    for (let i = 0; i < distanceSorted.length; i++) {
      distanceSorted[i].distanceRank = i + 1;
    }
    
    // 속도 랭킹 업데이트
    const speedSorted = [...scores].sort((a, b) => b.avgSpeed - a.avgSpeed);
    for (let i = 0; i < speedSorted.length; i++) {
      speedSorted[i].speedRank = i + 1;
    }
    
    // 모든 점수 저장
    await Promise.all(scores.map(score => score.save()));
    
    console.log(`${scores.length}명의 랭킹이 업데이트되었습니다`);
    
  } catch (error) {
    console.error('랭킹 업데이트 오류:', error);
    throw error;
  }
};

module.exports = {
  calculateUserScore,
  updateAllRankings
};
