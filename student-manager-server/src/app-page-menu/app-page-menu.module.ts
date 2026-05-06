import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppPageMenuController } from './app-page-menu.controller';
import { AppPageMenuService } from './app-page-menu.service';
import { AppPageMenu } from './entities/app-page-menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppPageMenu])],
  controllers: [AppPageMenuController],
  providers: [AppPageMenuService],
  exports: [AppPageMenuService],
})
export class AppPageMenuModule {}
