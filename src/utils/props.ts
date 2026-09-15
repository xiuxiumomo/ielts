import type { PropType } from "vue";
/**
 * @description 将null强制转化为未知类型
 */
export const unknownProp = null as unknown as PropType<unknown>;
/**
 * @descript 定义数字类型的数据
 *
 */
export const numericProp = [Number, String];
/**
 * @description 这里一定要加true as const 不然很可能default 被推断为默认的Boolean类型
 * @example const props = {
 *    myName: trueProp
 * }
 */
export const truthProp = {
  type: Boolean,
  default: true as const,
};
/**
 *
 * @param type 任意类型
 * @returns obj
 * @description 类型的包装函数，将类型转换为必须的类型
 * @example const myProp = makeRequiredProp(String)
 * @example const myProp = makeRequiredProp(numbericProp)
 * @example const myProp = makeRequiredProp(Boolean)
 */
export const makeRequiredProp = <T>(type: T) => ({ type, required: true as const });
/**
 * @description 定义数组类型的props
 * @returns obj
 * @example const defineProps = makeArrayProp<String>()
 * @example const defineProps = makeArrayProp<Number>()
 * @example const defineProps = makeArrayProp<{ name: string; age: number }>();
 */
export const makeArrayProp = <T>() => ({ type: Array as PropType<T[]>, default: () => [] });
/**
 * @description 定义数字类型的props
 * @returns obj
 * @example const p = {
                num: makeNumberProp(100),
            }
 *
 */
export const makeNumberProp = <T>(defaultVal: T) => ({
  type: Number,
  default: defaultVal,
});
/**
 * @description 定义数字类型的props
 * @returns obj
 * @example const p = {
                num: makeNumericProp(100),
            }
 *
 */
export const makeNumericProp = <T>(defaultVal: T) => ({
  type: numericProp,
  default: defaultVal,
});
