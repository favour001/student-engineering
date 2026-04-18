export interface SeedConfig {
  users?: any[];
  departments?: any[];
  posts?: any[];
  roles?: any[];
  menus?: any[];
  relations?: {
    roleMenus?: any[];
    userRoles?: any[];
    userPosts?: any[];
    userDepartments?: any[];
  };
}

export interface SeedStats {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  total: number;
}