import { Controller, Get, Post, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AllowNoToken } from './decorators/token.decorator';
import { AllowNoPermission } from './decorators/permission.decorator'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly authService:AuthService) {}

  @Get()
  @AllowNoToken()
  getHello(): string {
    return this.appService.getHello();
  }

}
