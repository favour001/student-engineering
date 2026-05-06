import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { AllowNoToken } from '../../decorators/token.decorator';
import { AppContentService } from './app-content.service';

@AllowNoToken()
@Controller('app')
export class AppContentController {
  constructor(private readonly service: AppContentService) {}

    @Get('content-category/list')
  listCategories(@Query('businessKey') businessKey: string) {
    return this.service.listCategories(businessKey);
  }

    @Get('banner/list')
  listBanners() {
    return this.service.listBanners();
  }

    @Get('quick-access/list')
  listQuickAccess() {
    return this.service.listQuickAccess();
  }

    @Get('banner/info/:id')
  getBanner(@Param('id') id: string) {
    return this.service.getBanner(Number(id));
  }

    @Get('article/list')
  listArticles(@Query() query: Record<string, string>) {
    return this.service.listArticles(query);
  }

    @Get('article/get/:id')
  getArticle(@Param('id') id: string) {
    return this.service.getArticle(Number(id));
  }

    @Get('notice/list')
  listNotices(@Query() query: Record<string, string>) {
    return this.service.listNotices(query);
  }

    @Get('notice/get/:id')
  getNotice(@Param('id') id: string) {
    return this.service.getNotice(Number(id));
  }

    @Get('tweet/list')
  listTweets(@Query() query: Record<string, string>) {
    return this.service.listTweets(query);
  }

    @Get('tweet/get/:id')
  getTweet(@Param('id') id: string) {
    return this.service.getTweet(Number(id));
  }

    @Get('video/list')
  listVideos(@Query() query: Record<string, string>) {
    return this.service.listVideos(query);
  }

    @Get('xiehui/get/:id')
  getAssociationIntro(@Param('id') id: string) {
    return this.service.getAssociationIntro(Number(id));
  }

    @Get('ruhui/get/:id')
  getJoiningGuide(@Param('id') id: string) {
    return this.service.getJoiningGuide(Number(id));
  }
}
