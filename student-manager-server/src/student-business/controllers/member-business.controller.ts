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
import { MemberBusinessService } from '../services/member-business.service';

@ApiTags('留学生管理系统-会员组织业务')
@AllowNoPermission()
@Controller('student-business/member')
export class MemberBusinessController {
  constructor(private readonly memberBusinessService: MemberBusinessService) {}

  @Post()
  @ApiOperation({ summary: '新增会员组织业务数据' })
  create(@Body() body: CreateStudentBusinessItemDto) {
    return this.memberBusinessService.create(body);
  }

  @Get()
  @ApiOperation({ summary: '分页查询会员组织业务数据' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() query: QueryStudentBusinessItemDto,
  ) {
    return this.memberBusinessService.findAll(page, limit, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询会员组织业务详情' })
  findOne(@Param('id') id: string, @Query('category') category: string) {
    return this.memberBusinessService.findOne(+id, category);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新会员组织业务数据' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateStudentBusinessItemDto,
  ) {
    return this.memberBusinessService.update(+id, body);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新会员组织业务状态' })
  updateStatus(
    @Param('id') id: string,
    @Body('category') category: string,
    @Body('status') status: number,
  ) {
    return this.memberBusinessService.updateStatus(+id, category, status);
  }

  @Get('wechat-user/assignable-cards/:type/:cardId')
  @ApiOperation({ summary: '查询可分配到卡片的微信用户列表' })
  getAssignableCardUsers(
    @Param('type') type: 'vip' | 'welfare',
    @Param('cardId') cardId: string,
    @Query() query: QueryStudentBusinessUserPickerDto,
  ) {
    return this.memberBusinessService.getAssignableCardUsers(+cardId, type, query);
  }

  @Put('wechat-user/assignable-cards/:type/:cardId')
  @ApiOperation({ summary: '分配卡片给微信用户' })
  assignUsersToCard(
    @Param('type') type: 'vip' | 'welfare',
    @Param('cardId') cardId: string,
    @Body() body: AssignStudentBusinessUsersDto,
  ) {
    return this.memberBusinessService.assignUsersToCard(+cardId, type, body.userIds);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除会员组织业务数据' })
  remove(@Param('id') id: string, @Query('category') category: string) {
    return this.memberBusinessService.remove(+id, category);
  }
}
