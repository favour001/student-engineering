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
import { ContentBusinessService } from '../services/content-business.service';

@ApiTags('Student Business - Content')
@Controller('student-business/content')
export class ContentBusinessController {
  constructor(private readonly contentBusinessService: ContentBusinessService) {}

  @Post()
  @RequireBusinessPermission({ action: 'add', categoryFrom: 'body' })
  @ApiOperation({ summary: 'Create content business item' })
  create(@Body() body: CreateStudentBusinessItemDto) {
    return this.contentBusinessService.create(body);
  }

  @Get()
  @RequireBusinessPermission({ action: 'list', categoryFrom: 'query' })
  @ApiOperation({ summary: 'List content business items' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() query: QueryStudentBusinessItemDto,
  ) {
    return this.contentBusinessService.findAll(page, limit, query);
  }

  @Get(':id')
  @RequireBusinessPermission({ action: 'view', categoryFrom: 'query' })
  @ApiOperation({ summary: 'Get content business item detail' })
  findOne(@Param('id') id: string, @Query('category') category: string) {
    return this.contentBusinessService.findOne(+id, category);
  }

  @Patch(':id')
  @RequireBusinessPermission({ action: 'edit', categoryFrom: 'body' })
  @ApiOperation({ summary: 'Update content business item' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateStudentBusinessItemDto,
  ) {
    return this.contentBusinessService.update(+id, body);
  }

  @Put(':id/status')
  @RequireBusinessPermission({ action: 'status', categoryFrom: 'body' })
  @ApiOperation({ summary: 'Update content business status' })
  updateStatus(
    @Param('id') id: string,
    @Body('category') category: string,
    @Body('status') status: number,
  ) {
    return this.contentBusinessService.updateStatus(+id, category, status);
  }

  @Get('service-platform/:merchantId/assignable-users')
  @RequireBusinessPermission({
    action: 'assign',
    categoryFrom: 'fixed',
    category: 'service-platform',
  })
  @ApiOperation({ summary: 'List assignable service-platform users' })
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
  @RequireBusinessPermission({
    action: 'assign',
    categoryFrom: 'fixed',
    category: 'service-platform',
  })
  @ApiOperation({ summary: 'Assign users to service-platform item' })
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
  @RequireBusinessPermission({
    action: 'assign',
    categoryFrom: 'fixed',
    category: 'service-platform',
  })
  @ApiOperation({ summary: 'Assign all users to service-platform item' })
  assignAllMerchantUsers(@Param('merchantId') merchantId: string) {
    return this.contentBusinessService.assignAllMerchantUsers(+merchantId);
  }

  @Put('service-platform/:merchantId/revoke-all')
  @RequireBusinessPermission({
    action: 'revoke',
    categoryFrom: 'fixed',
    category: 'service-platform',
  })
  @ApiOperation({ summary: 'Revoke all users from service-platform item' })
  revokeAllMerchantUsers(@Param('merchantId') merchantId: string) {
    return this.contentBusinessService.revokeAllMerchantUsers(+merchantId);
  }

  @Delete(':id')
  @RequireBusinessPermission({ action: 'delete', categoryFrom: 'query' })
  @ApiOperation({ summary: 'Delete content business item' })
  remove(@Param('id') id: string, @Query('category') category: string) {
    return this.contentBusinessService.remove(+id, category);
  }
}
