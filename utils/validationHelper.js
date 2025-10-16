// 공통 검증 함수들
const validateRequiredFields = (body, requiredFields) => {
  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: '모든 필수 필드를 입력해주세요',
      missingFields
    };
  }
  
  return { isValid: true };
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // 최소 6자 이상
  return password && password.length >= 6;
};

const validateNumber = (value, min = 0, max = Infinity) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

const validateDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const handleMongooseError = (error) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return {
      type: 'validation',
      message: '입력 데이터가 올바르지 않습니다',
      errors
    };
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return {
      type: 'duplicate',
      message: `${field === 'email' ? '이메일' : '닉네임'}이 이미 사용 중입니다`,
      field
    };
  }
  
  return {
    type: 'server',
    message: '서버 오류가 발생했습니다'
  };
};

module.exports = {
  validateRequiredFields,
  validateEmail,
  validatePassword,
  validateNumber,
  validateDate,
  handleMongooseError
};



