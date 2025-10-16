// 공통 응답 헬퍼 함수들
const sendSuccess = (res, data = null, message = '성공', statusCode = 200) => {
  const response = {
    success: true,
    message
  };
  
  if (data) {
    if (Array.isArray(data)) {
      response.data = data;
    } else {
      Object.assign(response, data);
    }
  }
  
  return res.status(statusCode).json(response);
};

const sendError = (res, message = '서버 오류가 발생했습니다', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

const sendValidationError = (res, errors) => {
  return sendError(res, '입력 데이터가 올바르지 않습니다', 400, errors);
};

const sendNotFoundError = (res, message = '요청한 리소스를 찾을 수 없습니다') => {
  return sendError(res, message, 404);
};

const sendUnauthorizedError = (res, message = '인증이 필요합니다') => {
  return sendError(res, message, 401);
};

const sendConflictError = (res, message = '이미 존재하는 데이터입니다') => {
  return sendError(res, message, 409);
};

// 추가 헬퍼 함수들
const successResponse = (message = '성공', data = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data) {
    if (Array.isArray(data)) {
      response.data = data;
    } else {
      Object.assign(response, data);
    }
  }
  
  return response;
};

const errorResponse = (message = '서버 오류가 발생했습니다', errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFoundError,
  sendUnauthorizedError,
  sendConflictError,
  successResponse,
  errorResponse
};

