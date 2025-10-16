const { verifyToken, getUserIdFromToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * JWT 토큰 인증 미들웨어
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - 다음 미들웨어 함수
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '액세스 토큰이 필요합니다'
      });
    }

    // 토큰 검증
    const decoded = verifyToken(token);
    
    // 사용자 정보 조회
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '비활성화된 계정입니다'
      });
    }

    // 요청 객체에 사용자 정보 추가
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('인증 미들웨어 오류:', error);
    
    if (error.message.includes('만료')) {
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message.includes('유효하지 않은')) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: '인증에 실패했습니다'
    });
  }
};

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 인증, 없어도 통과)
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - 다음 미들웨어 함수
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // 토큰이 없어도 통과
    }

    // 토큰이 있으면 인증 시도
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }
    
    next();
  } catch (error) {
    // 인증 실패해도 통과 (선택적 인증)
    next();
  }
};

/**
 * 관리자 권한 확인 미들웨어
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - 다음 미들웨어 함수
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '관리자 권한이 필요합니다'
    });
  }

  next();
};

/**
 * 토큰 갱신 미들웨어
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - 다음 미들웨어 함수
 */
const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: '리프레시 토큰이 필요합니다'
      });
    }

    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 리프레시 토큰입니다'
      });
    }

    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('리프레시 토큰 미들웨어 오류:', error);
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 리프레시 토큰입니다'
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  refreshTokenMiddleware
};



