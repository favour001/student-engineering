import { SelectQueryBuilder } from 'typeorm';
import { PaginationOptions, PaginationResult } from './pagination';

export class FilterBuilder<T> {
  constructor(private queryBuilder: SelectQueryBuilder<T>, private table_name: string) {}

  // 精确匹配
  eq(field: string, value: any): this {
    if (this.hasValue(value)) {
      const paramName = this.getParamName(field);
      this.queryBuilder.andWhere(`${this.table_name}.${field} = :${paramName}`, { [paramName]: value });
    }
    return this;
  }

  // 模糊匹配
  like(field: string, value: any): this {
    if (this.hasValue(value)) {
      const paramName = this.getParamName(field);
      this.queryBuilder.andWhere(`${this.table_name}.${field} LIKE :${paramName}`, { [paramName]: `%${value}%` });
    }
    return this;
  }

  // 大于等于
  gte(field: string, value: any): this {
    if (this.hasValue(value)) {
      const paramName = this.getParamName(field);
      this.queryBuilder.andWhere(`${this.table_name}.${field} >= :${paramName}`, { [paramName]: value });
    }
    return this;
  }

  // 小于等于
  lte(field: string, value: any): this {
    if (this.hasValue(value)) {
      const paramName = this.getParamName(field);
      this.queryBuilder.andWhere(`${this.table_name}.${field} <= :${paramName}`, { [paramName]: value });
    }
    return this;
  }

  // 包含查询
  in(field: string, values: any[]): this {
    if (values && values.length > 0) {
      const paramName = this.getParamName(field);
      this.queryBuilder.andWhere(`${this.table_name}.${field} IN (:...${paramName})`, { [paramName]: values });
    }
    return this;
  }

  // 添加排序（支持多个排序字段）
  addOrderBy(field: string, order: 'ASC' | 'DESC' = 'ASC', allowedFields: string[] = []): this {
    if (allowedFields.length === 0 || allowedFields.includes(field)) {
      this.queryBuilder.addOrderBy(`${this.table_name}.${field}`, order);
    }
    return this;
  }

  async paginate(options: PaginationOptions): Promise<PaginationResult<T>> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const totalQuery = this.queryBuilder.clone();
    const total = await totalQuery.getCount();

    const data = await this.queryBuilder
    .skip(skip)
    .take(limit)
    .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    }
  }

  // 构建完成，返回QueryBuilder
  build(): SelectQueryBuilder<T> {
    return this.queryBuilder;
  }

  private hasValue(value: any): boolean {
    return value !== undefined && value !== null && value !== '';
  }

  private getParamName(field: string): string {
    return `${field}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}