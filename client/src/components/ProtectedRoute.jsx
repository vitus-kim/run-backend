import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = authService.isAuthenticated();
      console.log('ProtectedRoute - 인증 상태:', authStatus);
      setIsAuthenticated(authStatus);
      setIsLoading(false);
    };

    // 즉시 확인
    checkAuth();

    // authChange 이벤트 감지
    const handleAuthChange = () => {
      console.log('ProtectedRoute - auth 변경 이벤트 감지');
      setTimeout(() => {
        checkAuth();
      }, 50);
    };

    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
      <div className="text-white text-xl">로딩 중...</div>
    </div>;
  }
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute - 로그인 페이지로 리다이렉트');
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedRoute - 홈 페이지 렌더링');
  return children;
};

export default ProtectedRoute;
