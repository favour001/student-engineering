import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BUSINESS_PERMISSION_KEY } from '../decorators/require_business_permission.decorator';
import { ALLOW_NO_PERMISSION } from '../decorators/permission.decorator';
import { PERMISSION_KEY } from '../decorators/require_permission.decorator';
import {
  buildStudentBusinessPermission,
  resolveStudentBusinessCategory,
  StudentBusinessPermissionMetadata,
} from '../student-business/student-business.permissions';
import { SysPermissionService } from '../sys-permission/sys-permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: SysPermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowNoPermission = this.reflector.getAllAndOverride<boolean>(
      ALLOW_NO_PERMISSION,
      [context.getHandler(), context.getClass()],
    );

    if (allowNoPermission) {
      console.log('Permission Guard: Route allows no permission check');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const businessPermission =
      this.reflector.getAllAndOverride<StudentBusinessPermissionMetadata>(
        BUSINESS_PERMISSION_KEY,
        [context.getHandler(), context.getClass()],
      );

    let requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (businessPermission) {
      const category = resolveStudentBusinessCategory(request, businessPermission);
      requiredPermissions = [
        buildStudentBusinessPermission(category, businessPermission.action),
      ];
    }

    if (!requiredPermissions || requiredPermissions.length === 0) {
      console.log('Permission Guard: No permissions required for this route');
      return true;
    }

    const user = request.user;

    console.log('Permission Guard: Checking permissions', {
      requiredPermissions,
      userId: user?.id,
    });

    if (!user) {
      console.error('Permission Guard: User not found in request');
      throw new UnauthorizedException('User not logged in');
    }

    const userPermissions = await this.permissionService.getUserPermissions(
      user.id,
    );
    console.log('Permission Guard: User permissions', userPermissions);

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      console.error('Permission Guard: Permission denied', {
        required: requiredPermissions,
        userHas: userPermissions,
      });
      throw new ForbiddenException(
        `Permission denied, requires one of: ${requiredPermissions.join(', ')}`,
      );
    }

    console.log('Permission Guard: Permission check passed');
    return true;
  }
}
