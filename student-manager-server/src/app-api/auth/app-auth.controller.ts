import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { AllowNoToken } from '../../decorators/token.decorator';
import { AppAuthService } from './app-auth.service';

@AllowNoToken()
@Controller('app')
export class AppAuthController {
  constructor(private readonly service: AppAuthService) {}

    @Get('wxlogin/login')
  loginByGet(@Query() query: Record<string, string>, @Req() req: any) {
    return this.service.login(query, req);
  }

    @Post('wxlogin/login')
  @HttpCode(200)
  loginByPost(@Body() body: Record<string, string>, @Req() req: any) {
    return this.service.login(body, req);
  }

    @Post('wxlogin/refresh')
  @HttpCode(200)
  refresh(@Body('refreshToken') refreshToken?: string, @Body('refresh_token') refreshTokenAlt?: string, @Req() req?: any) {
    return this.service.refresh(refreshToken || refreshTokenAlt || '', req);
  }

    @Get('auth/me')
  me(@Headers('authorization') authorization?: string, @Headers('token') token?: string) {
    return this.service.me(authorization, token);
  }
}
