import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOW_NO_PERMISSION } from '../decorators/permission.decorator';
import { PERMISSION_KEY } from '../decorators/require_permission.decorator';
import { SysPermissionService } from '../sys-permission/sys-permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: SysPermissionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否允许无权限访问
    const allowNoPermission = this.reflector.getAllAndOverride<boolean>(ALLOW_NO_PERMISSION, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (allowNoPermission) {
      console.log('Permission Guard: Route allows no permission check');
      return true;
    }

    // 获取需要的权限
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      console.log('Permission Guard: No permissions required for this route');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('Permission Guard: Checking permissions', {
      requiredPermissions,
      userId: user?.id
    });

    if (!user) {
      console.error('Permission Guard: User not found in request');
      throw new UnauthorizedException('用户未登录');
    }

    // 获取用户权限
    const userPermissions = await this.permissionService.getUserPermissions(user.id);
    console.log('Permission Guard: User permissions', userPermissions);
    
    // 检查用户是否拥有所需权限（OR 逻辑，拥有其中一个即可）
    const hasPermission = requiredPermissions.some((permission) => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      console.error('Permission Guard: Permission denied', {
        required: requiredPermissions,
        userHas: userPermissions
      });
      throw new ForbiddenException(`权限不足，需要权限：${requiredPermissions.join(' 或 ')}`);
    }

    console.log('Permission Guard: Permission check passed');
    return true;
  }
}
