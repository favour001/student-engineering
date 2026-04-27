export const STUDENT_BUSINESS_CATEGORIES = [
  'activity',
  'sign',
  'member-style',
  'association-intro',
  'joining-guide',
  'notice',
  'article',
  'innovation-shunde',
  'study-abroad-news',
  'video',
  'banner',
  'quick-access',
  'service-platform',
  'merchant',
  'wechat-user',
  'vip',
  'welfare',
  'card',
] as const;

export type StudentBusinessCategory =
  (typeof STUDENT_BUSINESS_CATEGORIES)[number];
