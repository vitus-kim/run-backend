import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { runningService } from '../services/runningService';

export const useRunningForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    distance: '',
    durationMinutes: '',
    durationSeconds: '',
    date: new Date().toISOString().split('T')[0],
    type: 'easy',
    weather: 'sunny',
    feeling: 'good',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // 분:초를 분 단위로 변환하는 함수
  const convertToMinutes = (minutes, seconds) => {
    const mins = parseInt(minutes) || 0;
    const secs = parseInt(seconds) || 0;
    return mins + (secs / 60);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.distance || formData.distance <= 0) {
      newErrors.distance = '거리를 입력해주세요 (0보다 큰 값)';
    }
    
    // 시간 검증 (분 또는 초 중 하나라도 입력되어야 함)
    const totalDuration = convertToMinutes(formData.durationMinutes, formData.durationSeconds);
    
    if (totalDuration <= 0) {
      newErrors.duration = '시간을 입력해주세요 (분 또는 초 중 하나라도 입력)';
    }
    
    if (!formData.date) {
      newErrors.date = '날짜를 선택해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // 분:초를 분 단위로 변환
      const durationInMinutes = convertToMinutes(formData.durationMinutes, formData.durationSeconds);
      
      const runningData = {
        distance: formData.distance,
        duration: durationInMinutes,
        date: formData.date,
        type: formData.type,
        weather: formData.weather,
        feeling: formData.feeling,
        notes: formData.notes
      };
      
      console.log('런닝 기록 저장:', runningData);
      
      // API 호출
      const response = await runningService.createRunning(runningData);
      console.log('런닝 기록 저장 응답:', response);
      
      alert('런닝 기록이 저장되었습니다!');
      navigate('/');
    } catch (error) {
      console.error('런닝 기록 저장 오류:', error);
      setErrors({ submit: error.message || '런닝 기록 저장에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    errors,
    handleChange,
    handleSubmit
  };
};



