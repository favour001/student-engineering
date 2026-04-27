import { Controller, Post, HttpCode, HttpStatus, UseGuards, Request, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AllowNoToken } from '../decorators/token.decorator';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('认证管理')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	//登录
	@HttpCode(HttpStatus.OK)
	@Post('login')
	@AllowNoToken()
	@UseGuards(LocalAuthGuard)
	async login(@Req() req: any) {
		// console.log('sss:',await this.authService.login(req))
		return await this.authService.login(req);
	}
	@HttpCode(HttpStatus.OK)
	@Post('refresh')
	@AllowNoToken()
	@ApiOperation({ summary: '刷新访问令牌' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				refresh_token: { type: 'string', description: 'Refresh Token' }
			}
		}
	})
	async refresh(@Body('refresh_token') refreshToken: string) {
		return this.authService.refreshAccessToken(refreshToken);
	}
	@UseGuards(LocalAuthGuard)
	@ApiOperation({ summary: '用户登出' })
	@Post('logout')
	async logout(@Request() req: any, @Body('refresh_token') refreshToken?: string) {
		await this.authService.logout(req.user.id, refreshToken);
		return { message: 'Logout successful' };
	}

	@Post('revoke-tokens')
  @ApiOperation({ summary: '吊销所有令牌（用于密码修改等场景）' })
  async revokeTokens(@Request() req: any, @Body('reason') reason?: string) {
    await this.authService.revokeAllUserTokens(req.user.id, reason);
    return { message: 'All tokens revoked' };
  }
}
