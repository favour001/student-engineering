import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { AllowNoToken } from '../../decorators/token.decorator';
import { AppUserService } from './app-user.service';

@AllowNoToken()
@Controller('app')
export class AppUserController {
  constructor(private readonly service: AppUserService) {}

    @Get('wxuser/get/:id')
  getWxUser(@Param('id') id: string) {
    return this.service.getWxUser(Number(id));
  }

    @Post('wxuser/update')
  @HttpCode(200)
  updateWxUser(@Body() body: Record<string, any>) {
    return this.service.updateWxUser(body);
  }
}
