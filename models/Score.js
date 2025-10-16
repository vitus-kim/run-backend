const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 주간 정보
  weekStart: {
    type: Date,
    required: true,
    index: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  
  // 점수 정보
  totalScore: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  
  // 런닝 통계
  totalDistance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalDuration: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  avgSpeed: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  runCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  
  // 랭킹 정보
  overallRank: {
    type: Number,
    default: null
  },
  distanceRank: {
    type: Number,
    default: null
  },
  speedRank: {
    type: Number,
    default: null
  },
  
  // 점수 세부 내역
  scoreBreakdown: {
    distanceScore: {
      type: Number,
      default: 0
    },
    speedScore: {
      type: Number,
      default: 0
    },
    consistencyScore: {
      type: Number,
      default: 0
    },
    improvementScore: {
      type: Number,
      default: 0
    }
  },
  
  // 메타 정보
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 복합 인덱스 설정
scoreSchema.index({ userId: 1, weekStart: 1 }, { unique: true });
scoreSchema.index({ weekStart: 1, totalScore: -1 });
scoreSchema.index({ weekStart: 1, totalDistance: -1 });
scoreSchema.index({ weekStart: 1, avgSpeed: -1 });

// 가상 필드: 주간 정보
scoreSchema.virtual('weekInfo').get(function() {
  const year = this.weekStart.getFullYear();
  const month = this.weekStart.getMonth() + 1;
  const week = Math.ceil(this.weekStart.getDate() / 7);
  return `${year}년 ${month}월 ${week}주차`;
});

// 가상 필드: 평균 페이스 (분/km)
scoreSchema.virtual('avgPace').get(function() {
  if (this.totalDistance === 0) return 0;
  return this.totalDuration / this.totalDistance;
});

// 가상 필드: 일일 평균 거리
scoreSchema.virtual('dailyAvgDistance').get(function() {
  if (this.runCount === 0) return 0;
  return this.totalDistance / this.runCount;
});

// 점수 계산 메서드
scoreSchema.methods.calculateScore = function() {
  // 거리 점수 (거리 × 10) - 소수점 셋째자리에서 반올림
  this.scoreBreakdown.distanceScore = Math.round(this.totalDistance * 10 * 100) / 100;
  
  // 속도 점수 (평균 속도 × 5) - 소수점 셋째자리에서 반올림
  this.scoreBreakdown.speedScore = Math.round(this.avgSpeed * 5 * 100) / 100;
  
  // 일관성 점수 (런닝 횟수 × 2) - 소수점 셋째자리에서 반올림
  this.scoreBreakdown.consistencyScore = Math.round(this.runCount * 2 * 100) / 100;
  
  // 개선 점수 (최근 성과 향상도, 추후 구현)
  this.scoreBreakdown.improvementScore = 0;
  
  // 총 점수 계산 - 소수점 셋째자리에서 반올림
  this.totalScore = Math.round((
    this.scoreBreakdown.distanceScore +
    this.scoreBreakdown.speedScore +
    this.scoreBreakdown.consistencyScore +
    this.scoreBreakdown.improvementScore
  ) * 100) / 100;
  
  this.lastUpdated = new Date();
  return this.totalScore;
};

// 랭킹 업데이트 메서드
scoreSchema.methods.updateRankings = async function() {
  const weekStart = this.weekStart;
  
  // 종합 랭킹 업데이트
  const overallRank = await this.constructor.countDocuments({
    weekStart: weekStart,
    totalScore: { $gt: this.totalScore }
  }) + 1;
  this.overallRank = overallRank;
  
  // 거리 랭킹 업데이트
  const distanceRank = await this.constructor.countDocuments({
    weekStart: weekStart,
    totalDistance: { $gt: this.totalDistance }
  }) + 1;
  this.distanceRank = distanceRank;
  
  // 속도 랭킹 업데이트
  const speedRank = await this.constructor.countDocuments({
    weekStart: weekStart,
    avgSpeed: { $gt: this.avgSpeed }
  }) + 1;
  this.speedRank = speedRank;
  
  return {
    overallRank,
    distanceRank,
    speedRank
  };
};

// JSON 변환 시 가상 필드 포함
scoreSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Score', scoreSchema);
