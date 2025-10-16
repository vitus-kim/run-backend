const mongoose = require('mongoose');

const runningSchema = new mongoose.Schema({
  // 기본 정보
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '사용자 ID는 필수입니다']
  },
  
  // 런닝 필수 데이터 (점수 계산용)
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
  
  
  // 자동 계산 필드 (랭킹용)
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
  
  // 선택 필드 (점수 가중치용)
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
  
  // 점수 계산 필드
  runningScore: {
    type: Number,
    default: function() {
      // 런닝 점수 = (거리 × 10) + (속도 × 5) + (타입 가중치 × 5) + (날씨 가중치 × 3) + (느낌 가중치 × 2)
      const typeWeights = { easy: 1, tempo: 2, interval: 3, long: 2, race: 4 };
      const weatherWeights = { sunny: 1, cloudy: 1, rainy: 2, windy: 2 };
      const feelingWeights = { excellent: 3, good: 2, average: 1, poor: 0 };
      
      const distanceScore = this.distance * 10;
      const speedScore = this.avgSpeed * 5;
      const typeScore = (typeWeights[this.type] || 1) * 5;
      const weatherScore = (weatherWeights[this.weather] || 1) * 3;
      const feelingScore = (feelingWeights[this.feeling] || 2) * 2;
      
      return distanceScore + speedScore + typeScore + weatherScore + feelingScore;
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

// 성능 최적화를 위한 인덱스 추가
Running.index({ userId: 1, isActive: 1, date: -1 });
Running.index({ userId: 1, isActive: 1, runningScore: -1 });
Running.index({ userId: 1, isActive: 1, distance: -1 });
Running.index({ userId: 1, isActive: 1, avgSpeed: -1 });

// 인덱스 설정 (랭킹 시스템 최적화)
runningSchema.index({ userId: 1, date: -1 });
runningSchema.index({ userId: 1, weekStart: -1 });
runningSchema.index({ weekStart: -1, runningScore: -1 }); // 주간 랭킹용
runningSchema.index({ weekStart: -1, distance: -1 }); // 거리 랭킹용
runningSchema.index({ weekStart: -1, avgSpeed: -1 }); // 속도 랭킹용
runningSchema.index({ weekStart: -1, frequency: -1 }); // 빈도 랭킹용

// 가상 필드: 시간을 시:분:초 형태로 변환
runningSchema.virtual('durationFormatted').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:00`;
  } else {
    return `${minutes}:00`;
  }
});

// 가상 필드: 페이스를 분:초/km 형태로 변환
runningSchema.virtual('paceFormatted').get(function() {
  const minutes = Math.floor(this.pace);
  const seconds = Math.round((this.pace - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
});

// 가상 필드: 타입 가중치
runningSchema.virtual('typeWeight').get(function() {
  const weights = { easy: 1, tempo: 2, interval: 3, long: 2, race: 4 };
  return weights[this.type] || 1;
});

// 가상 필드: 날씨 가중치
runningSchema.virtual('weatherWeight').get(function() {
  const weights = { sunny: 1, cloudy: 1, rainy: 2, windy: 2 };
  return weights[this.weather] || 1;
});

// 가상 필드: 느낌 가중치
runningSchema.virtual('feelingWeight').get(function() {
  const weights = { excellent: 3, good: 2, average: 1, poor: 0 };
  return weights[this.feeling] || 2;
});

// JSON 변환 시 가상 필드 포함
runningSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Running', runningSchema);
