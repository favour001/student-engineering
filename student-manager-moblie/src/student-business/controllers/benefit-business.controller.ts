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
import { BenefitBusinessService } from '../services/benefit-business.service';

@ApiTags('留学生管理系统-权益卡券业务')
@AllowNoPermission()
@Controller('student-business/benefit')
export class BenefitBusinessController {
  constructor(private readonly benefitBusinessService: BenefitBusinessService) {}

  @Post()
  @ApiOperation({ summary: '新增权益卡券业务数据' })
  create(@Body() body: CreateStudentBusinessItemDto) {
    return this.benefitBusinessService.create(body);
  }

  @Get()
  @ApiOperation({ summary: '分页查询权益卡券业务数据' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() query: QueryStudentBusinessItemDto,
  ) {
    return this.benefitBusinessService.findAll(page, limit, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询权益卡券业务详情' })
  findOne(@Param('id') id: string, @Query('category') category: string) {
    return this.benefitBusinessService.findOne(+id, category);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新权益卡券业务数据' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateStudentBusinessItemDto,
  ) {
    return this.benefitBusinessService.update(+id, body);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新权益卡券业务状态' })
  updateStatus(
    @Param('id') id: string,
    @Body('category') category: string,
    @Body('status') status: number,
  ) {
    return this.benefitBusinessService.updateStatus(+id, category, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权益卡券业务数据' })
  remove(@Param('id') id: string, @Query('category') category: string) {
    return this.benefitBusinessService.remove(+id, category);
  }
}
