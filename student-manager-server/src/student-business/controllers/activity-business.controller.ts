import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowNoPermission } from '../../decorators/permission.decorator';
import { CreateStudentBusinessItemDto } from '../dto/create-student-business-item.dto';
import { QueryStudentBusinessItemDto } from '../dto/query-student-business-item.dto';
import { UpdateStudentBusinessItemDto } from '../dto/update-student-business-item.dto';
import { ActivityBusinessService } from '../services/activity-business.service';

@ApiTags('留学生管理系统-活动业务')
@AllowNoPermission()
@Controller('student-business/activity')
export class ActivityBusinessController {
  constructor(private readonly activityBusinessService: ActivityBusinessService) {}

  @Post()
  @ApiOperation({ summary: '新增活动业务数据' })
  create(@Body() body: CreateStudentBusinessItemDto) {
    return this.activityBusinessService.create(body);
  }

  @Get()
  @ApiOperation({ summary: '分页查询活动业务数据' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() query: QueryStudentBusinessItemDto,
  ) {
    return this.activityBusinessService.findAll(page, limit, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询活动业务详情' })
  findOne(@Param('id') id: string, @Query('category') category: string) {
    return this.activityBusinessService.findOne(+id, category);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新活动业务数据' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateStudentBusinessItemDto,
  ) {
    return this.activityBusinessService.update(+id, body);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新活动业务状态' })
  updateStatus(
    @Param('id') id: string,
    @Body('category') category: string,
    @Body('status') status: number,
  ) {
    return this.activityBusinessService.updateStatus(+id, category, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除活动业务数据' })
  remove(@Param('id') id: string, @Query('category') category: string) {
    return this.activityBusinessService.remove(+id, category);
  }
}
