/*
 * @Author: xiuxiumomo
 * @Date: 2024-01-17 15:35:53
 * @Last Modified by: xiuxiumomo
 * @Last Modified time: 2024-01-22 08:50:47
 * @Description: 一些http请求的接口定义
 */
namespace HTTP {
  //接口响应值
  //注意这里建设通的格式是
  // {
  //   Code: number;
  //   Msg: string | null
  //   Result: T
  // }
  export interface ResultData<T> {
    code: number;
    message?: string;
    data: T;
  }
  //接口请求参数
  export interface Request {
    url: string;
    method: "get" | "post";
    data?: Record<string, any>;
    params?: Record<string, any>;
  }
  //接口请求枚举
  export enum RequestEnums {
    SUCCESS = 200,
    TIMEOUT = 20000,
  }
}
