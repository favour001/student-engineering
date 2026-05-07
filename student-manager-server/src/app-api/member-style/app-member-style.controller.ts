import { Controller, Get, Param, Query } from '@nestjs/common';
import { AllowNoToken } from '../../decorators/token.decorator';
import { AppMemberStyleService } from './app-member-style.service';

@AllowNoToken()
@Controller('app/member-style')
export class AppMemberStyleController {
  constructor(private readonly appMemberStyleService: AppMemberStyleService) {}

  @Get('list')
  list(@Query() query: Record<string, string>) {
    return this.appMemberStyleService.list(query);
  }

  @Get('posts')
  listPosts() {
    return this.appMemberStyleService.listPosts();
  }

  @Get('departments')
  listDepartments() {
    return this.appMemberStyleService.listDepartments();
  }

  @Get('awards')
  listAwards() {
    return this.appMemberStyleService.listAwards();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.appMemberStyleService.detail(Number(id));
  }
}
