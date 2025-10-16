// 주간 날짜 계산 유틸리티
const calculateWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const diff = d.getDate() - dayOfWeek;
  const weekStart = new Date(d.setDate(diff));
  return weekStart;
};

const calculateWeekEnd = (weekStart) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd;
};

const getCurrentWeek = () => {
  const now = new Date();
  const weekStart = calculateWeekStart(now);
  const weekEnd = calculateWeekEnd(weekStart);
  
  return {
    weekStart,
    weekEnd,
    currentDate: now
  };
};

module.exports = {
  calculateWeekStart,
  calculateWeekEnd,
  getCurrentWeek
};



