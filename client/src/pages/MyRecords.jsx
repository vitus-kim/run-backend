import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { enhancedRunningService } from '../services/enhancedRunningService';
import { migrationService } from '../services/migrationService';
import Header from '../components/Header';
import TrendGraph from '../components/TrendGraph';
import RunningRecordCard from '../components/RunningRecordCard';
import PeriodSelector from '../components/PeriodSelector';
import BottomTabBar from '../components/BottomTabBar';

const MyRecords = ({ user, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState([]);
  const [runningRecords, setRunningRecords] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [personalRecords, setPersonalRecords] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('my');
  
  // 페이지네이션을 위한 상태
  const [recordsPerPage] = useState(5); // 한 페이지당 5개 카드
  const [currentRecordsPage, setCurrentRecordsPage] = useState(1);
  const [totalRecordsPages, setTotalRecordsPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [selectedPeriod, currentPage, currentRecordsPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('=== 데이터 로드 시작 ===');
      console.log('선택된 기간:', selectedPeriod);
      console.log('현재 페이지:', currentPage);
      
      // 그래프 데이터 로드
      try {
        // 기간별 데이터 개수 설정
        let limit = 30; // 기본값
        switch (selectedPeriod) {
          case 'daily':
            limit = 9; // 최근 9일
            break;
          case 'weekly':
            limit = 9; // 최근 9주
            break;
          case 'monthly':
            limit = 9; // 최근 9개월
            break;
          default:
            limit = 9;
        }
        
        const graphResponse = await dashboardService.getGraphData(selectedPeriod, limit);
        console.log('그래프 데이터 응답:', graphResponse);
        console.log('선택된 기간:', selectedPeriod, '제한:', limit);
        console.log('그래프 데이터 타입:', typeof graphResponse);
        console.log('그래프 데이터 구조:', JSON.stringify(graphResponse, null, 2));
        
        // 응답 데이터 처리
        let graphDataArray = [];
        if (Array.isArray(graphResponse)) {
          graphDataArray = graphResponse;
        } else if (graphResponse && Array.isArray(graphResponse.data)) {
          graphDataArray = graphResponse.data;
        } else if (graphResponse && graphResponse.success && Array.isArray(graphResponse.data)) {
          graphDataArray = graphResponse.data;
        }
        
        setGraphData(graphDataArray);
      } catch (error) {
        console.error('그래프 데이터 로드 실패:', error);
        // 에러 시 빈 배열로 설정
        setGraphData([]);
      }

      // 런닝 기록 로드 (페이지네이션 적용)
      try {
        const recordsResponse = await migrationService.getAllRunnings({
          page: currentRecordsPage,
          limit: recordsPerPage,
          sortBy: 'date',
          sortOrder: 'desc'
        });
        console.log('런닝 기록 응답:', recordsResponse);
        console.log('런닝 기록 개수:', recordsResponse.runnings?.length || 0);
        console.log('런닝 기록 데이터:', JSON.stringify(recordsResponse.runnings?.slice(0, 3), null, 2));
        setRunningRecords(recordsResponse.runnings || []);
        setTotalRecordsPages(recordsResponse.pagination?.pages || 1);
      } catch (error) {
        console.error('런닝 기록 로드 실패:', error);
        setRunningRecords([]);
        setTotalRecordsPages(1);
      }

      // 개인 기록 로드 (마이그레이션된 데이터 사용)
      try {
        const personalResponse = await migrationService.getPersonalRecordsCombined();
        console.log('개인 기록 응답:', personalResponse);
        setPersonalRecords(personalResponse || null);
      } catch (error) {
        console.error('개인 기록 로드 실패:', error);
        setPersonalRecords(null);
      }

    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } catch (error) {
      console.error('새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 페이지네이션 핸들러
  const handleRecordsPageChange = (page) => {
    setCurrentRecordsPage(page);
  };

  const handlePrevRecordsPage = () => {
    if (currentRecordsPage > 1) {
      setCurrentRecordsPage(currentRecordsPage - 1);
    }
  };

  const handleNextRecordsPage = () => {
    if (currentRecordsPage < totalRecordsPages) {
      setCurrentRecordsPage(currentRecordsPage + 1);
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'my') {
      // 다른 탭을 선택하면 홈으로 돌아가기
      onBack();
    }
  };

  const handleMigration = async () => {
    try {
      console.log('=== 마이그레이션 시작 ===');
      const response = await migrationService.migrateRunningData();
      console.log('마이그레이션 응답:', response);
      setMigrationStatus(response.data);
      
      // 마이그레이션 후 데이터 다시 로드
      await loadData();
    } catch (error) {
      console.error('마이그레이션 실패:', error);
      setMigrationStatus({ error: error.message });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round((minutes % 60) * 100) / 100; // 소수점 2자리로 제한
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  const formatPace = (pace) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };

  const getScoreGrade = (score) => {
    if (score >= 500) return { grade: 'S', color: 'text-purple-500' };
    if (score >= 400) return { grade: 'A', color: 'text-blue-500' };
    if (score >= 300) return { grade: 'B', color: 'text-green-500' };
    if (score >= 200) return { grade: 'C', color: 'text-yellow-500' };
    return { grade: 'D', color: 'text-red-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-sm mx-auto relative">
        <Header user={user} />
        
        <div className="px-4 py-6 pb-20 min-h-screen">
          {/* 상단 영역 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">내 기록</h1>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-gray-400 hover:text-white active:text-white transition-colors disabled:opacity-50 p-2 touch-manipulation"
                title="새로고침"
              >
                {refreshing ? (
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-xl">🔄</span>
                )}
              </button>
            </div>

            {/* 기간 선택 버튼 */}
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
            />

            {/* 마이그레이션 버튼 */}
            {runningRecords.length === 0 && (
              <div className="mb-4 p-4 bg-yellow-900 border border-yellow-600 rounded-lg">
                <div className="text-yellow-200 text-sm mb-2">
                  기존 런닝 데이터를 새로운 시스템으로 마이그레이션해야 합니다.
                </div>
                <button
                  onClick={handleMigration}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  데이터 마이그레이션 실행
                </button>
                {migrationStatus && (
                  <div className="mt-2 text-sm">
                    {migrationStatus.error ? (
                      <div className="text-red-400">에러: {migrationStatus.error}</div>
                    ) : (
                      <div className="text-green-400">
                        마이그레이션 완료: {migrationStatus.migrated}개 데이터 처리됨
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 그래프 */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <TrendGraph
                data={graphData}
                period={selectedPeriod}
              />
            </div>

            {/* 개인 기록 요약 */}
            {personalRecords && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-800 rounded-xl p-4 touch-manipulation">
                  <div className="text-gray-400 text-xs mb-2">총 런닝</div>
                  <div className="text-white text-xl font-bold">
                    {personalRecords.totalRuns || 0}회
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 touch-manipulation">
                  <div className="text-gray-400 text-xs mb-2">총 거리</div>
                  <div className="text-white text-xl font-bold">
                    {personalRecords.totalDistance?.toFixed(2) || 0}km
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 touch-manipulation">
                  <div className="text-gray-400 text-xs mb-2">최고 점수</div>
                  <div className="text-white text-xl font-bold">
                    {(personalRecords.bestScore || 0).toFixed(2)}점
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 touch-manipulation">
                  <div className="text-gray-400 text-xs mb-2">최장 거리</div>
                  <div className="text-white text-xl font-bold">
                    {personalRecords.longestDistance?.toFixed(2) || 0}km
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 하단 영역 - 런닝 기록 카드들 */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">최근 런닝 기록</h2>
              {totalRecordsPages > 1 && (
                <div className="text-xs text-gray-400">
                  {currentRecordsPage} / {totalRecordsPages} 페이지
                </div>
              )}
            </div>
            
            {runningRecords.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg">아직 런닝 기록이 없습니다</div>
                <div className="text-gray-500 text-sm mt-2">첫 번째 런닝을 시작해보세요!</div>
              </div>
            ) : (
              <div className="space-y-4">
                {runningRecords.map((record) => {
                  const score = record.runningScore || 0;
                  const scoreGrade = getScoreGrade(score);
                  return (
                    <RunningRecordCard
                      key={record._id}
                      record={record}
                      formatDate={formatDate}
                      formatDuration={formatDuration}
                      formatPace={formatPace}
                      scoreGrade={scoreGrade}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* 런닝 기록 페이지네이션 */}
          {totalRecordsPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={handlePrevRecordsPage}
                disabled={currentRecordsPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 active:bg-gray-500 transition-colors touch-manipulation text-sm"
              >
                ← 이전
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalRecordsPages) }, (_, i) => {
                  let pageNum;
                  if (totalRecordsPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentRecordsPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentRecordsPage >= totalRecordsPages - 2) {
                    pageNum = totalRecordsPages - 4 + i;
                  } else {
                    pageNum = currentRecordsPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleRecordsPageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm touch-manipulation ${
                        currentRecordsPage === pageNum 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={handleNextRecordsPage}
                disabled={currentRecordsPage === totalRecordsPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 active:bg-gray-500 transition-colors touch-manipulation text-sm"
              >
                다음 →
              </button>
            </div>
          )}
        </div>
        
        {/* 하단 탭바 */}
        <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};

export default MyRecords;
