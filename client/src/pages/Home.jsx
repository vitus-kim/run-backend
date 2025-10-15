import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from '../components/Header';
import RankingTabs from '../components/RankingTabs';
import RankingList from '../components/RankingList';
import Pagination from '../components/Pagination';
import BottomTabBar from '../components/BottomTabBar';
import MyRecords from './MyRecords';
import { useRankings } from '../hooks/useRankings';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMyRecords, setShowMyRecords] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  // 랭킹 관련 로직을 커스텀 훅으로 분리
  const {
    activeTab: rankingActiveTab,
    rankings,
    rankingsLoading,
    currentPage,
    totalPages,
    handleTabChange: handleRankingTabChange,
    handlePageChange
  } = useRankings(loading);

  useEffect(() => {
    // 사용자 정보 로드
    const currentUser = authService.getCurrentUser();
    console.log('Home - 사용자 정보:', currentUser);
    
    if (currentUser) {
      setUser(currentUser);
    }
    
    // URL 파라미터 확인하여 MyRecords 화면 표시 여부 결정
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    if (view === 'records') {
      setShowMyRecords(true);
    }
    
    setLoading(false);
  }, []);

  // 사용자 정보가 변경될 때마다 Header에 전달
  useEffect(() => {
    console.log('Home - 사용자 상태 변경:', user);
  }, [user]);

  // 브라우저 뒤로가기/앞으로가기 처리
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const view = urlParams.get('view');
      setShowMyRecords(view === 'records');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


  const handleBackToHome = () => {
    setShowMyRecords(false);
    setActiveTab('home');
    // URL 업데이트
    const url = new URL(window.location);
    url.searchParams.delete('view');
    window.history.pushState({}, '', url);
  };

  // 탭 변경 핸들러
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'my') {
      setShowMyRecords(true);
      // URL 업데이트
      const url = new URL(window.location);
      url.searchParams.set('view', 'records');
      window.history.pushState({}, '', url);
    } else {
      setShowMyRecords(false);
      // URL 업데이트
      const url = new URL(window.location);
      url.searchParams.delete('view');
      window.history.pushState({}, '', url);
    }
  };

  // 플로팅 버튼 핸들러
  const handleCreateRunning = () => {
    navigate('/running/create');
  };

  // 탭별 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'course':
        return (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">🏃‍♂️</div>
            <div className="text-white text-2xl mb-3 font-semibold">코스</div>
            <div className="text-gray-400 text-base leading-relaxed">런닝 코스를 확인해보세요</div>
          </div>
        );
      case 'feed':
        return (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">📱</div>
            <div className="text-white text-2xl mb-3 font-semibold">피드</div>
            <div className="text-gray-400 text-base leading-relaxed">다른 러너들의 활동을 확인해보세요</div>
          </div>
        );
      case 'lightning':
        return (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">⚡</div>
            <div className="text-white text-2xl mb-3 font-semibold">번개</div>
            <div className="text-gray-400 text-base leading-relaxed">즉석 런닝 모임을 만들어보세요</div>
          </div>
        );
      case 'home':
      default:
        return (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">런닝 랭킹</h1>
              <button
                onClick={handleCreateRunning}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 touch-manipulation"
                style={{
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
                }}
                title="런닝 기록 추가"
              >
                <span className="text-base">🏃‍♂️</span>
                <span className="text-xs font-medium">기록 입력</span>
              </button>
            </div>
            <RankingTabs activeTab={rankingActiveTab} onTabChange={handleRankingTabChange} />
            <RankingList 
              rankings={rankings}
              activeTab={rankingActiveTab}
              currentPage={currentPage}
              rankingsLoading={rankingsLoading}
            />
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  // 내 기록 보기 화면
  if (showMyRecords) {
    return (
      <MyRecords 
        user={user} 
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-sm mx-auto relative">
        <Header user={user} />
        
        <div className="px-4 py-6 pb-20 min-h-screen">
          {renderTabContent()}
        </div>
        
        {/* 하단 탭바 */}
        <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};

export default Home;
