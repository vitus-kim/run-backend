const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { sendSuccess, sendError, sendValidationError, sendConflictError } = require('../utils/responseHelper');
const { validateRequiredFields, validateEmail, validatePassword, handleMongooseError } = require('../utils/validationHelper');

// POST /api/auth/register - User registration
const register = async (req, res) => {
  try {
    const { email, nickname, password, gender, height } = req.body;

    // 필수 필드 검증
    const requiredFields = ['email', 'nickname', 'password', 'gender', 'height'];
    const validation = validateRequiredFields(req.body, requiredFields);
    if (!validation.isValid) {
      return sendValidationError(res, validation.missingFields);
    }

    // 이메일 형식 검증
    if (!validateEmail(email)) {
      return sendValidationError(res, ['올바른 이메일 형식이 아닙니다']);
    }

    // 비밀번호 검증
    if (!validatePassword(password)) {
      return sendValidationError(res, ['비밀번호는 6자 이상이어야 합니다']);
    }

    // 이메일 중복 확인
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return sendConflictError(res, '이미 사용 중인 이메일입니다');
    }

    // 닉네임 중복 확인
    const existingUserByNickname = await User.findOne({ nickname });
    if (existingUserByNickname) {
      return sendConflictError(res, '이미 사용 중인 닉네임입니다');
    }

    // 새 사용자 생성
    const newUser = new User({
      email,
      nickname,
      password,
      gender,
      height
    });

    const savedUser = await newUser.save();

    return sendSuccess(res, {
      user: {
        id: savedUser._id,
        email: savedUser.email,
        nickname: savedUser.nickname,
        gender: savedUser.gender,
        height: savedUser.height,
        createdAt: savedUser.createdAt
      }
    }, '회원가입이 완료되었습니다', 201);

  } catch (error) {
    console.error('회원가입 오류:', error);
    const errorInfo = handleMongooseError(error);
    
    if (errorInfo.type === 'validation') {
      return sendValidationError(res, errorInfo.errors);
    }
    
    if (errorInfo.type === 'duplicate') {
      return sendConflictError(res, errorInfo.message);
    }
    
    return sendError(res, errorInfo.message);
  }
};

// POST /api/auth/login - User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 필수 필드 검증
    if (!email || !password) {
      return sendValidationError(res, ['이메일과 비밀번호를 입력해주세요']);
    }

    // 사용자 찾기 (비밀번호 포함)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return sendError(res, '이메일 또는 비밀번호가 올바르지 않습니다', 401);
    }

    // 비밀번호 확인
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return sendError(res, '이메일 또는 비밀번호가 올바르지 않습니다', 401);
    }

    // 마지막 로그인 시간 업데이트
    user.lastLogin = new Date();
    await user.save();

    // JWT 토큰 생성
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      nickname: user.nickname
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        gender: user.gender,
        height: user.height,
        lastLogin: user.lastLogin
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }, '로그인 성공');

  } catch (error) {
    console.error('로그인 오류:', error);
    return sendError(res);
  }
};

// POST /api/auth/logout - User logout
const logout = (req, res) => {
  return sendSuccess(res, null, '로그아웃되었습니다');
};

// GET /api/auth/profile - Get user profile
const getProfile = (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, '인증이 필요합니다', 401);
    }

    return sendSuccess(res, {
      user: {
        id: req.user._id,
        email: req.user.email,
        nickname: req.user.nickname,
        gender: req.user.gender,
        height: req.user.height,
        role: req.user.role,
        isActive: req.user.isActive,
        isEmailVerified: req.user.isEmailVerified,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return sendError(res, '프로필 조회에 실패했습니다');
  }
};

// POST /api/auth/refresh - Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendValidationError(res, ['리프레시 토큰이 필요합니다']);
    }

    // 리프레시 토큰 검증
    const { verifyToken, generateToken } = require('../utils/jwt');
    const decoded = verifyToken(refreshToken);
    
    // 사용자 확인
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return sendError(res, '유효하지 않은 리프레시 토큰입니다', 401);
    }

    // 새로운 액세스 토큰 생성
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      nickname: user.nickname
    };

    const newAccessToken = generateToken(tokenPayload);

    return sendSuccess(res, {
      tokens: {
        accessToken: newAccessToken,
        refreshToken // 리프레시 토큰은 그대로 유지
      }
    }, '토큰이 갱신되었습니다');

  } catch (error) {
    console.error('토큰 갱신 오류:', error);
    
    if (error.message.includes('만료')) {
      return sendError(res, '리프레시 토큰이 만료되었습니다. 다시 로그인해주세요', 401);
    }

    return sendError(res, '토큰 갱신에 실패했습니다', 401);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  refreshToken
};
