const mongoose = require('mongoose');

const growthDashboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 카드형 데이터
  scoreCards: {
    // 오늘의 점수 카드
    todayScore: {
      totalScore: {
        type: Number,
        default: 0
      },
      rank: {
        type: Number,
        default: null
      },
      improvement: {
        type: Number,
        default: 0 // 어제 대비 변화 (%)
      },
      grade: {
        type: String,
        enum: ['S', 'A', 'B', 'C', 'D'],
        default: 'D'
      }
    },
    
    // 주간 점수 카드
    weeklyScore: {
      totalScore: {
        type: Number,
        default: 0
      },
      avgScore: {
        type: Number,
        default: 0
      },
      rank: {
        type: Number,
        default: null
      },
      improvement: {
        type: Number,
        default: 0 // 지난주 대비 변화 (%)
      },
      grade: {
        type: String,
        enum: ['S', 'A', 'B', 'C', 'D'],
        default: 'D'
      }
    },
    
    // 월간 점수 카드
    monthlyScore: {
      totalScore: {
        type: Number,
        default: 0
      },
      avgScore: {
        type: Number,
        default: 0
      },
      rank: {
        type: Number,
        default: null
      },
      improvement: {
        type: Number,
        default: 0 // 지난달 대비 변화 (%)
      },
      grade: {
        type: String,
        enum: ['S', 'A', 'B', 'C', 'D'],
        default: 'D'
      }
    }
  },
  
  // 그래프용 데이터
  graphData: {
    // 일별 그래프 (최근 30일)
    daily: [{
      date: {
        type: Date,
        required: true
      },
      score: {
        type: Number,
        required: true
      },
      distance: {
        type: Number,
        default: 0
      },
      duration: {
        type: Number,
        default: 0
      },
      avgSpeed: {
        type: Number,
        default: 0
      }
    }],
    
    // 주별 그래프 (최근 12주)
    weekly: [{
      week: {
        type: String,
        required: true
      },
      weekStart: {
        type: Date,
        required: true
      },
      totalScore: {
        type: Number,
        required: true
      },
      avgScore: {
        type: Number,
        required: true
      },
      runCount: {
        type: Number,
        default: 0
      },
      totalDistance: {
        type: Number,
        default: 0
      }
    }],
    
    // 월별 그래프 (최근 12개월)
    monthly: [{
      month: {
        type: String,
        required: true
      },
      monthStart: {
        type: Date,
        required: true
      },
      totalScore: {
        type: Number,
        required: true
      },
      avgScore: {
        type: Number,
        required: true
      },
      runCount: {
        type: Number,
        default: 0
      },
      totalDistance: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // 성장 추이 분석
  growthAnalysis: {
    overallTrend: {
      type: String,
      enum: ['rising', 'stable', 'declining'],
      default: 'stable'
    },
    bestPeriod: {
      type: String, // "2024-03"
      default: null
    },
    bestScore: {
      type: Number,
      default: 0
    },
    improvementAreas: [{
      type: String,
      enum: ['distance', 'speed', 'consistency', 'intensity', 'weather_adaptation']
    }],
    declineAreas: [{
      type: String,
      enum: ['distance', 'speed', 'consistency', 'intensity', 'weather_adaptation']
    }],
    recommendations: [{
      type: String,
      enum: [
        'increase_distance',
        'improve_speed',
        'more_consistent',
        'try_different_weather',
        'vary_running_types',
        'set_goals',
        'rest_more'
      ]
    }]
  },
  
  // 개인 기록
  personalRecords: {
    bestDailyScore: {
      score: { type: Number, default: 0 },
      date: { type: Date }
    },
    bestWeeklyScore: {
      score: { type: Number, default: 0 },
      week: { type: String }
    },
    bestMonthlyScore: {
      score: { type: Number, default: 0 },
      month: { type: String }
    },
    longestStreak: {
      days: { type: Number, default: 0 },
      startDate: { type: Date },
      endDate: { type: Date }
    },
    totalRuns: {
      type: Number,
      default: 0
    },
    totalDistance: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      default: 0
    }
  },
  
  // 목표 설정
  goals: {
    daily: {
      targetScore: { type: Number, default: 0 },
      targetDistance: { type: Number, default: 0 },
      targetDuration: { type: Number, default: 0 }
    },
    weekly: {
      targetScore: { type: Number, default: 0 },
      targetDistance: { type: Number, default: 0 },
      targetRuns: { type: Number, default: 0 }
    },
    monthly: {
      targetScore: { type: Number, default: 0 },
      targetDistance: { type: Number, default: 0 },
      targetRuns: { type: Number, default: 0 }
    }
  },
  
  // 목표 달성률
  goalAchievement: {
    daily: {
      scoreAchievement: { type: Number, default: 0 }, // %
      distanceAchievement: { type: Number, default: 0 },
      durationAchievement: { type: Number, default: 0 }
    },
    weekly: {
      scoreAchievement: { type: Number, default: 0 },
      distanceAchievement: { type: Number, default: 0 },
      runsAchievement: { type: Number, default: 0 }
    },
    monthly: {
      scoreAchievement: { type: Number, default: 0 },
      distanceAchievement: { type: Number, default: 0 },
      runsAchievement: { type: Number, default: 0 }
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

// 인덱스 설정
growthDashboardSchema.index({ userId: 1 }, { unique: true });
growthDashboardSchema.index({ 'scoreCards.todayScore.totalScore': -1 });
growthDashboardSchema.index({ 'scoreCards.weeklyScore.totalScore': -1 });
growthDashboardSchema.index({ 'scoreCards.monthlyScore.totalScore': -1 });

// 가상 필드: 전체 성장률
growthDashboardSchema.virtual('overallGrowthRate').get(function() {
  const dailyGrowth = this.scoreCards.todayScore.improvement || 0;
  const weeklyGrowth = this.scoreCards.weeklyScore.improvement || 0;
  const monthlyGrowth = this.scoreCards.monthlyScore.improvement || 0;
  
  return Math.round((dailyGrowth + weeklyGrowth + monthlyGrowth) / 3 * 100) / 100;
});

// 가상 필드: 전체 등급
growthDashboardSchema.virtual('overallGrade').get(function() {
  const grades = [
    this.scoreCards.todayScore.grade,
    this.scoreCards.weeklyScore.grade,
    this.scoreCards.monthlyScore.grade
  ];
  
  const gradeValues = { 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
  const avgGrade = grades.reduce((sum, grade) => sum + (gradeValues[grade] || 0), 0) / grades.length;
  
  if (avgGrade >= 4.5) return 'S';
  if (avgGrade >= 3.5) return 'A';
  if (avgGrade >= 2.5) return 'B';
  if (avgGrade >= 1.5) return 'C';
  return 'D';
});

// 가상 필드: 목표 달성률
growthDashboardSchema.virtual('overallGoalAchievement').get(function() {
  const daily = this.goalAchievement.daily.scoreAchievement || 0;
  const weekly = this.goalAchievement.weekly.scoreAchievement || 0;
  const monthly = this.goalAchievement.monthly.scoreAchievement || 0;
  
  return Math.round((daily + weekly + monthly) / 3 * 100) / 100;
});

// 성장 분석 업데이트 메서드
growthDashboardSchema.methods.updateGrowthAnalysis = function() {
  // 전체 트렌드 분석
  const dailyImprovement = this.scoreCards.todayScore.improvement || 0;
  const weeklyImprovement = this.scoreCards.weeklyScore.improvement || 0;
  const monthlyImprovement = this.scoreCards.monthlyScore.improvement || 0;
  
  const avgImprovement = (dailyImprovement + weeklyImprovement + monthlyImprovement) / 3;
  
  if (avgImprovement > 5) {
    this.growthAnalysis.overallTrend = 'rising';
  } else if (avgImprovement < -5) {
    this.growthAnalysis.overallTrend = 'declining';
  } else {
    this.growthAnalysis.overallTrend = 'stable';
  }
  
  // 개선 영역 분석
  this.growthAnalysis.improvementAreas = [];
  this.growthAnalysis.declineAreas = [];
  
  if (dailyImprovement > 10) this.growthAnalysis.improvementAreas.push('consistency');
  if (weeklyImprovement > 10) this.growthAnalysis.improvementAreas.push('intensity');
  if (monthlyImprovement > 10) this.growthAnalysis.improvementAreas.push('distance');
  
  if (dailyImprovement < -10) this.growthAnalysis.declineAreas.push('consistency');
  if (weeklyImprovement < -10) this.growthAnalysis.declineAreas.push('intensity');
  if (monthlyImprovement < -10) this.growthAnalysis.declineAreas.push('distance');
  
  // 권장사항 생성
  this.growthAnalysis.recommendations = [];
  
  if (this.growthAnalysis.improvementAreas.includes('consistency')) {
    this.growthAnalysis.recommendations.push('more_consistent');
  }
  if (this.growthAnalysis.improvementAreas.includes('distance')) {
    this.growthAnalysis.recommendations.push('increase_distance');
  }
  if (this.growthAnalysis.improvementAreas.includes('intensity')) {
    this.growthAnalysis.recommendations.push('improve_speed');
  }
  
  if (this.growthAnalysis.declineAreas.length > 0) {
    this.growthAnalysis.recommendations.push('rest_more');
  }
};

// 목표 달성률 계산 메서드
growthDashboardSchema.methods.calculateGoalAchievement = function(currentStats) {
  // 일일 목표 달성률
  if (this.goals.daily.targetScore > 0) {
    this.goalAchievement.daily.scoreAchievement = Math.round(
      (currentStats.dailyScore / this.goals.daily.targetScore) * 100 * 100
    ) / 100;
  }
  
  if (this.goals.daily.targetDistance > 0) {
    this.goalAchievement.daily.distanceAchievement = Math.round(
      (currentStats.dailyDistance / this.goals.daily.targetDistance) * 100 * 100
    ) / 100;
  }
  
  // 주간 목표 달성률
  if (this.goals.weekly.targetScore > 0) {
    this.goalAchievement.weekly.scoreAchievement = Math.round(
      (currentStats.weeklyScore / this.goals.weekly.targetScore) * 100 * 100
    ) / 100;
  }
  
  if (this.goals.weekly.targetDistance > 0) {
    this.goalAchievement.weekly.distanceAchievement = Math.round(
      (currentStats.weeklyDistance / this.goals.weekly.targetDistance) * 100 * 100
    ) / 100;
  }
  
  // 월간 목표 달성률
  if (this.goals.monthly.targetScore > 0) {
    this.goalAchievement.monthly.scoreAchievement = Math.round(
      (currentStats.monthlyScore / this.goals.monthly.targetScore) * 100 * 100
    ) / 100;
  }
  
  if (this.goals.monthly.targetDistance > 0) {
    this.goalAchievement.monthly.distanceAchievement = Math.round(
      (currentStats.monthlyDistance / this.goals.monthly.targetDistance) * 100 * 100
    ) / 100;
  }
};

// JSON 변환 시 가상 필드 포함
growthDashboardSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('GrowthDashboard', growthDashboardSchema);

