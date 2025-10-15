import api from './api';

export const enhancedRunningService = {
  // 런닝 기록 생성
  async createRunning(runningData) {
    try {
      const response = await api.post('/enhanced-running', runningData);
      return response.data;
    } catch (error) {
      console.error('런닝 기록 생성 실패:', error);
      throw new Error('런닝 기록 생성에 실패했습니다.');
    }
  },

  // 사용자별 런닝 기록 조회
  async getRunningsByUser(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/enhanced-running?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('런닝 기록 조회 실패:', error);
      throw new Error('런닝 기록을 불러올 수 없습니다.');
    }
  },

  // 런닝 기록 상세 조회
  async getRunningById(id) {
    try {
      const response = await api.get(`/enhanced-running/${id}`);
      return response.data;
    } catch (error) {
      console.error('런닝 기록 상세 조회 실패:', error);
      throw new Error('런닝 기록을 불러올 수 없습니다.');
    }
  },

  // 런닝 기록 수정
  async updateRunning(id, runningData) {
    try {
      const response = await api.put(`/enhanced-running/${id}`, runningData);
      return response.data;
    } catch (error) {
      console.error('런닝 기록 수정 실패:', error);
      throw new Error('런닝 기록 수정에 실패했습니다.');
    }
  },

  // 런닝 기록 삭제
  async deleteRunning(id) {
    try {
      const response = await api.delete(`/enhanced-running/${id}`);
      return response.data;
    } catch (error) {
      console.error('런닝 기록 삭제 실패:', error);
      throw new Error('런닝 기록 삭제에 실패했습니다.');
    }
  },

  // 개인 기록 조회
  async getPersonalRecords() {
    try {
      const response = await api.get('/enhanced-running/records/personal');
      return response.data;
    } catch (error) {
      console.error('개인 기록 조회 실패:', error);
      throw new Error('개인 기록을 불러올 수 없습니다.');
    }
  },

  // 점수 통계 조회
  async getScoreStats(period = 'monthly') {
    try {
      const response = await api.get(`/enhanced-running/stats/scores?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('점수 통계 조회 실패:', error);
      throw new Error('점수 통계를 불러올 수 없습니다.');
    }
  }
};

