import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authService } from '../services/authService';
import { appStore } from '@/store';
import type { LoginRequest } from '../types';

const getCookieOptions = (days: number) => ({
  expires: days,
  secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
  sameSite: 'lax' as const,
});

export const useLogin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    setError('');
    
    try {
      // Step 1: Login and get complete user info + tokens
      const loginData = await authService.login(credentials);
      console.log('登录成功:', loginData);
      
      // Store user ID and user info from login response
      const userInfo = {
        id: loginData.id,
        userName: loginData.userName,
        account: loginData.account,
        email: loginData.email,
        phoneNumber: loginData.phoneNumber,
        profileImage: loginData.profileImage,
      };
      
      appStore.pageDomain.login.userId = loginData.id;
      appStore.pageDomain.home.uiDomain.layout.leftSidebar.userInfo = userInfo;
      
      // Save userInfo to cookies
      Cookies.set('userInfo', JSON.stringify(userInfo), getCookieOptions(7));
      
      console.log('✅ 登录成功，跳转到首页');
      router.replace('/home');
      return loginData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败';
      setError(errorMessage);
      console.error('登录失败:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
    setError,
  };
};
