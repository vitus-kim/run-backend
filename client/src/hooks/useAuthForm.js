import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const useAuthForm = (initialData, validationRules) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 이메일 검증
    if (validationRules.email) {
      if (!formData.email) {
        newErrors.email = '이메일을 입력해주세요';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = '올바른 이메일 형식을 입력해주세요';
      }
    }

    // 닉네임 검증
    if (validationRules.nickname) {
      if (!formData.nickname) {
        newErrors.nickname = '닉네임을 입력해주세요';
      } else if (formData.nickname.length < 2) {
        newErrors.nickname = '닉네임은 최소 2자 이상이어야 합니다';
      } else if (formData.nickname.length > 20) {
        newErrors.nickname = '닉네임은 최대 20자까지 가능합니다';
      }
    }

    // 비밀번호 검증
    if (validationRules.password) {
      if (!formData.password) {
        newErrors.password = '비밀번호를 입력해주세요';
      } else if (formData.password.length < 8) {
        newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
      }
    }

    // 비밀번호 확인 검증
    if (validationRules.confirmPassword) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
      }
    }

    // 성별 검증
    if (validationRules.gender) {
      if (!formData.gender) {
        newErrors.gender = '성별을 선택해주세요';
      }
    }

    // 키 검증
    if (validationRules.height) {
      if (!formData.height) {
        newErrors.height = '키를 입력해주세요';
      } else if (isNaN(formData.height) || formData.height < 100 || formData.height > 250) {
        newErrors.height = '키는 100cm ~ 250cm 사이의 숫자를 입력해주세요';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, submitFunction) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await submitFunction(formData);
    } catch (error) {
      console.error('폼 제출 오류:', error);
      setErrors({ submit: error.message || '요청 처리에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    errors,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleChange,
    handleSubmit,
    setErrors
  };
};


