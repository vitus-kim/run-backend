import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from '../components/Header';
import FormInput from '../components/FormInput';
import BottomTabBar from '../components/BottomTabBar';
import { useAuthForm } from '../hooks/useAuthForm';

const Login = () => {
  const [activeTab, setActiveTab] = useState('home');

  // 탭 변경 핸들러
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'my') {
      // 마이 탭을 선택하면 홈으로 이동 (홈에서 마이 탭 처리)
      window.location.href = '/?view=records';
    } else if (tabId === 'home') {
      // 홈 탭을 선택하면 홈으로 이동
      window.location.href = '/';
    }
  };

  const initialData = {
    email: '',
    password: ''
  };

  const validationRules = {
    email: true,
    password: true
  };

  const {
    formData,
    loading,
    errors,
    showPassword,
    setShowPassword,
    handleChange,
    handleSubmit
  } = useAuthForm(initialData, validationRules);

  const onSubmit = async (data) => {
    console.log('로그인 시도:', data);
    const response = await authService.login(data);
    console.log('로그인 응답:', response);
    
    console.log('로그인 성공!');
    alert('로그인 성공!');
    
    // 커스텀 이벤트 발생시키기 (authService.login에서 이미 토큰 저장됨)
    window.dispatchEvent(new Event('authChange'));
    
    // 약간의 지연 후 네비게이션
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* 컨테이너 */}
      <div className="max-w-sm mx-auto relative">
        {/* 헤더 */}
        <Header />

        {/* 메인 콘텐츠 */}
        <div className="px-4 py-6 pb-20 min-h-screen">
          <h1 className="text-2xl font-bold text-white mb-8">로그인</h1>

          <form className="space-y-6" onSubmit={(e) => handleSubmit(e, onSubmit)}>
            <FormInput
              id="email"
              name="email"
              type="email"
              label="이메일"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일"
              error={errors.email}
              required
            />

            <FormInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="비밀번호"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호"
              error={errors.password}
              required
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            <div className="text-right">
              <button 
                type="button"
                className="text-sm hover:underline transition-colors"
                style={{ color: '#0DFCBD' }}
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>

            {errors.submit && (
              <div className="text-center">
                <p className="text-sm" style={{ color: '#FF2B3D' }}>{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-medium text-base transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              style={{ 
                backgroundColor: '#3B82F6',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)'
              }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            <div className="text-center">
              <p className="text-sm" style={{ color: '#999999' }}>
                계정이 없으신가요?{' '}
                <Link 
                  to="/signup" 
                  className="font-medium hover:underline transition-colors"
                  style={{ color: '#0DFCBD' }}
                >
                  회원가입하기
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        {/* 하단 탭바 */}
        <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};

export default Login;
