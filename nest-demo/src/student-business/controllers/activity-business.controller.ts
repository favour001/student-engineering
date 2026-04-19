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
import { RequireBusinessPermission } from '../../decorators/require_business_permission.decorator';
import { CreateStudentBusinessItemDto } from '../dto/create-student-business-item.dto';
import { QueryStudentBusinessItemDto } from '../dto/query-student-business-item.dto';
import { UpdateStudentBusinessItemDto } from '../dto/update-student-business-item.dto';
import { ActivityBusinessService } from '../services/activity-business.service';

@ApiTags('Student Business - Activity')
@Controller('student-business/activity')
export class ActivityBusinessController {
  constructor(private readonly activityBusinessService: ActivityBusinessService) {}

  @Post()
  @RequireBusinessPermission({ action: 'add', categoryFrom: 'body' })
  @ApiOperation({ summary: 'Create activity business item' })
  create(@Body() body: CreateStudentBusinessItemDto) {
    return this.activityBusinessService.create(body);
  }

  @Get()
  @RequireBusinessPermission({ action: 'list', categoryFrom: 'query' })
  @ApiOperation({ summary: 'List activity business items' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() query: QueryStudentBusinessItemDto,
  ) {
    return this.activityBusinessService.findAll(page, limit, query);
  }

  @Get(':id')
  @RequireBusinessPermission({ action: 'view', categoryFrom: 'query' })
  @ApiOperation({ summary: 'Get activity business item detail' })
  findOne(@Param('id') id: string, @Query('category') category: string) {
    return this.activityBusinessService.findOne(+id, category);
  }

  @Patch(':id')
  @RequireBusinessPermission({ action: 'edit', categoryFrom: 'body' })
  @ApiOperation({ summary: 'Update activity business item' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateStudentBusinessItemDto,
  ) {
    return this.activityBusinessService.update(+id, body);
  }

  @Put(':id/status')
  @RequireBusinessPermission({ action: 'status', categoryFrom: 'body' })
  @ApiOperation({ summary: 'Update activity business status' })
  updateStatus(
    @Param('id') id: string,
    @Body('category') category: string,
    @Body('status') status: number,
  ) {
    return this.activityBusinessService.updateStatus(+id, category, status);
  }

  @Delete(':id')
  @RequireBusinessPermission({ action: 'delete', categoryFrom: 'query' })
  @ApiOperation({ summary: 'Delete activity business item' })
  remove(@Param('id') id: string, @Query('category') category: string) {
    return this.activityBusinessService.remove(+id, category);
  }
}
