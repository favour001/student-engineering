import { SetMetadata } from '@nestjs/common';
import { StudentBusinessPermissionMetadata } from '../student-business/student-business.permissions';

export const BUSINESS_PERMISSION_KEY = 'studentBusinessPermission';

export const RequireBusinessPermission = (
  metadata: StudentBusinessPermissionMetadata,
) => SetMetadata(BUSINESS_PERMISSION_KEY, metadata);
