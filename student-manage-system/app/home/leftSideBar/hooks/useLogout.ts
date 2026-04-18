import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authService } from '@/app/login/services/authService';
import { appStore } from '@/store';

export const useLogout = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      
      // Clear state
      appStore.pageDomain.home.uiDomain.layout.leftSidebar.userInfo = null;
      appStore.pageDomain.home.uiDomain.layout.leftSidebar.menu.platform = [];
      appStore.pageDomain.home.uiDomain.layout.leftSidebar.menu.project = [];
      appStore.pageDomain.login.userId = null;
      
      // Clear cookies
      Cookies.remove('userInfo');
      
      console.log('登出成功');
      router.replace('/login');
    } catch (error) {
      console.error('登出失败:', error);
      
      // Clear state even on error
      appStore.pageDomain.home.uiDomain.layout.leftSidebar.userInfo = null;
      appStore.pageDomain.home.uiDomain.layout.leftSidebar.menu.platform = [];
      appStore.pageDomain.home.uiDomain.layout.leftSidebar.menu.project = [];
      appStore.pageDomain.login.userId = null;
      
      // Clear cookies
      Cookies.remove('userInfo');
      
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  return {
    logout,
    loading,
  };
};
