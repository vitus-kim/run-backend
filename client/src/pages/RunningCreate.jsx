import React, { useState } from 'react';
import Header from '../components/Header';
import FormField from '../components/FormField';
import SelectField from '../components/SelectField';
import DurationInput from '../components/DurationInput';
import DatePicker from '../components/DatePicker';
import BottomTabBar from '../components/BottomTabBar';
import { useRunningForm } from '../hooks/useRunningForm';

const RunningCreate = () => {
  const { formData, loading, errors, handleChange, handleSubmit } = useRunningForm();
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

  const runningTypeOptions = [
    { value: 'easy', label: 'Easy (쉬운 런)' },
    { value: 'tempo', label: 'Tempo (템포 런)' },
    { value: 'interval', label: 'Interval (인터벌)' },
    { value: 'long', label: 'Long (장거리)' },
    { value: 'race', label: 'Race (경주)' }
  ];

  const weatherOptions = [
    { value: 'sunny', label: '☀️ 맑음' },
    { value: 'cloudy', label: '☁️ 흐림' },
    { value: 'rainy', label: '🌧️ 비' },
    { value: 'windy', label: '💨 바람' }
  ];

  const feelingOptions = [
    { value: 'excellent', label: '😍 최고' },
    { value: 'good', label: '😊 좋음' },
    { value: 'average', label: '😐 보통' },
    { value: 'poor', label: '😔 나쁨' }
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-sm mx-auto relative">
        <Header />
        <div className="px-4 py-6 pb-20 min-h-screen">
          <h1 className="text-2xl font-bold text-white mb-6">런닝 기록 작성</h1>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              label="거리 (km)"
              name="distance"
              type="number"
              value={formData.distance}
              onChange={handleChange}
              error={errors.distance}
              required
              step="0.1"
              min="0.1"
              max="1000"
              placeholder="예: 5.0"
            />

            <DurationInput
              durationMinutes={formData.durationMinutes}
              durationSeconds={formData.durationSeconds}
              onDurationChange={handleChange}
              error={errors.duration}
            />

            <DatePicker
              selectedDate={formData.date}
              onDateSelect={(date) => handleChange({ target: { name: 'date', value: date } })}
              error={errors.date}
            />

            <SelectField
              label="런닝 타입"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={runningTypeOptions}
            />

            <SelectField
              label="날씨"
              name="weather"
              value={formData.weather}
              onChange={handleChange}
              options={weatherOptions}
            />

            <SelectField
              label="런닝 느낌"
              name="feeling"
              value={formData.feeling}
              onChange={handleChange}
              options={feelingOptions}
            />

            <FormField
              label="메모"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              placeholder="런닝에 대한 메모를 작성해주세요..."
            />
            <p className="text-xs mt-1" style={{ color: '#999999' }}>
              {formData.notes.length}/500
            </p>

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
              {loading ? '저장 중...' : '런닝 기록 저장하기'}
            </button>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full py-3 rounded-xl text-white font-medium transition-all duration-200 hover:shadow-lg active:scale-95 touch-manipulation"
              style={{ 
                backgroundColor: '#404040',
                boxShadow: '0 0 20px rgba(64, 64, 64, 0.5)'
              }}
            >
              취소
            </button>
          </form>
        </div>
        
        {/* 하단 탭바 */}
        <BottomTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};

export default RunningCreate;
