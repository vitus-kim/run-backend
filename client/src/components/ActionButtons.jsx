import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActionButtons = ({ onShowMyRecords }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <button 
        onClick={() => navigate('/running/create')}
        className="w-full py-4 rounded-lg text-white font-medium text-lg transition-all duration-300 hover:shadow-lg"
        style={{ 
          backgroundColor: '#3B82F6',
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)'
        }}
      >
        🏃‍♂️ 런닝 기록 작성하기
      </button>
      
      <button 
        onClick={onShowMyRecords}
        className="w-full py-4 rounded-lg text-white font-medium text-lg transition-all duration-300 hover:shadow-lg"
        style={{ 
          backgroundColor: '#404040',
          boxShadow: '0 0 20px rgba(64, 64, 64, 0.5)'
        }}
      >
        📊 내 기록 보기
      </button>
    </div>
  );
};

export default ActionButtons;

