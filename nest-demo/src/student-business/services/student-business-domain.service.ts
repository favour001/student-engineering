import { BadRequestException } from '@nestjs/common';
import { CreateStudentBusinessItemDto } from '../dto/create-student-business-item.dto';
import { QueryStudentBusinessItemDto } from '../dto/query-student-business-item.dto';
import { UpdateStudentBusinessItemDto } from '../dto/update-student-business-item.dto';

export abstract class StudentBusinessDomainService {
  protected constructor(
    private readonly supportedCategories: readonly string[],
    private readonly domainName: string,
  ) {}

  abstract create(createDto: CreateStudentBusinessItemDto): Promise<any> | any;

  abstract findAll(
    page: number,
    limit: number,
    query: QueryStudentBusinessItemDto,
  ): Promise<any> | any;

  abstract findOne(id: number, category: string): Promise<any> | any;

  abstract update(
    id: number,
    updateDto: UpdateStudentBusinessItemDto,
  ): Promise<any> | any;

  abstract updateStatus(
    id: number,
    category: string,
    status: number,
  ): Promise<any> | any;

  abstract remove(id: number, category: string): Promise<any> | any;

  supports(category?: string) {
    return !!category && this.supportedCategories.includes(category);
  }

  getSupportedCategories() {
    return this.supportedCategories.map((category) => ({
      category,
      domain: this.domainName,
    }));
  }

  protected assertSupported(category?: string) {
    if (!this.supports(category)) {
      throw new BadRequestException(
        `${category ?? 'unknown'} 不属于 ${this.domainName} 业务域`,
      );
    }
  }
}
