import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { ALLOW_NO_TOKEN } from "../decorators/token.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const allowNoToken = this.reflector.getAllAndOverride<boolean>(ALLOW_NO_TOKEN, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (allowNoToken) {
      console.log('Route allows no token, skipping JWT validation');
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
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

}