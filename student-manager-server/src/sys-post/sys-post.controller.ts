import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SysPostService } from './sys-post.service';
import { CreateSysPostDto } from './dto/create-sys-post.dto';
import { UpdateSysPostDto } from './dto/update-sys-post.dto';
import { QuerySysPostDto } from './dto/query-sys-post.dto';
import { PostBatchDeleteDto } from './dto/batch-delete.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('岗位管理')
@Controller(['sys/post', 'sys-post'])
export class SysPostController {
  constructor(private readonly sysPostService: SysPostService) {}

  @Post()
  @ApiOperation({ summary: '添加岗位' })
  create(@Body() createSysPostDto: CreateSysPostDto) {
    return this.sysPostService.create(createSysPostDto);
  }

  @Get()
  @ApiOperation({ summary: '获取岗位列表' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() querySysPost: QuerySysPostDto,
  ) {
    return this.sysPostService.findAll(page, limit, querySysPost);
  }

  @Get('list/all')
  @ApiOperation({ summary: '获取所有岗位列表（不分页）' })
  findAllList() {
    return this.sysPostService.findAllList();
  }

  @Delete('batch/delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量删除岗位' })
  batchDelete(@Body() batchDeleteDto: PostBatchDeleteDto) {
    return this.sysPostService.batchDelete(batchDeleteDto.ids);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据id获取岗位详情' })
  findOne(@Param('id') id: string) {
    return this.sysPostService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新岗位' })
  update(@Param('id') id: string, @Body() updateSysPostDto: UpdateSysPostDto) {
    return this.sysPostService.update(+id, updateSysPostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除岗位' })
  remove(@Param('id') id: string) {
    return this.sysPostService.remove(+id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新岗位状态' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto
  ) {
    return this.sysPostService.updateStatus(+id, updateStatusDto.status);
  }
}
