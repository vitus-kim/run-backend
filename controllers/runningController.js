const Running = require('../models/Running');
// const { calculateUserScore } = require('../utils/scoreCalculator'); // 임시 비활성화
const { sendSuccess, sendError, sendValidationError } = require('../utils/responseHelper');
const { validateRequiredFields, validateNumber, validateDate, handleMongooseError } = require('../utils/validationHelper');
const { calculateWeekStart } = require('../utils/dateHelper');
const { buildSortOptions, buildPaginationOptions, buildPaginationResponse } = require('../utils/queryHelper');

// POST /api/running - 새로운 런닝 기록 생성
const createRunning = async (req, res) => {
  try {
    const {
      distance,
      duration,
      date,
      type,
      weather,
      feeling,
      notes
    } = req.body;
    
    // 필수 필드 검증
    const requiredFields = ['distance', 'duration'];
    const validation = validateRequiredFields(req.body, requiredFields);
    if (!validation.isValid) {
      return sendValidationError(res, validation.missingFields);
    }

    // 숫자 필드 검증
    if (!validateNumber(distance, 0.1, 1000)) {
      return sendValidationError(res, ['거리는 0.1km 이상 1000km 이하여야 합니다']);
    }

    if (!validateNumber(duration, 0.1, 1440)) {
      return sendValidationError(res, ['시간은 0.1분 이상 1440분 이하여야 합니다']);
    }

    // 날짜 검증
    if (date && !validateDate(date)) {
      return sendValidationError(res, ['올바른 날짜 형식이 아닙니다']);
    }
    
    // 주간 시작일 계산
    const runningDate = new Date(date || Date.now());
    const weekStart = calculateWeekStart(runningDate);
    
    const newRunning = new Running({
      userId: req.user._id,
      distance,
      duration,
      date: runningDate,
      weekStart,
      type: type || 'easy',
      weather: weather || 'sunny',
      feeling: feeling || 'good',
      notes
    });
    
    const savedRunning = await newRunning.save();
    
    // 점수 계산 비활성화 (모듈 오류로 인해)
    console.log('점수 계산 비활성화됨');
    
    // 사용자 정보와 함께 반환
    const populatedRunning = await Running.findById(savedRunning._id)
      .populate('userId', 'nickname email');
    
    return sendSuccess(res, {
      running: populatedRunning
    }, '런닝 기록이 저장되었습니다', 201);
    
  } catch (error) {
    console.error('런닝 기록 생성 오류:', error);
    const errorInfo = handleMongooseError(error);
    
    if (errorInfo.type === 'validation') {
      return sendValidationError(res, errorInfo.errors);
    }
    
    return sendError(res, errorInfo.message);
  }
};

// GET /api/running - 사용자의 런닝 기록 조회
const getRunnings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;
    
    const sortOptions = buildSortOptions(sortBy, sortOrder);
    const paginationOptions = buildPaginationOptions(page, limit);
    
    const runnings = await Running.find({ userId, isActive: true })
      .sort(sortOptions)
      .limit(paginationOptions.limit)
      .skip(paginationOptions.skip)
      .populate('userId', 'nickname email');
    
    const total = await Running.countDocuments({ userId, isActive: true });
    
    return sendSuccess(res, {
      ...buildPaginationResponse(runnings, total, paginationOptions),
      runnings: runnings
    });
  } catch (error) {
    console.error('런닝 기록 조회 오류:', error);
    return sendError(res, '런닝 기록을 불러올 수 없습니다');
  }
};




module.exports = {
  createRunning,
  getRunnings
};
