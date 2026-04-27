import { RESPONSE_CODE, RESPONSE_MSG } from './enums';
import type { Response } from './response-type';

/**
 * @description: 统一返回体
 */
export const responseMessage = <T = any>(
  data: T,
  code: number = RESPONSE_CODE.SUCCESS,
  msg: string = RESPONSE_MSG.SUCCESS,
): Response<T> => {
  const response = {
    msg, 
    code, 
    timestamp: new Date().toISOString()
  }

  return data ? { data, ...response } : response
};