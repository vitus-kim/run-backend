const jwt = require('jsonwebtoken');

// JWT 시크릿 키 (환경변수에서 가져오거나 기본값 사용)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-2024-axz-corp';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 7일
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'; // 30일

/**
 * JWT 토큰 생성
 * @param {Object} payload - 토큰에 포함할 데이터
 * @param {string} expiresIn - 만료 시간 (기본값: 7일)
 * @returns {string} JWT 토큰
 */
const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  } catch (error) {
    console.error('JWT 토큰 생성 오류:', error);
    throw new Error('토큰 생성에 실패했습니다');
  }
};

/**
 * 리프레시 토큰 생성
 * @param {Object} payload - 토큰에 포함할 데이터
 * @returns {string} 리프레시 토큰
 */
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  } catch (error) {
    console.error('리프레시 토큰 생성 오류:', error);
    throw new Error('리프레시 토큰 생성에 실패했습니다');
  }
};

/**
 * JWT 토큰 검증
 * @param {string} token - 검증할 토큰
 * @returns {Object} 디코딩된 토큰 데이터
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('토큰이 만료되었습니다');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('유효하지 않은 토큰입니다');
    } else {
      console.error('JWT 토큰 검증 오류:', error);
      throw new Error('토큰 검증에 실패했습니다');
    }
  }
};

/**
 * 토큰에서 사용자 ID 추출
 * @param {string} token - JWT 토큰
 * @returns {string} 사용자 ID
 */
const getUserIdFromToken = (token) => {
  try {
    const decoded = verifyToken(token);
    return decoded.userId || decoded.id;
  } catch (error) {
    throw error;
  }
};

/**
 * 토큰 만료 시간 확인
 * @param {string} token - JWT 토큰
 * @returns {boolean} 만료 여부
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * 토큰에서 사용자 정보 추출 (만료 시간 무시)
 * @param {string} token - JWT 토큰
 * @returns {Object} 사용자 정보
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('토큰 디코딩 오류:', error);
    return null;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  getUserIdFromToken,
  isTokenExpired,
  decodeToken,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN
};
