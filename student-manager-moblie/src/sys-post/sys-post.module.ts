import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysPostService } from './sys-post.service';
import { SysPostController } from './sys-post.controller';
import { SysPost } from './entities/sys-post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SysPost])],
  controllers: [SysPostController],
  providers: [SysPostService],
  exports: [SysPostService],
})
export class SysPostModule {}