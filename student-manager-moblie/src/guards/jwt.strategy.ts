import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
  constructor(configService: ConfigService){
    const secret = configService.get<string>('JWT_SECRET');
    console.log('JWT Strategy initialized with secret:', secret ? '***configured***' : 'NOT CONFIGURED');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret
    })
  }

  // 这个方法已经在passport内部自己验证并解码JSON，它调用了我们的validate，并把参数传给我们
  async validate(payload: any) {
    console.log('JWT validate called with payload:', payload);
    return { id: payload.sub, username: payload.userName, account: payload.account }
  }
}