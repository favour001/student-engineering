import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { AllowNoToken } from '../../decorators/token.decorator';
import { AppActivityService } from './app-activity.service';

@AllowNoToken()
@Controller('app')
export class AppActivityController {
  constructor(private readonly service: AppActivityService) {}

    @Get('activity/list')
  listActivities(@Query() query: Record<string, string>) {
    return this.service.listActivities(query);
  }

    @Get('activity/get/:id/:userId')
  getActivity(@Param('id') id: string, @Param('userId') userId: string) {
    return this.service.getActivity(Number(id), Number(userId || 0));
  }

    @Get('sign/add/:userId/:activityId')
  addSign(@Param('userId') userId: string, @Param('activityId') activityId: string) {
    return this.service.addSign(Number(userId), Number(activityId));
  }

    @Delete('sign/delete/:userId/:activityId')
  deleteSign(@Param('userId') userId: string, @Param('activityId') activityId: string) {
    return this.service.deleteSign(Number(userId), Number(activityId));
  }
}
