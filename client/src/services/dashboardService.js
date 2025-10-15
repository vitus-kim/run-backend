import api from './api';

export const dashboardService = {
  // 대시보드 조회
  async getDashboard() {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('대시보드 조회 실패:', error);
      throw new Error('대시보드 정보를 불러올 수 없습니다.');
    }
  },

  // 카드 데이터 조회
  async getCardData(type = 'all') {
    try {
      const response = await api.get(`/dashboard/cards?type=${type}`);
      return response.data;
    } catch (error) {
      console.error('카드 데이터 조회 실패:', error);
      throw new Error('카드 데이터를 불러올 수 없습니다.');
    }
  },

  // 그래프 데이터 조회
  async getGraphData(type = 'daily', limit = 30) {
    try {
      const response = await api.get(`/dashboard/graphs?type=${type}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('그래프 데이터 조회 실패:', error);
      throw new Error('그래프 데이터를 불러올 수 없습니다.');
    }
  },

  // 성장 분석 조회
  async getGrowthAnalysis() {
    try {
      const response = await api.get('/dashboard/analysis');
      return response.data;
    } catch (error) {
      console.error('성장 분석 조회 실패:', error);
      throw new Error('성장 분석을 불러올 수 없습니다.');
    }
  },

  // 개인 기록 조회
  async getPersonalRecords() {
    try {
      const response = await api.get('/dashboard/records');
      return response.data;
    } catch (error) {
      console.error('개인 기록 조회 실패:', error);
      throw new Error('개인 기록을 불러올 수 없습니다.');
    }
  },

  // 목표 설정
  async setGoals(goals) {
    try {
      const response = await api.post('/dashboard/goals', goals);
      return response.data;
    } catch (error) {
      console.error('목표 설정 실패:', error);
      throw new Error('목표 설정에 실패했습니다.');
    }
  },

  // 목표 달성률 조회
  async getGoalAchievement() {
    try {
      const response = await api.get('/dashboard/goals/achievement');
      return response.data;
    } catch (error) {
      console.error('목표 달성률 조회 실패:', error);
      throw new Error('목표 달성률을 불러올 수 없습니다.');
    }
  }
};

