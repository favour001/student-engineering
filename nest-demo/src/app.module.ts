import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from './logger/logger.module';
import { SysUserModule } from './sys-user/sys-user.module';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import { AllExceptionsFilter } from './filter/all-exception.filter';
import { HttpResponseInterceptor } from './interceptor/http-response.interceptor';
import { SysPostModule } from './sys-post/sys-post.module';
import { SysDepartmentModule } from './sys-department/sys-department.module';
import { SysRoleModule } from './sys-role/sys-role.module';
import { SysPermissionModule } from './sys-permission/sys-permission.module';
import { SysMenuModule } from './sys-menu/sys-menu.module';
import { StudentBusinessModule } from './student-business/student-business.module';
import { PermissionGuard } from './guards/permission.guard';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory:(configService: ConfigService) => (
        {
          type: 'mysql',
          host: configService.get<string>('MYSQL_HOST'),
          port: configService.get<number>('MYSQL_PORT'),
          username: configService.get<string>('MYSQL_USERNAME'),
          password: configService.get<string>('MYSQL_PASSWORD'),
          database: configService.get<string>('MYSQL_DATA_BASE'),
          synchronize: false,
          autoLoadEntities: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          migrationsRun: false,  // 不自动运行迁移，手动控制
        }
      )
    }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AuthModule,
    LoggerModule,
    SysUserModule,
    SysPostModule,
    SysDepartmentModule,
    SysRoleModule,
    SysPermissionModule,
    SysMenuModule,
    StudentBusinessModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpResponseInterceptor
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard
    }
  ],
})
export class AppModule {}
