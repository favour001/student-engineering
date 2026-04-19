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
import { AssignStudentBusinessUsersDto } from '../dto/assign-student-business-users.dto';
import { CreateStudentBusinessItemDto } from '../dto/create-student-business-item.dto';
import { QueryStudentBusinessItemDto } from '../dto/query-student-business-item.dto';
import { QueryStudentBusinessUserPickerDto } from '../dto/query-student-business-user-picker.dto';
import { UpdateStudentBusinessItemDto } from '../dto/update-student-business-item.dto';
import { MemberBusinessService } from '../services/member-business.service';

@ApiTags('Student Business - Member')
@Controller('student-business/member')
export class MemberBusinessController {
  constructor(private readonly memberBusinessService: MemberBusinessService) {}

  @Post()
  @RequireBusinessPermission({ action: 'add', categoryFrom: 'body' })
  @ApiOperation({ summary: 'Create member business item' })
  create(@Body() body: CreateStudentBusinessItemDto) {
    return this.memberBusinessService.create(body);
  }

  @Get()
  @RequireBusinessPermission({ action: 'list', categoryFrom: 'query' })
  @ApiOperation({ summary: 'List member business items' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() query: QueryStudentBusinessItemDto,
  ) {
    return this.memberBusinessService.findAll(page, limit, query);
  }

  @Get(':id')
  @RequireBusinessPermission({ action: 'view', categoryFrom: 'query' })
  @ApiOperation({ summary: 'Get member business item detail' })
  findOne(@Param('id') id: string, @Query('category') category: string) {
    return this.memberBusinessService.findOne(+id, category);
  }

  @Patch(':id')
  @RequireBusinessPermission({ action: 'edit', categoryFrom: 'body' })
  @ApiOperation({ summary: 'Update member business item' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateStudentBusinessItemDto,
  ) {
    return this.memberBusinessService.update(+id, body);
  }

  @Put(':id/status')
  @RequireBusinessPermission({ action: 'status', categoryFrom: 'body' })
  @ApiOperation({ summary: 'Update member business status' })
  updateStatus(
    @Param('id') id: string,
    @Body('category') category: string,
    @Body('status') status: number,
  ) {
    return this.memberBusinessService.updateStatus(+id, category, status);
  }

  @Get('wechat-user/assignable-cards/:type/:cardId')
  @RequireBusinessPermission({
    action: 'assign',
    categoryFrom: 'param',
    field: 'type',
    valueMap: {
      vip: 'vip',
      welfare: 'welfare',
    },
  })
  @ApiOperation({ summary: 'List assignable users for card' })
  getAssignableCardUsers(
    @Param('type') type: 'vip' | 'welfare',
    @Param('cardId') cardId: string,
    @Query() query: QueryStudentBusinessUserPickerDto,
  ) {
    return this.memberBusinessService.getAssignableCardUsers(
      +cardId,
      type,
      query,
    );
  }

  @Put('wechat-user/assignable-cards/:type/:cardId')
  @RequireBusinessPermission({
    action: 'assign',
    categoryFrom: 'param',
    field: 'type',
    valueMap: {
      vip: 'vip',
      welfare: 'welfare',
    },
  })
  @ApiOperation({ summary: 'Assign users to card' })
  assignUsersToCard(
    @Param('type') type: 'vip' | 'welfare',
    @Param('cardId') cardId: string,
    @Body() body: AssignStudentBusinessUsersDto,
  ) {
    return this.memberBusinessService.assignUsersToCard(
      +cardId,
      type,
      body.userIds,
    );
  }

  @Delete(':id')
  @RequireBusinessPermission({ action: 'delete', categoryFrom: 'query' })
  @ApiOperation({ summary: 'Delete member business item' })
  remove(@Param('id') id: string, @Query('category') category: string) {
    return this.memberBusinessService.remove(+id, category);
  }
}
