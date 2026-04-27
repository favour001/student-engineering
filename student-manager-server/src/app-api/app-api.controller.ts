import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AllowNoToken } from '../decorators/token.decorator';
import { AppApiService } from './app-api.service';

@AllowNoToken()
@Controller('app')
export class AppApiController {
  constructor(private readonly appApiService: AppApiService) {}

  @Get('wxlogin/login')
  loginByGet(@Query() query: Record<string, string>, @Req() req: any) {
    return this.appApiService.login(query, req);
  }

  @Post('wxlogin/login')
  @HttpCode(200)
  loginByPost(@Body() body: Record<string, string>, @Req() req: any) {
    return this.appApiService.login(body, req);
  }

  @Post('wxlogin/refresh')
  @HttpCode(200)
  refresh(@Body('refreshToken') refreshToken?: string, @Body('refresh_token') refreshTokenAlt?: string, @Req() req?: any) {
    return this.appApiService.refresh(refreshToken || refreshTokenAlt || '', req);
  }

  @Get('wxuser/get/:id')
  getWxUser(@Param('id') id: string) {
    return this.appApiService.getWxUser(Number(id));
  }

  @Post('wxuser/update')
  @HttpCode(200)
  updateWxUser(@Body() body: Record<string, any>) {
    return this.appApiService.updateWxUser(body);
  }

  @Get('banner/list')
  listBanners() {
    return this.appApiService.listBanners();
  }

  @Get('banner/info/:id')
  getBanner(@Param('id') id: string) {
    return this.appApiService.getBanner(Number(id));
  }

  @Get('article/list')
  listArticles(@Query() query: Record<string, string>) {
    return this.appApiService.listArticles(query);
  }

  @Get('article/get/:id')
  getArticle(@Param('id') id: string) {
    return this.appApiService.getArticle(Number(id));
  }

  @Get('notice/list')
  listNotices(@Query() query: Record<string, string>) {
    return this.appApiService.listNotices(query);
  }

  @Get('notice/get/:id')
  getNotice(@Param('id') id: string) {
    return this.appApiService.getNotice(Number(id));
  }

  @Get('activity/list')
  listActivities(@Query() query: Record<string, string>) {
    return this.appApiService.listActivities(query);
  }

  @Get('activity/get/:id/:userId')
  getActivity(@Param('id') id: string, @Param('userId') userId: string) {
    return this.appApiService.getActivity(Number(id), Number(userId || 0));
  }

  @Get('sign/add/:userId/:activityId')
  addSign(@Param('userId') userId: string, @Param('activityId') activityId: string) {
    return this.appApiService.addSign(Number(userId), Number(activityId));
  }

  @Delete('sign/delete/:userId/:activityId')
  deleteSign(@Param('userId') userId: string, @Param('activityId') activityId: string) {
    return this.appApiService.deleteSign(Number(userId), Number(activityId));
  }

  @Get('card/list/:type/:userId/:scene')
  listCards(
    @Param('type') type: string,
    @Param('userId') userId: string,
    @Param('scene') scene: string,
    @Query() query: Record<string, string>,
  ) {
    return this.appApiService.listCards(Number(type), Number(userId || 0), Number(scene), query);
  }

  @Get('card/info/:cardId/:userId/:type')
  getCardStatus(@Param('cardId') cardId: string, @Param('userId') userId: string, @Param('type') type: string) {
    return this.appApiService.getCardStatus(Number(cardId), Number(userId || 0), Number(type));
  }

  @Get('card/update/receive/:id/:type')
  receiveCard(@Param('id') id: string, @Param('type') type: string) {
    return this.appApiService.receiveCard(Number(id), Number(type));
  }

  @Get('card/update/use/:id')
  useCard(@Param('id') id: string) {
    return this.appApiService.useCard(Number(id));
  }

  @Get('vip/info/:id')
  getVip(@Param('id') id: string) {
    return this.appApiService.getVip(Number(id));
  }

  @Get('welfare/info/:id')
  getWelfare(@Param('id') id: string) {
    return this.appApiService.getWelfare(Number(id));
  }

  @Get('tweet/list')
  listTweets(@Query() query: Record<string, string>) {
    return this.appApiService.listTweets(query);
  }

  @Get('tweet/get/:id')
  getTweet(@Param('id') id: string) {
    return this.appApiService.getTweet(Number(id));
  }

  @Get('video/list')
  listVideos(@Query() query: Record<string, string>) {
    return this.appApiService.listVideos(query);
  }

  @Get('user/list')
  listUsers(@Query() query: Record<string, string>) {
    return this.appApiService.listUsers(query);
  }

  @Get('user/get/:id')
  getUser(@Param('id') id: string) {
    return this.appApiService.getUser(Number(id));
  }

  @Get('post/list')
  listPosts() {
    return this.appApiService.listPosts();
  }

  @Get('dept/list')
  listDepartments() {
    return this.appApiService.listDepartments();
  }

  @Get('xiehui/get/:id')
  getAssociationIntro(@Param('id') id: string) {
    return this.appApiService.getAssociationIntro(Number(id));
  }

  @Get('ruhui/get/:id')
  getJoiningGuide(@Param('id') id: string) {
    return this.appApiService.getJoiningGuide(Number(id));
  }

  @Get('auth/me')
  me(@Headers('authorization') authorization?: string, @Headers('token') token?: string) {
    return this.appApiService.me(authorization, token);
  }
}
