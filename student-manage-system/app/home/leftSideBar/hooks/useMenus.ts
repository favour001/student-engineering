import { useEffect, useState, useRef } from 'react';
import { menuService } from '../services/menuService';
import { appStore } from '@/store';
import { buildMenuTree, ensureBuiltInMenus, filterMenusByCategory } from '../utils/menuUtils';

export const useMenus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // 防止重复加载（React Strict Mode 会导致 useEffect 执行两次）
    if (hasLoadedRef.current) {
      console.log('⏭️ 菜单已加载，跳过重复请求');
      return;
    }

    const fetchMenus = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('🔄 开始加载菜单...');
        const menus = ensureBuiltInMenus(await menuService.getUserMenus());
        console.log('📦 原始菜单数据:', menus);
        
        // Separate menus by category and build tree structure
        const platformTree = buildMenuTree(filterMenusByCategory(menus, 1));
        const projectTree = buildMenuTree(filterMenusByCategory(menus, 2));
        
        console.log('🌲 平台菜单树:', platformTree);
        console.log('🌲 项目菜单树:', projectTree);
        
        appStore.pageDomain.home.uiDomain.layout.leftSidebar.menu.platform = platformTree;
        appStore.pageDomain.home.uiDomain.layout.leftSidebar.menu.project = projectTree;
        
        hasLoadedRef.current = true;
        console.log('✅ 菜单加载完成');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '菜单加载失败';
        setError(errorMessage);
        console.error('❌ 菜单加载失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return {
    loading,
    error,
  };
};
