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
import { AssignStudentBusinessUsersDto } from '../dto/assign-student-business-users.dto';
import { CreateStudentBusinessItemDto } from '../dto/create-student-business-item.dto';
import { QueryStudentBusinessItemDto } from '../dto/query-student-business-item.dto';
import { QueryStudentBusinessUserPickerDto } from '../dto/query-student-business-user-picker.dto';
import { UpdateStudentBusinessItemDto } from '../dto/update-student-business-item.dto';
import { ContentBusinessService } from '../services/content-business.service';

@ApiTags('留学生管理系统-内容发布业务')
@AllowNoPermission()
@Controller('student-business/content')
export class ContentBusinessController {
  constructor(private readonly contentBusinessService: ContentBusinessService) {}

  @Get('categories')
  @ApiOperation({ summary: '查询内容业务分类' })
  listCategories(@Query('businessKey') businessKey: string) {
    return this.contentBusinessService.listCategories(businessKey, true);
  }

  @Post('categories')
  @ApiOperation({ summary: '新增内容业务分类' })
  createCategory(@Body() body: any) {
    return this.contentBusinessService.createCategory(body);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: '更新内容业务分类' })
  updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.contentBusinessService.updateCategory(+id, body);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: '删除内容业务分类' })
  removeCategory(@Param('id') id: string) {
    return this.contentBusinessService.removeCategory(+id);
  }

  @Post()
  @ApiOperation({ summary: '新增内容发布业务数据' })
  create(@Body() body: CreateStudentBusinessItemDto) {
    return this.contentBusinessService.create(body);
  }

  @Get()
  @ApiOperation({ summary: '分页查询内容发布业务数据' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() query: QueryStudentBusinessItemDto,
  ) {
    return this.contentBusinessService.findAll(page, limit, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询内容发布业务详情' })
  findOne(@Param('id') id: string, @Query('category') category: string) {
    return this.contentBusinessService.findOne(+id, category);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新内容发布业务数据' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateStudentBusinessItemDto,
  ) {
    return this.contentBusinessService.update(+id, body);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新内容发布业务状态' })
  updateStatus(
    @Param('id') id: string,
    @Body('category') category: string,
    @Body('status') status: number,
  ) {
    return this.contentBusinessService.updateStatus(+id, category, status);
  }

  @Get('service-platform/:merchantId/assignable-users')
  @ApiOperation({ summary: '查询可分配到留学服务平台的微信用户列表' })
  getAssignableMerchantUsers(
    @Param('merchantId') merchantId: string,
    @Query() query: QueryStudentBusinessUserPickerDto,
  ) {
    return this.contentBusinessService.getAssignableMerchantUsers(
      +merchantId,
      query,
    );
  }

  @Put('service-platform/:merchantId/assign-users')
  @ApiOperation({ summary: '分配微信用户到留学服务平台' })
  assignMerchantUsers(
    @Param('merchantId') merchantId: string,
    @Body() body: AssignStudentBusinessUsersDto,
  ) {
    return this.contentBusinessService.assignMerchantUsers(
      +merchantId,
      body.userIds,
    );
  }

  @Put('service-platform/:merchantId/assign-all')
  @ApiOperation({ summary: '一键分配全部微信用户到留学服务平台' })
  assignAllMerchantUsers(@Param('merchantId') merchantId: string) {
    return this.contentBusinessService.assignAllMerchantUsers(+merchantId);
  }

  @Put('service-platform/:merchantId/revoke-all')
  @ApiOperation({ summary: '撤销留学服务平台全部已分配用户' })
  revokeAllMerchantUsers(@Param('merchantId') merchantId: string) {
    return this.contentBusinessService.revokeAllMerchantUsers(+merchantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除内容发布业务数据' })
  remove(@Param('id') id: string, @Query('category') category: string) {
    return this.contentBusinessService.remove(+id, category);
  }
}
