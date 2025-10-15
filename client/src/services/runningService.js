import api from './api';

export const runningService = {
  // 런닝 기록 생성
  async createRunning(runningData) {
    try {
      const response = await api.post('/running', runningData);
      return response.data;
    } catch (error) {
      console.error('런닝 기록 생성 실패:', error);
      throw new Error(error.response?.data?.message || '런닝 기록 생성에 실패했습니다.');
    }
  },

  // 내 런닝 기록 조회
  async getMyRunnings(params = {}) {
    try {
      const response = await api.get('/running', { params });
      return response.data;
    } catch (error) {
      console.error('런닝 기록 조회 실패:', error);
      throw new Error(error.response?.data?.message || '런닝 기록을 불러올 수 없습니다.');
    }
  },

  // 주간 종합 랭킹 조회
  async getWeeklyRankings(weekStart = null) {
    try {
      const params = weekStart ? { weekStart } : {};
      const response = await api.get('/running/rankings', { params });
      return response.data;
    } catch (error) {
      console.error('주간 랭킹 조회 실패:', error);
      throw new Error(error.response?.data?.message || '랭킹을 불러올 수 없습니다.');
    }
  },

  // 거리 랭킹 조회
  async getDistanceRankings(weekStart = null) {
    try {
      const params = weekStart ? { weekStart } : {};
      const response = await api.get('/running/rankings/distance', { params });
      return response.data;
    } catch (error) {
      console.error('거리 랭킹 조회 실패:', error);
      throw new Error(error.response?.data?.message || '거리 랭킹을 불러올 수 없습니다.');
    }
  },

  // 속도 랭킹 조회
  async getSpeedRankings(weekStart = null) {
    try {
      const params = weekStart ? { weekStart } : {};
      const response = await api.get('/running/rankings/speed', { params });
      return response.data;
    } catch (error) {
      console.error('속도 랭킹 조회 실패:', error);
      throw new Error(error.response?.data?.message || '속도 랭킹을 불러올 수 없습니다.');
    }
  },

};
