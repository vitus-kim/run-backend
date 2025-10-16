const mongoose = require('mongoose');

const performanceAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 기간별 성과
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  
  periodStart: {
    type: Date,
    required: true
  },
  
  periodEnd: {
    type: Date,
    required: true
  },
  
  // 단일 점수 분석
  scoreAnalytics: {
    totalScore: {
      type: Number,
      default: 0,
      min: 0
    },
    avgScore: {
      type: Number,
      default: 0,
      min: 0
    },
    maxScore: {
      type: Number,
      default: 0,
      min: 0
    },
    minScore: {
      type: Number,
      default: 0,
      min: 0
    },
    scoreTrend: {
      type: Number,
      default: 0 // 이전 기간 대비 변화율 (%)
    },
    scoreVariance: {
      type: Number,
      default: 0 // 점수 분산도
    }
  },
  
  // 런닝 통계
  runningStats: {
    runCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalDistance: {
      type: Number,
      default: 0,
      min: 0
    },
    totalDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    avgDistance: {
      type: Number,
      default: 0,
      min: 0
    },
    avgDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    avgSpeed: {
      type: Number,
      default: 0,
      min: 0
    },
    maxDistance: {
      type: Number,
      default: 0,
      min: 0
    },
    maxSpeed: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // 성장 지표
  growthMetrics: {
    currentScore: {
      type: Number,
      default: 0
    },
    previousScore: {
      type: Number,
      default: 0
    },
    growthRate: {
      type: Number,
      default: 0 // % 변화
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'declining'],
      default: 'stable'
    },
    improvementAreas: [{
      type: String,
      enum: ['distance', 'speed', 'consistency', 'intensity']
    }],
    declineAreas: [{
      type: String,
      enum: ['distance', 'speed', 'consistency', 'intensity']
    }]
  },
  
  // 개인 기록
  personalRecords: {
    bestScore: {
      type: Number,
      default: 0
    },
    bestScoreDate: {
      type: Date
    },
    longestDistance: {
      type: Number,
      default: 0
    },
    longestDistanceDate: {
      type: Date
    },
    fastestSpeed: {
      type: Number,
      default: 0
    },
    fastestSpeedDate: {
      type: Date
    },
    longestDuration: {
      type: Number,
      default: 0
    },
    longestDurationDate: {
      type: Date
    }
  },
  
  // 시각화용 데이터
  chartData: {
    dailyScores: [{
      date: { type: Date },
      score: { type: Number }
    }],
    weeklyScores: [{
      week: { type: String },
      score: { type: Number }
    }],
    monthlyScores: [{
      month: { type: String },
      score: { type: Number }
    }]
  },
  
  // 랭킹 정보
  rankings: {
    overallRank: {
      type: Number,
      default: null
    },
    scoreRank: {
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
performanceAnalyticsSchema.index({ userId: 1, period: 1, periodStart: 1 }, { unique: true });
performanceAnalyticsSchema.index({ period: 1, periodStart: 1, 'scoreAnalytics.totalScore': -1 });
performanceAnalyticsSchema.index({ userId: 1, period: 1, 'scoreAnalytics.totalScore': -1 });

// 가상 필드: 기간 정보
performanceAnalyticsSchema.virtual('periodInfo').get(function() {
  if (this.period === 'daily') {
    return this.periodStart.toISOString().split('T')[0];
  } else if (this.period === 'weekly') {
    const year = this.periodStart.getFullYear();
    const week = Math.ceil(this.periodStart.getDate() / 7);
    return `${year}년 ${week}주차`;
  } else if (this.period === 'monthly') {
    const year = this.periodStart.getFullYear();
    const month = this.periodStart.getMonth() + 1;
    return `${year}년 ${month}월`;
  }
});

// 가상 필드: 성장 등급
performanceAnalyticsSchema.virtual('growthGrade').get(function() {
  if (this.growthMetrics.growthRate >= 20) return 'A+';
  if (this.growthMetrics.growthRate >= 10) return 'A';
  if (this.growthMetrics.growthRate >= 5) return 'B';
  if (this.growthMetrics.growthRate >= 0) return 'C';
  return 'D';
});

// 가상 필드: 점수 등급
performanceAnalyticsSchema.virtual('scoreGrade').get(function() {
  if (this.scoreAnalytics.avgScore >= 500) return 'S';
  if (this.scoreAnalytics.avgScore >= 400) return 'A';
  if (this.scoreAnalytics.avgScore >= 300) return 'B';
  if (this.scoreAnalytics.avgScore >= 200) return 'C';
  return 'D';
});

// 성장 지표 계산 메서드
performanceAnalyticsSchema.methods.calculateGrowthMetrics = function(previousAnalytics) {
  if (!previousAnalytics) {
    this.growthMetrics.growthRate = 0;
    this.growthMetrics.trend = 'stable';
    return;
  }
  
  const currentScore = this.scoreAnalytics.totalScore;
  const previousScore = previousAnalytics.scoreAnalytics.totalScore;
  
  if (previousScore > 0) {
    this.growthMetrics.growthRate = Math.round(((currentScore - previousScore) / previousScore) * 100 * 100) / 100;
  } else {
    this.growthMetrics.growthRate = currentScore > 0 ? 100 : 0;
  }
  
  // 트렌드 결정
  if (this.growthMetrics.growthRate > 5) {
    this.growthMetrics.trend = 'improving';
  } else if (this.growthMetrics.growthRate < -5) {
    this.growthMetrics.trend = 'declining';
  } else {
    this.growthMetrics.trend = 'stable';
  }
  
  this.growthMetrics.currentScore = currentScore;
  this.growthMetrics.previousScore = previousScore;
};

// 랭킹 업데이트 메서드
performanceAnalyticsSchema.methods.updateRankings = async function() {
  const periodStart = this.periodStart;
  const period = this.period;
  
  // 종합 랭킹 업데이트
  const overallRank = await this.constructor.countDocuments({
    period: period,
    periodStart: periodStart,
    'scoreAnalytics.totalScore': { $gt: this.scoreAnalytics.totalScore }
  }) + 1;
  this.rankings.overallRank = overallRank;
  
  // 점수 랭킹 업데이트
  const scoreRank = await this.constructor.countDocuments({
    period: period,
    periodStart: periodStart,
    'scoreAnalytics.totalScore': { $gt: this.scoreAnalytics.totalScore }
  }) + 1;
  this.rankings.scoreRank = scoreRank;
  
  // 거리 랭킹 업데이트
  const distanceRank = await this.constructor.countDocuments({
    period: period,
    periodStart: periodStart,
    'runningStats.totalDistance': { $gt: this.runningStats.totalDistance }
  }) + 1;
  this.rankings.distanceRank = distanceRank;
  
  // 속도 랭킹 업데이트
  const speedRank = await this.constructor.countDocuments({
    period: period,
    periodStart: periodStart,
    'runningStats.avgSpeed': { $gt: this.runningStats.avgSpeed }
  }) + 1;
  this.rankings.speedRank = speedRank;
  
  return {
    overallRank,
    scoreRank,
    distanceRank,
    speedRank
  };
};

// JSON 변환 시 가상 필드 포함
performanceAnalyticsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('PerformanceAnalytics', performanceAnalyticsSchema);

