import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Strategy } from "passport-local";
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from "../auth/auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
  constructor(private authService: AuthService){
    super({
      usernameField: 'account', // 指定使用 login 字段作为用户名
      passwordField: 'password'
    })
  }

  async validate(account: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(account, password);
    if(!user){
      throw new UnauthorizedException();
    }
    return user;
  }
}