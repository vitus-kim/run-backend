import api from './api';

export const migrationService = {
  // 기존 Running 데이터를 EnhancedRunning으로 마이그레이션
  async migrateRunningData() {
    try {
      const response = await api.post('/migration/migrate');
      return response.data;
    } catch (error) {
      console.error('데이터 마이그레이션 실패:', error);
      throw new Error('데이터 마이그레이션에 실패했습니다.');
    }
  },

  // 모든 런닝 데이터 조회 (기존 + 새로운)
  async getAllRunnings(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/migration/runnings?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('런닝 기록 조회 실패:', error);
      throw new Error('런닝 기록을 불러올 수 없습니다.');
    }
  },

  // 개인 기록 조회 (기존 + 새로운)
  async getPersonalRecordsCombined() {
    try {
      const response = await api.get('/migration/personal-records');
      return response.data;
    } catch (error) {
      console.error('개인 기록 조회 실패:', error);
      throw new Error('개인 기록을 불러올 수 없습니다.');
    }
  }
};

