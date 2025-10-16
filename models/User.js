const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // 기본 정보
  email: {
    type: String,
    required: [true, '이메일은 필수입니다'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '올바른 이메일 형식을 입력해주세요']
  },
  nickname: {
    type: String,
    required: [true, '닉네임은 필수입니다'],
    trim: true,
    minlength: [2, '닉네임은 최소 2자 이상이어야 합니다'],
    maxlength: [20, '닉네임은 최대 20자까지 가능합니다'],
    unique: true
  },
  password: {
    type: String,
    required: [true, '비밀번호는 필수입니다'],
    minlength: [8, '비밀번호는 최소 8자 이상이어야 합니다'],
    select: false // 기본적으로 조회 시 비밀번호 제외
  },
  
  // 개인 정보
  gender: {
    type: String,
    enum: {
      values: ['male', 'female', 'other', 'prefer_not_to_say'],
      message: '성별은 male, female, other, prefer_not_to_say 중 하나여야 합니다'
    },
    required: [true, '성별 정보는 필수입니다']
  },
  height: {
    type: Number,
    required: [true, '키 정보는 필수입니다'],
    min: [100, '키는 최소 100cm 이상이어야 합니다'],
    max: [250, '키는 최대 250cm까지 가능합니다']
  },
  
  // 시스템 정보
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// 비밀번호 해싱 미들웨어 (저장 전)
userSchema.pre('save', async function(next) {
  // 비밀번호가 수정되지 않았다면 다음으로
  if (!this.isModified('password')) return next();
  
  try {
    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 비교 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 사용자 정보를 JSON으로 변환할 때 비밀번호 제외
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// 인덱스 설정
userSchema.index({ email: 1 });
userSchema.index({ nickname: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);

