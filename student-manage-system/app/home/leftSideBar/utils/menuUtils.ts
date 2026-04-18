import type { MenuItem } from '../services/menuService';

const PATH_ALIAS_MAP: Record<string, string> = {
  '/system/user': '/home/main/pages/platform/user',
  '/system/role': '/home/main/pages/platform/role',
  '/system/menu': '/home/main/pages/platform/menu',
  '/system/department': '/home/main/pages/platform/department',
  '/system/post': '/home/main/pages/platform/post',
  '/business/member-style': '/home/main/pages/business/member-style',
  '/business/association-intro': '/home/main/pages/business/association-intro',
  '/business/joining-guide': '/home/main/pages/business/joining-guide',
  '/business/notice': '/home/main/pages/business/notice',
  '/business/article': '/home/main/pages/business/article',
  '/business/innovation-shunde': '/home/main/pages/business/innovation-shunde',
  '/business/study-abroad-news': '/home/main/pages/business/study-abroad-news',
  '/business/banner': '/home/main/pages/business/banner',
  '/business/service-platform': '/home/main/pages/business/service-platform',
  '/business/wechat-user': '/home/main/pages/business/wechat-user',
};

const builtInBusinessMenus: MenuItem[] = [
  {
    id: -100,
    name: '业务管理',
    code: 'business',
    type: 1,
    category: 2,
    status: 0,
    icon: 'business',
    path: '/business',
    sortNumber: 1,
    parentId: null,
    children: [
      { id: -101, name: '成员风采', code: 'member-style', type: 2, category: 2, status: 0, icon: 'member-style', path: '/business/member-style', sortNumber: 1, parentId: -100 },
      { id: -102, name: '协会介绍', code: 'association-intro', type: 2, category: 2, status: 0, icon: 'association-intro', path: '/business/association-intro', sortNumber: 2, parentId: -100 },
      { id: -103, name: '入会须知', code: 'joining-guide', type: 2, category: 2, status: 0, icon: 'joining-guide', path: '/business/joining-guide', sortNumber: 3, parentId: -100 },
      { id: -104, name: '公告管理', code: 'notice', type: 2, category: 2, status: 0, icon: 'notice', path: '/business/notice', sortNumber: 4, parentId: -100 },
      { id: -105, name: '文章管理', code: 'article', type: 2, category: 2, status: 0, icon: 'article', path: '/business/article', sortNumber: 5, parentId: -100 },
      { id: -106, name: '留创顺德', code: 'innovation-shunde', type: 2, category: 2, status: 0, icon: 'innovation-shunde', path: '/business/innovation-shunde', sortNumber: 6, parentId: -100 },
      { id: -107, name: '留学资讯', code: 'study-abroad-news', type: 2, category: 2, status: 0, icon: 'study-abroad-news', path: '/business/study-abroad-news', sortNumber: 7, parentId: -100 },
      { id: -108, name: '轮播图管理', code: 'banner', type: 2, category: 2, status: 0, icon: 'banner', path: '/business/banner', sortNumber: 8, parentId: -100 },
      { id: -109, name: '服务平台', code: 'service-platform', type: 2, category: 2, status: 0, icon: 'service-platform', path: '/business/service-platform', sortNumber: 9, parentId: -100 },
      { id: -110, name: '微信用户信息', code: 'wechat-user', type: 2, category: 2, status: 0, icon: 'wechat-user', path: '/business/wechat-user', sortNumber: 10, parentId: -100 },
    ],
  },
];

const normalizeMenuPath = (path?: string) => {
  if (!path) {
    return path;
  }

  return PATH_ALIAS_MAP[path] || path;
};

const normalizeMenuNode = (menu: MenuItem): MenuItem => ({
  ...menu,
  path: normalizeMenuPath(menu.path),
  children: menu.children?.map(normalizeMenuNode),
});

/**
 * 构建菜单树结构
 * @param menus 扁平菜单数组
 * @returns 树形菜单数组
 */
export const buildMenuTree = (menus: MenuItem[]): MenuItem[] => {
  // 只保留目录(type=1)和菜单(type=2)，过滤掉按钮(type=3)
  const validMenus = menus
    .filter(menu => menu.type === 1 || menu.type === 2)
    .map(normalizeMenuNode);
  
  // 创建 id 到菜单项的映射
  const menuMap = new Map<number, MenuItem>();
  validMenus.forEach(menu => {
    menuMap.set(menu.id, { ...menu, children: [] });
  });
  
  // 构建树形结构
  const tree: MenuItem[] = [];
  menuMap.forEach(menu => {
    if (menu.parentId === null || menu.parentId === undefined) {
      // 根节点
      tree.push(menu);
    } else {
      // 子节点
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(menu);
      }
    }
  });
  
  // 按 sortNumber 排序
  sortMenus(tree);
  return tree;
};

/**
 * 递归排序菜单项
 * @param items 菜单项数组
 */
const sortMenus = (items: MenuItem[]) => {
  items.sort((a, b) => a.sortNumber - b.sortNumber);
  items.forEach(item => {
    if (item.children && item.children.length > 0) {
      sortMenus(item.children);
    }
  });
};

/**
 * 过滤菜单项，只保留指定类型
 * @param menus 菜单数组
 * @param types 允许的类型数组
 * @returns 过滤后的菜单数组
 */
export const filterMenusByType = (menus: MenuItem[], types: number[]): MenuItem[] => {
  return menus.filter(menu => types.includes(menu.type));
};

/**
 * 根据分类过滤菜单
 * @param menus 菜单数组
 * @param category 分类 (1: 平台, 2: 项目)
 * @returns 过滤后的菜单数组
 */
export const filterMenusByCategory = (menus: MenuItem[], category: number): MenuItem[] => {
  return menus.filter(menu => menu.category === category);
};

export const ensureBuiltInMenus = (menus: MenuItem[]): MenuItem[] => {
  const hasBusinessRoot = menus.some((menu) => menu.code === 'business');
  if (hasBusinessRoot) {
    return menus.map(normalizeMenuNode);
  }

  return [...menus.map(normalizeMenuNode), ...builtInBusinessMenus];
};

/**
 * 查找菜单项
 * @param menus 菜单数组
 * @param predicate 查找条件
 * @returns 找到的菜单项或 undefined
 */
export const findMenuItem = (
  menus: MenuItem[], 
  predicate: (menu: MenuItem) => boolean
): MenuItem | undefined => {
  for (const menu of menus) {
    if (predicate(menu)) {
      return menu;
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuItem(menu.children, predicate);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};
