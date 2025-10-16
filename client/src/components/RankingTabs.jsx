import React from 'react';

const RankingTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overall', label: '🏆 종합' },
    { id: 'distance', label: '📏 거리' },
    { id: 'speed', label: '⚡ 속도' }
  ];

  return (
    <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
            activeTab === tab.id
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default RankingTabs;



