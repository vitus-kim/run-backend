import api from './api';

export const authService = {
  // 로그인
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('authService - 전체 응답:', response.data);
      
      const { tokens, user } = response.data;
      console.log('authService - tokens:', tokens);
      console.log('authService - user:', user);
      
      // JWT 토큰들을 localStorage에 저장
      if (tokens && tokens.accessToken && tokens.refreshToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('authService - 토큰 저장 완료');
      } else {
        console.error('authService - 토큰이 없거나 형식이 잘못됨:', tokens);
      }
      
      return response.data;
    } catch (error) {
      console.error('로그인 실패:', error);
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  },

  // 회원가입
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('회원가입 실패:', error);
      throw new Error('회원가입에 실패했습니다.');
    }
  },

  // 로그아웃
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      // 로컬 스토리지에서 토큰과 사용자 정보 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // 프로필 조회
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('프로필 조회 실패:', error);
      throw new Error('프로필 정보를 불러올 수 없습니다.');
    }
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // 인증 상태 확인
  isAuthenticated() {
    const accessToken = localStorage.getItem('accessToken');
    return !!accessToken;
  },

  // 토큰 갱신
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다.');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      const { tokens } = response.data;
      
      if (tokens) {
        localStorage.setItem('accessToken', tokens.accessToken);
        if (tokens.refreshToken) {
          localStorage.setItem('refreshToken', tokens.refreshToken);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      // 토큰 갱신 실패 시 로그아웃 처리
      this.logout();
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
  }
};
