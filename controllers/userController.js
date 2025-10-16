const User = require('../models/User');
const { sendSuccess, sendError, sendValidationError, sendNotFoundError } = require('../utils/responseHelper');
const { validateRequiredFields, validateNumber, handleMongooseError } = require('../utils/validationHelper');

// GET /api/users - Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    return sendSuccess(res, {
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    return sendError(res, '사용자 목록을 불러올 수 없습니다');
  }
};

// GET /api/users/:id - Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return sendNotFoundError(res, '사용자를 찾을 수 없습니다');
    }

    return sendSuccess(res, {
      user: user
    });
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    return sendError(res, '사용자 정보를 불러올 수 없습니다');
  }
};

// PUT /api/users/:id - Update user
const updateUser = async (req, res) => {
  try {
    const { nickname, gender, height } = req.body;
    const updateData = {};

    // 업데이트할 필드만 추가
    if (nickname) updateData.nickname = nickname;
    if (gender) updateData.gender = gender;
    if (height) {
      if (!validateNumber(height, 100, 250)) {
        return sendValidationError(res, ['키는 100cm 이상 250cm 이하여야 합니다']);
      }
      updateData.height = height;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return sendNotFoundError(res, '사용자를 찾을 수 없습니다');
    }

    return sendSuccess(res, {
      user: user
    }, '사용자 정보가 업데이트되었습니다');
  } catch (error) {
    console.error('사용자 업데이트 오류:', error);
    const errorInfo = handleMongooseError(error);
    
    if (errorInfo.type === 'validation') {
      return sendValidationError(res, errorInfo.errors);
    }
    
    return sendError(res, errorInfo.message);
  }
};

// DELETE /api/users/:id - Delete user (soft delete)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return sendNotFoundError(res, '사용자를 찾을 수 없습니다');
    }

    return sendSuccess(res, null, '사용자가 삭제되었습니다');
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    return sendError(res, '사용자 삭제에 실패했습니다');
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
