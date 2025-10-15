import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from '../components/Header';
import FormInput from '../components/FormInput';
import GenderSelector from '../components/GenderSelector';
import BottomTabBar from '../components/BottomTabBar';
import { useAuthForm } from '../hooks/useAuthForm';

const Signup = () => {
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
    nickname: '',
    password: '',
    confirmPassword: '',
    gender: '',
    height: ''
  };

  const validationRules = {
    email: true,
    nickname: true,
    password: true,
    confirmPassword: true,
    gender: true,
    height: true
  };

  const {
    formData,
    loading,
    errors,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleChange,
    handleSubmit
  } = useAuthForm(initialData, validationRules);

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    await authService.register(userData);
    alert('회원가입이 완료되었습니다!');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-black">
      {/* 컨테이너 */}
      <div className="max-w-sm mx-auto relative">
        {/* 헤더 */}
        <Header />

        {/* 메인 콘텐츠 */}
        <div className="px-4 py-6 pb-20 min-h-screen">
          <h1 className="text-2xl font-bold text-white mb-8">계정 만들기</h1>

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
            id="nickname"
            name="nickname"
            type="text"
            label="닉네임"
            value={formData.nickname}
            onChange={handleChange}
            placeholder="닉네임"
            error={errors.nickname}
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
            description="최소 8자 이상 입력해 주세요."
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            label="비밀번호 확인"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호 확인"
            error={errors.confirmPassword}
            required
            showPasswordToggle
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <GenderSelector
            value={formData.gender}
            onChange={handleChange}
            error={errors.gender}
          />

          <FormInput
            id="height"
            name="height"
            type="number"
            label="키 (cm)"
            value={formData.height}
            onChange={handleChange}
            placeholder="키를 입력하세요"
            error={errors.height}
            required
            min="100"
            max="250"
          />

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
            {loading ? '가입 중...' : '가입하기'}
          </button>

          <div className="text-center">
            <p className="text-sm" style={{ color: '#999999' }}>
              이미 계정이 있으신가요?{' '}
              <Link 
                to="/login" 
                className="font-medium hover:underline transition-colors"
                style={{ color: '#0DFCBD' }}
              >
                로그인하기
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

export default Signup;
