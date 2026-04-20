import { Migration } from '../interfaces/migration.interface';

export class InitialSchema1709024400000 implements Migration {
  name = 'InitialSchema';
  timestamp = 1709024400000;

  public async up(queryRunner: any): Promise<void> {
    // 创建部门表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sys_department\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL COMMENT '部门名称',
        \`code\` varchar(255) NOT NULL COMMENT '部门编码',
        \`sort_number\` int NOT NULL DEFAULT 0 COMMENT '排序号',
        \`status\` int NOT NULL DEFAULT 0 COMMENT '状态',
        \`describe\` varchar(500) NULL COMMENT '描述',
        \`create_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
        \`update_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
        \`create_by\` varchar(255) NULL COMMENT '创建人',
        \`update_by\` varchar(255) NULL COMMENT '更新人',
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_department_code\` (\`code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建岗位表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sys_post\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL COMMENT '岗位名称',
        \`code\` varchar(255) NOT NULL COMMENT '岗位编码',
        \`sort_number\` int NOT NULL DEFAULT 0 COMMENT '排序号',
        \`status\` int NOT NULL DEFAULT 0 COMMENT '状态',
        \`describe\` varchar(500) NULL COMMENT '描述',
        \`create_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
        \`update_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
        \`create_by\` varchar(255) NULL COMMENT '创建人',
        \`update_by\` varchar(255) NULL COMMENT '更新人',
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_post_code\` (\`code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建菜单表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sys_menu\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL COMMENT '菜单名称',
        \`code\` varchar(255) NOT NULL COMMENT '菜单编码',
        \`type\` int NOT NULL COMMENT '菜单类型',
        \`category\` int NOT NULL COMMENT '菜单分类',
        \`permission\` varchar(255) NULL COMMENT '权限标识',
        \`path\` varchar(255) NULL COMMENT '路由地址',
        \`component\` varchar(255) NULL COMMENT '组件路径',
        \`icon\` varchar(255) NULL COMMENT '图标',
        \`parent_id\` int NULL COMMENT '父菜单ID',
        \`sort_number\` int NOT NULL DEFAULT 0 COMMENT '排序号',
        \`status\` int NOT NULL DEFAULT 0 COMMENT '状态',
        \`describe\` varchar(500) NULL COMMENT '描述',
        \`create_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
        \`update_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
        \`create_by\` varchar(255) NULL COMMENT '创建人',
        \`update_by\` varchar(255) NULL COMMENT '更新人',
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_menu_code\` (\`code\`),
        INDEX \`IDX_menu_parent\` (\`parent_id\`),
        CONSTRAINT \`FK_menu_parent\` FOREIGN KEY (\`parent_id\`) REFERENCES \`sys_menu\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建角色表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sys_role\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL COMMENT '角色名称',
        \`code\` varchar(255) NOT NULL COMMENT '角色编码',
        \`sort_number\` int NOT NULL DEFAULT 0 COMMENT '排序号',
        \`status\` int NOT NULL DEFAULT 0 COMMENT '状态',
        \`describe\` varchar(500) NULL COMMENT '描述',
        \`create_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
        \`update_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
        \`create_by\` varchar(255) NULL COMMENT '创建人',
        \`update_by\` varchar(255) NULL COMMENT '更新人',
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_role_code\` (\`code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建用户表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sys_user\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`user_name\` varchar(255) NOT NULL COMMENT '用户名',
        \`nick_name\` varchar(255) NULL COMMENT '昵称',
        \`phone\` varchar(255) NULL COMMENT '手机号',
        \`email\` varchar(255) NULL COMMENT '邮箱',
        \`status\` int NOT NULL DEFAULT 0 COMMENT '状态',
        \`del_status\` int NOT NULL DEFAULT 0 COMMENT '删除状态',
        \`account\` varchar(255) NOT NULL COMMENT '登录名',
        \`password\` varchar(255) NOT NULL COMMENT '密码',
        \`create_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
        \`update_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
        \`create_by\` varchar(255) NULL COMMENT '创建人',
        \`update_by\` varchar(255) NULL COMMENT '更新人',
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_user_account\` (\`account\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建刷新令牌表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`refresh_token\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`user_id\` int NOT NULL COMMENT '用户ID',
        \`token\` varchar(500) NOT NULL COMMENT '刷新令牌',
        \`device_info\` varchar(1000) NULL COMMENT '设备信息',
        \`ip_address\` varchar(50) NULL COMMENT 'IP地址',
        \`expires_time\` datetime NOT NULL COMMENT '过期时间',
        \`is_revoked\` tinyint NOT NULL DEFAULT 0 COMMENT '是否已吊销',
        \`created_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
        \`revoked_time\` datetime NULL COMMENT '吊销时间',
        \`revoke_reason\` varchar(100) NULL COMMENT '吊销原因',
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_refresh_token_token\` (\`token\`),
        INDEX \`IDX_refresh_token_user\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建角色-菜单关联表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sys_role_menu\` (
        \`role_id\` int NOT NULL,
        \`menu_id\` int NOT NULL,
        PRIMARY KEY (\`role_id\`, \`menu_id\`),
        INDEX \`IDX_role_menu_role\` (\`role_id\`),
        INDEX \`IDX_role_menu_menu\` (\`menu_id\`),
        CONSTRAINT \`FK_role_menu_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`sys_role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`FK_role_menu_menu\` FOREIGN KEY (\`menu_id\`) REFERENCES \`sys_menu\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建用户-角色关联表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sys_user_role\` (
        \`user_id\` int NOT NULL,
        \`role_id\` int NOT NULL,
        PRIMARY KEY (\`user_id\`, \`role_id\`),
        INDEX \`IDX_user_role_user\` (\`user_id\`),
        INDEX \`IDX_user_role_role\` (\`role_id\`),
        CONSTRAINT \`FK_user_role_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`sys_user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`FK_user_role_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`sys_role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建用户-岗位关联表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sys_user_post\` (
        \`user_id\` int NOT NULL,
        \`post_id\` int NOT NULL,
        PRIMARY KEY (\`user_id\`, \`post_id\`),
        INDEX \`IDX_user_post_user\` (\`user_id\`),
        INDEX \`IDX_user_post_post\` (\`post_id\`),
        CONSTRAINT \`FK_user_post_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`sys_user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`FK_user_post_post\` FOREIGN KEY (\`post_id\`) REFERENCES \`sys_post\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建用户-部门关联表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sys_user_department\` (
        \`user_id\` int NOT NULL,
        \`department_id\` int NOT NULL,
        PRIMARY KEY (\`user_id\`, \`department_id\`),
        INDEX \`IDX_user_department_user\` (\`user_id\`),
        INDEX \`IDX_user_department_department\` (\`department_id\`),
        CONSTRAINT \`FK_user_department_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`sys_user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`FK_user_department_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`sys_department\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 创建迁移记录表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`migrations\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`timestamp\` bigint NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`executed_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`UQ_migrations_timestamp_name\` (\`timestamp\`, \`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: any): Promise<void> {
    // 删除关联表
    await queryRunner.query(`DROP TABLE IF EXISTS \`sys_user_department\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`sys_user_post\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`sys_user_role\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`sys_role_menu\``);
    
    // 删除主表
    await queryRunner.query(`DROP TABLE IF EXISTS \`refresh_token\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`sys_user\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`sys_role\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`sys_menu\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`sys_post\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`sys_department\``);
    
    // 删除迁移记录表
    await queryRunner.query(`DROP TABLE IF EXISTS \`migrations\``);
  }
}
