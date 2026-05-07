import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { ALLOW_NO_TOKEN } from "../decorators/token.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
  private readonly publicAppPathPatterns = [
    /^\/?api\/app\/wxlogin\/(login|refresh)\/?$/,
    /^\/?api\/app\/banner\/(list|info\/\d+)\/?$/,
    /^\/?api\/app\/article\/(list|get\/\d+)\/?$/,
    /^\/?api\/app\/quick-access\/list\/?$/,
    /^\/?api\/app\/xiehui\/get\/\d+\/?$/,
    /^\/?api\/app\/ruhui\/get\/\d+\/?$/,
    /^\/?api\/app\/member-style(\/.*)?$/,
    /^\/?api\/app\/activity\/(list|get\/[^/]+\/[^/]+)\/?$/,
    /^\/?api\/app\/card\/(list\/.*|categories\/[^/]+|detail\/[^/]+\/[^/]+|vip\/info\/[^/]+|welfare\/info\/[^/]+)\/?$/,
  ];

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const requestPath = String(request.originalUrl || request.url || '').split('?')[0];
    if (this.isPublicAppPath(requestPath)) {
      console.log('JWT Guard: public app path, skipping JWT validation');
      return true;
    }

    const allowNoToken = this.reflector.getAllAndOverride<boolean>(ALLOW_NO_TOKEN, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (allowNoToken) {
      console.log('Route allows no token, skipping JWT validation');
      return true;
    }
    
    const authHeader = request.headers.authorization;
    console.log('JWT Guard - Authorization header:', authHeader ? 'Bearer ***' : 'MISSING');
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      console.error('JWT Auth failed:', {
        error: err?.message,
        info: info?.message,
        user: user
      });
      throw err || new UnauthorizedException('Token验证失败: ' + (info?.message || '未知错误'));
    }
    console.log('JWT Auth successful for user:', user.id);
    return user;
  }

  private isPublicAppPath(path: string): boolean {
    return this.publicAppPathPatterns.some((pattern) => pattern.test(path));
  }

}
