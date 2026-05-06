import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { AllowNoToken } from '../../decorators/token.decorator';
import { AppCardService } from './app-card.service';

@AllowNoToken()
@Controller('app')
export class AppCardController {
  constructor(private readonly service: AppCardService) {}

    @Get('card/list/:type/:userId/:scene')
  listCards(
    @Param('type') type: string,
    @Param('userId') userId: string,
    @Param('scene') scene: string,
    @Query() query: Record<string, string>,
  ) {
    return this.service.listCards(Number(type), Number(userId || 0), Number(scene), query);
  }

    @Get('card/categories/:type')
  listCategories(@Param('type') type: string) {
    return this.service.listCategories(Number(type));
  }

    @Get('card/info/:cardId/:userId/:type')
  getCardStatus(@Param('cardId') cardId: string, @Param('userId') userId: string, @Param('type') type: string) {
    return this.service.getCardStatus(Number(cardId), Number(userId || 0), Number(type));
  }

    @Get('card/detail/:type/:id')
  getCardDetail(@Param('type') type: string, @Param('id') id: string) {
    return this.service.getCardDetail(Number(type), Number(id));
  }

    @Get('card/update/receive/:id/:type')
  receiveCard(@Param('id') id: string, @Param('type') type: string) {
    return this.service.receiveCard(Number(id), Number(type));
  }

    @Post('card/receive')
  @HttpCode(200)
  receiveCardByCardId(@Body() body: Record<string, any>) {
    return this.service.receiveCardByCardId(Number(body.cardId), Number(body.userId), Number(body.type));
  }

    @Get('card/update/use/:id')
  useCard(@Param('id') id: string) {
    return this.service.useCard(Number(id));
  }

    @Get('vip/info/:id')
  getVip(@Param('id') id: string) {
    return this.service.getVip(Number(id));
  }

    @Get('welfare/info/:id')
  getWelfare(@Param('id') id: string) {
    return this.service.getWelfare(Number(id));
  }
}
