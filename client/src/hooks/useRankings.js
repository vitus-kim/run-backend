import { useState, useEffect } from 'react';
import { scoreService } from '../services/scoreService';

export const useRankings = (loading) => {
  const [activeTab, setActiveTab] = useState('overall');
  const [rankings, setRankings] = useState([]);
  const [rankingsLoading, setRankingsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [weekStart, setWeekStart] = useState(null);

  // 랭킹 데이터 로드 함수
  const loadRankings = async (tab, page = 1) => {
    setRankingsLoading(true);
    try {
      console.log('랭킹 로드 시작:', { tab, page, weekStart });
      
      let response;
      switch (tab) {
        case 'overall':
          response = await scoreService.getScoreRankings('overall', weekStart, page, 10);
          break;
        case 'distance':
          response = await scoreService.getScoreRankings('distance', weekStart, page, 10);
          break;
        case 'speed':
          response = await scoreService.getScoreRankings('speed', weekStart, page, 10);
          break;
        default:
          response = await scoreService.getScoreRankings('overall', weekStart, page, 10);
      }
      
      console.log('랭킹 응답:', response);
      console.log('랭킹 데이터:', response.rankings);
      
      setRankings(response.rankings || []);
      setCurrentPage(page);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('랭킹 로드 오류:', error);
      setRankings([]);
    } finally {
      setRankingsLoading(false);
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    loadRankings(tab, 1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadRankings(activeTab, page);
  };

  // 컴포넌트 마운트 시 랭킹 로드
  useEffect(() => {
    if (!loading) {
      // 서버에서 자동으로 최신 점수 데이터의 weekStart를 사용하도록 설정
      setWeekStart(null);
      loadRankings(activeTab);
    }
  }, [loading]);

  return {
    activeTab,
    rankings,
    rankingsLoading,
    currentPage,
    totalPages,
    handleTabChange,
    handlePageChange
  };
};


