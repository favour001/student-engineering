import { BadRequestException } from '@nestjs/common';
import {
  StudentBusinessCategory,
  STUDENT_BUSINESS_CATEGORIES,
} from './student-business.constants';

export type StudentBusinessPermissionAction =
  | 'menu'
  | 'list'
  | 'view'
  | 'add'
  | 'edit'
  | 'delete'
  | 'status'
  | 'assign'
  | 'revoke';

export interface StudentBusinessPermissionMetadata {
  action: StudentBusinessPermissionAction;
  categoryFrom?: 'body' | 'query' | 'param' | 'fixed';
  field?: string;
  category?: StudentBusinessCategory;
  valueMap?: Record<string, StudentBusinessCategory>;
}

const STUDENT_BUSINESS_CATEGORY_SET = new Set<string>(
  STUDENT_BUSINESS_CATEGORIES as readonly string[],
);

export function buildStudentBusinessPermission(
  category: StudentBusinessCategory,
  action: StudentBusinessPermissionAction,
) {
  return `${category}:${action}`;
}

export function resolveStudentBusinessCategory(
  request: {
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
    params?: Record<string, unknown>;
  },
  metadata: StudentBusinessPermissionMetadata,
): StudentBusinessCategory {
  let rawCategory: unknown;

  switch (metadata.categoryFrom ?? 'query') {
    case 'fixed':
      rawCategory = metadata.category;
      break;
    case 'body':
      rawCategory = request.body?.[metadata.field ?? 'category'];
      break;
    case 'param':
      rawCategory = request.params?.[metadata.field ?? 'category'];
      break;
    case 'query':
    default:
      rawCategory = request.query?.[metadata.field ?? 'category'];
      break;
  }

  const mappedCategory =
    typeof rawCategory === 'string' && metadata.valueMap
      ? metadata.valueMap[rawCategory] ?? rawCategory
      : rawCategory;

  if (
    typeof mappedCategory !== 'string' ||
    !STUDENT_BUSINESS_CATEGORY_SET.has(mappedCategory)
  ) {
    throw new BadRequestException('Invalid student business category');
  }

  return mappedCategory as StudentBusinessCategory;
}
