const Score = require('../models/Score');
const Running = require('../models/Running');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// 디버깅용 - 모든 데이터 확인
const debugData = async (req, res) => {
  try {
    console.log('=== 디버깅 데이터 확인 ===');
    
    // 사용자 데이터 확인
    const users = await User.find({ isActive: true }).select('nickname email');
    console.log('사용자 수:', users.length);
    console.log('사용자 목록:', users.map(u => ({ nickname: u.nickname, email: u.email })));
    
    // 런닝 기록 확인
    const runnings = await Running.find({ isActive: true });
    console.log('런닝 기록 수:', runnings.length);
    console.log('런닝 기록:', runnings.map(r => ({ 
      userId: r.userId, 
      distance: r.distance, 
      date: r.date,
      weekStart: r.weekStart 
    })));
    
    // 점수 데이터 확인
    const scores = await Score.find({ isActive: true });
    console.log('점수 데이터 수:', scores.length);
    console.log('점수 데이터:', scores.map(s => ({ 
      userId: s.userId, 
      totalScore: s.totalScore,
      weekStart: s.weekStart 
    })));
    
    return sendSuccess(res, {
      users: users,
      runnings: runnings,
      scores: scores,
      summary: {
        userCount: users.length,
        runningCount: runnings.length,
        scoreCount: scores.length
      }
    });
    
  } catch (error) {
    console.error('디버깅 데이터 조회 오류:', error);
    return sendError(res, '디버깅 데이터 조회에 실패했습니다');
  }
};

module.exports = {
  debugData
};



