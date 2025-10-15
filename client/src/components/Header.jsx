import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Header = ({ user }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 인증 상태와 사용자 정보 확인
    const checkAuthStatus = () => {
      // 토큰 존재 여부 직접 확인
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userData = authService.getCurrentUser();
      
      // 토큰이 있고 사용자 데이터가 있으면 인증된 상태
      const hasValidTokens = accessToken && refreshToken;
      const hasUserData = userData && userData.nickname;
      
      const isAuth = hasValidTokens && hasUserData;
      
      console.log('Header - 토큰 확인:', { 
        accessToken: !!accessToken, 
        refreshToken: !!refreshToken,
        accessTokenValue: accessToken ? accessToken.substring(0, 20) + '...' : null,
        refreshTokenValue: refreshToken ? refreshToken.substring(0, 20) + '...' : null
      });
      console.log('Header - 사용자 데이터:', userData);
      console.log('Header - 인증 상태:', isAuth);
      
      setIsAuthenticated(isAuth);
      setCurrentUser(userData);
    };

    // 즉시 확인
    checkAuthStatus();
    
    // 커스텀 이벤트 감지 (로그인/로그아웃 시에만)
    const handleAuthChange = () => {
      console.log('Header - auth 변경 이벤트 감지');
      // 약간의 지연 후 상태 확인 (localStorage 업데이트 대기)
      setTimeout(() => {
        checkAuthStatus();
      }, 50);
    };

    // 이벤트 리스너 등록
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
      
      // 로그아웃 이벤트 발생
      window.dispatchEvent(new Event('authChange'));
      
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        {/* 로고 */}
        <div className="text-2xl font-bold" style={{ color: '#0DFCBD' }}>
          axz
        </div>
        
        {/* 사용자 메뉴 */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            // 토큰이 있고 로그인된 상태 - 환영 메시지와 로그아웃 버튼 표시
            <>
              <div className="text-white text-sm">
                환영합니다, <span style={{ color: '#0DFCBD' }}>{currentUser?.nickname || '사용자'}</span>님!
              </div>
              <button 
                onClick={handleLogout}
                className="text-white hover:text-gray-300 transition-colors"
                title="로그아웃"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            // 토큰이 없고 로그인되지 않은 상태 - 로그인/회원가입 버튼 표시
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/login')}
                className="text-white hover:text-gray-300 transition-colors text-sm"
              >
                로그인
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-lg"
                style={{ 
                  backgroundColor: '#3B82F6',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
                }}
              >
                회원가입
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
