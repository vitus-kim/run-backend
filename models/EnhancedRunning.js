const mongoose = require('mongoose');

const enhancedRunningSchema = new mongoose.Schema({
  // 기본 정보
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '사용자 ID는 필수입니다']
  },
  
  // 런닝 필수 데이터
  distance: {
    type: Number,
    required: [true, '거리는 필수입니다'],
    min: [0.1, '거리는 최소 0.1km 이상이어야 합니다'],
    max: [1000, '거리는 최대 1000km까지 가능합니다']
  },
  
  duration: {
    type: Number, // 분 단위로 저장
    required: [true, '시간은 필수입니다'],
    min: [1, '시간은 최소 1분 이상이어야 합니다'],
    max: [1440, '시간은 최대 24시간(1440분)까지 가능합니다']
  },
  
  date: {
    type: Date,
    required: [true, '런닝 날짜는 필수입니다'],
    default: Date.now
  },
  
  // 자동 계산 필드
  pace: {
    type: Number, // 분/km 단위
    default: function() {
      return this.duration / this.distance;
    }
  },
  
  avgSpeed: {
    type: Number, // km/h 단위
    default: function() {
      return (this.distance / (this.duration / 60)).toFixed(2);
    }
  },
  
  // 선택 필드
  type: {
    type: String,
    enum: {
      values: ['easy', 'tempo', 'interval', 'long', 'race'],
      message: '런닝 타입은 easy, tempo, interval, long, race 중 하나여야 합니다'
    },
    default: 'easy'
  },
  
  weather: {
    type: String,
    enum: {
      values: ['sunny', 'cloudy', 'rainy', 'windy'],
      message: '날씨는 sunny, cloudy, rainy, windy 중 하나여야 합니다'
    },
    default: 'sunny'
  },
  
  feeling: {
    type: String,
    enum: {
      values: ['excellent', 'good', 'average', 'poor'],
      message: '느낌은 excellent, good, average, poor 중 하나여야 합니다'
    },
    default: 'good'
  },
  
  notes: {
    type: String,
    maxlength: [500, '메모는 최대 500자까지 가능합니다'],
    trim: true
  },
  
  // 종합 점수 (단일 점수 시스템)
  totalScore: {
    type: Number,
    default: function() {
      return this.calculateTotalScore();
    }
  },
  
  // 성장 추적용 메타데이터
  growthMetadata: {
    isPersonalRecord: { 
      type: Boolean, 
      default: false 
    },
    recordType: { 
      type: String, 
      enum: ['distance', 'speed', 'duration', 'score'],
      default: null
    },
    improvementRate: { 
      type: Number, 
      default: 0 
    }
  },
  
  // 주간 정보 (랭킹용)
  weekStart: {
    type: Date,
    required: true,
    default: function() {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek;
      return new Date(now.setDate(diff));
    }
  },
  
  // 런닝 상태
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 종합 점수 계산 메서드
enhancedRunningSchema.methods.calculateTotalScore = function() {
  // 1. 기본 점수 계산
  const distanceScore = this.distance * 10;
  const speedScore = this.avgSpeed * 5;
  const durationScore = this.duration * 0.1;
  const baseScore = distanceScore + speedScore + durationScore;
  
  // 2. 날씨+느낌 조합 가중치
  const weatherFeelingMultiplier = this.getWeatherFeelingMultiplier();
  
  // 3. 런닝 타입 가중치
  const typeMultiplier = this.getTypeMultiplier();
  
  // 4. 최종 종합 점수
  const totalScore = baseScore * weatherFeelingMultiplier * typeMultiplier;
  
  return Math.round(totalScore * 100) / 100;
};

// 날씨+느낌 조합 가중치 계산
enhancedRunningSchema.methods.getWeatherFeelingMultiplier = function() {
  const combinations = {
    'sunny-excellent': 1.2,
    'sunny-good': 1.0,
    'sunny-average': 0.9,
    'sunny-poor': 0.7,
    'cloudy-excellent': 1.1,
    'cloudy-good': 0.95,
    'cloudy-average': 0.85,
    'cloudy-poor': 0.7,
    'rainy-excellent': 1.5, // 악천후에도 좋은 느낌 = 높은 가중치
    'rainy-good': 1.3,
    'rainy-average': 1.1,
    'rainy-poor': 0.8,
    'windy-excellent': 1.3,
    'windy-good': 1.1,
    'windy-average': 0.9,
    'windy-poor': 0.7
  };
  
  const combination = `${this.weather}-${this.feeling}`;
  return combinations[combination] || 1.0;
};

// 런닝 타입 가중치 계산
enhancedRunningSchema.methods.getTypeMultiplier = function() {
  const multipliers = {
    easy: 1.0,
    tempo: 1.2,
    interval: 1.5,
    long: 1.3,
    race: 2.0
  };
  return multipliers[this.type] || 1.0;
};

// 인덱스 설정
enhancedRunningSchema.index({ userId: 1, date: -1 });
enhancedRunningSchema.index({ userId: 1, weekStart: -1 });
enhancedRunningSchema.index({ weekStart: -1, totalScore: -1 });
enhancedRunningSchema.index({ userId: 1, totalScore: -1 });

// 가상 필드: 시간을 시:분:초 형태로 변환
enhancedRunningSchema.virtual('durationFormatted').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:00`;
  } else {
    return `${minutes}:00`;
  }
});

// 가상 필드: 페이스를 분:초/km 형태로 변환
enhancedRunningSchema.virtual('paceFormatted').get(function() {
  const minutes = Math.floor(this.pace);
  const seconds = Math.round((this.pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
});

// 가상 필드: 점수 등급
enhancedRunningSchema.virtual('scoreGrade').get(function() {
  if (this.totalScore >= 500) return 'S';
  if (this.totalScore >= 400) return 'A';
  if (this.totalScore >= 300) return 'B';
  if (this.totalScore >= 200) return 'C';
  return 'D';
});

// JSON 변환 시 가상 필드 포함
enhancedRunningSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('EnhancedRunning', enhancedRunningSchema);

