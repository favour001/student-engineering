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
import { BenefitBusinessService } from '../services/benefit-business.service';

@ApiTags('Student Business - Benefit')
@Controller('student-business/benefit')
export class BenefitBusinessController {
  constructor(private readonly benefitBusinessService: BenefitBusinessService) {}

  @Post()
  @RequireBusinessPermission({ action: 'add', categoryFrom: 'body' })
  @ApiOperation({ summary: 'Create benefit business item' })
  create(@Body() body: CreateStudentBusinessItemDto) {
    return this.benefitBusinessService.create(body);
  }

  @Get()
  @RequireBusinessPermission({ action: 'list', categoryFrom: 'query' })
  @ApiOperation({ summary: 'List benefit business items' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() query: QueryStudentBusinessItemDto,
  ) {
    return this.benefitBusinessService.findAll(page, limit, query);
  }

  @Get(':id')
  @RequireBusinessPermission({ action: 'view', categoryFrom: 'query' })
  @ApiOperation({ summary: 'Get benefit business item detail' })
  findOne(@Param('id') id: string, @Query('category') category: string) {
    return this.benefitBusinessService.findOne(+id, category);
  }

  @Patch(':id')
  @RequireBusinessPermission({ action: 'edit', categoryFrom: 'body' })
  @ApiOperation({ summary: 'Update benefit business item' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateStudentBusinessItemDto,
  ) {
    return this.benefitBusinessService.update(+id, body);
  }

  @Put(':id/status')
  @RequireBusinessPermission({ action: 'status', categoryFrom: 'body' })
  @ApiOperation({ summary: 'Update benefit business status' })
  updateStatus(
    @Param('id') id: string,
    @Body('category') category: string,
    @Body('status') status: number,
  ) {
    return this.benefitBusinessService.updateStatus(+id, category, status);
  }

  @Delete(':id')
  @RequireBusinessPermission({ action: 'delete', categoryFrom: 'query' })
  @ApiOperation({ summary: 'Delete benefit business item' })
  remove(@Param('id') id: string, @Query('category') category: string) {
    return this.benefitBusinessService.remove(+id, category);
  }
}
