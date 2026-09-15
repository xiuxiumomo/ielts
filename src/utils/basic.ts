import { get as lodashGet } from "lodash";

export const extend = Object.assign;
export const inBrower = typeof window !== "undefined";
export type Numberc = number | string;
/**
 *
 * @param val
 * @returns bool
 * @description 判断是否是对象，返回值如果是真 val is Record<any, any> 返回任意类型的对象
 */
export const isObject = (val: unknown): val is Record<any, any> =>
  val != null && typeof val === "object";

/**
 *
 * @param val
 * @returns bool
 * @description 判断参数是否为空
 * @example const a = 1; const res = isDef(a);=>false
 *
 */
export const isDef = <T>(val: T): val is NonNullable<T> => val !== undefined && val !== null;
/**
 *
 * @param val
 * @returns bool
 * @description 判断传入的是否是函数
 */
export const isFunction = (val: unknown): val is Function => typeof val === "function";
/**
 *
 * @param val
 * @returns bool
 * @description 判断是数字或者字符串类型的数字
 * @example isNumberc(123) => true isNumberc('122.45') => true
 */
export const isNumberc = (val: Numberc): val is string =>
  typeof val === "number" || /^\d+(\.\d+)?$/.test(val);

/**
 *
 * @param obj Object
 * @param path string
 * @returns any
 * @description 获取任意级的对象属性
 * @example const obj = {name: '12'} get(obj,'name')
 * @example const obj = {name: '12',age: {jack: '123'}} get(obj,'age.jack')
 */
export const get = (obj: Object, path: string): any => lodashGet(obj, path);
