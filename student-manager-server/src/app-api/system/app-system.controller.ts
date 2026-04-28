import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { AllowNoToken } from '../../decorators/token.decorator';
import { AppSystemService } from './app-system.service';

@AllowNoToken()
@Controller('app')
export class AppSystemController {
  constructor(private readonly service: AppSystemService) {}

    @Get('post/list')
  listPosts() {
    return this.service.listPosts();
  }

    @Get('dept/list')
  listDepartments() {
    return this.service.listDepartments();
  }
}
