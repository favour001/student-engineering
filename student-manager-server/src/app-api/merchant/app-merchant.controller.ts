import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { AllowNoToken } from '../../decorators/token.decorator';
import { AppMerchantService } from './app-merchant.service';

@AllowNoToken()
@Controller('app')
export class AppMerchantController {
  constructor(private readonly service: AppMerchantService) {}

    @Get('merchant/list')
  listMerchants(@Query() query: Record<string, string>) {
    return this.service.listMerchants(query);
  }

    @Get('merchant/get/:id')
  getMerchant(@Param('id') id: string) {
    return this.service.getMerchant(Number(id));
  }
}
