import React from 'react';

const BottomTabBar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'course', label: '코스', icon: '🏃‍♂️' },
    { id: 'feed', label: '피드', icon: '📱' },
    { id: 'home', label: '홈', icon: '🏠' },
    { id: 'lightning', label: '번개', icon: '⚡' },
    { id: 'my', label: '마이', icon: '👤' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-20">
      <div className="max-w-sm mx-auto">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-all duration-200 touch-manipulation ${
                activeTab === tab.id
                  ? 'text-blue-400 bg-gray-800'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 active:bg-gray-700'
              }`}
            >
              <div className="text-lg mb-1">{tab.icon}</div>
              <div className="text-xs font-medium">{tab.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomTabBar;
