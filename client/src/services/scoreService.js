import api from './api';

export const scoreService = {
  // 주간 점수 계산 및 저장
  async calculateWeeklyScore(weekStart = null) {
    try {
      const response = await api.post('/scores/calculate', { weekStart });
      return response.data;
    } catch (error) {
      console.error('점수 계산 실패:', error);
      throw new Error(error.response?.data?.message || '점수 계산에 실패했습니다.');
    }
  },

  // 주간 점수 조회
  async getWeeklyScore(weekStart = null) {
    try {
      const params = weekStart ? { weekStart } : {};
      const response = await api.get('/scores/weekly', { params });
      return response.data;
    } catch (error) {
      console.error('점수 조회 실패:', error);
      throw new Error(error.response?.data?.message || '점수 조회에 실패했습니다.');
    }
  },

  // 점수 랭킹 조회
  async getScoreRankings(type = 'overall', weekStart = null, page = 1, limit = 10) {
    try {
      const params = {
        type,
        page,
        limit
      };
      if (weekStart) {
        params.weekStart = weekStart;
      }
      
      console.log('scoreService.getScoreRankings 호출:', { type, weekStart, page, limit, params });
      
      const response = await api.get('/scores/rankings', { params });
      
      console.log('scoreService 응답:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('점수 랭킹 조회 실패:', error);
      throw new Error(error.response?.data?.message || '점수 랭킹 조회에 실패했습니다.');
    }
  },

  // 점수 히스토리 조회
  async getScoreHistory(page = 1, limit = 10) {
    try {
      const response = await api.get('/scores/history', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('점수 히스토리 조회 실패:', error);
      throw new Error(error.response?.data?.message || '점수 히스토리 조회에 실패했습니다.');
    }
  }
};
