import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SysDepartmentService } from './sys-department.service';
import { CreateSysDepartmentDto } from './dto/create-sys-department.dto';
import { UpdateSysDepartmentDto } from './dto/update-sys-department.dto';
import { QuerySysDepartmentDto } from './dto/query-sys-department.dto';

@ApiTags('部门管理')
@Controller('sys/department')
export class SysDepartmentController {
  constructor(private readonly sysDepartmentService: SysDepartmentService) {}

  @Post()
  @ApiOperation({ summary: '创建部门' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createSysDepartmentDto: CreateSysDepartmentDto) {
    return this.sysDepartmentService.create(createSysDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: '获取部门树形列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query() querySysDepartment: QuerySysDepartmentDto,
  ) {
    return this.sysDepartmentService.findAll(page, limit, querySysDepartment);
  }

  @Get('list')
  @ApiOperation({ summary: '获取部门列表（非树形）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAllList() {
    return this.sysDepartmentService.findAllList();
  }

  @Get('tree')
  @ApiOperation({ summary: '获取部门树形列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAllTree() {
    return this.sysDepartmentService.findAllTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取部门详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sysDepartmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新部门' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSysDepartmentDto: UpdateSysDepartmentDto,
  ) {
    return this.sysDepartmentService.update(id, updateSysDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sysDepartmentService.remove(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新部门状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.sysDepartmentService.update(id, { status });
  }
}
