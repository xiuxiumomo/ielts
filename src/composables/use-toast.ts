/*
 * @Author: xiuxiumomo
 * @Date: 2021-06-08 16:20:03
 * @Last Modified by: xiuxiumomo
 * @Last Modified time: 2023-08-09 16:11:00
 */
import { ElMessage } from "element-plus";

interface MessageType {
  type: "success" | "warning" | "info" | "error";
  message: string;
  offset?: number;
  duration?: number;
}

export default function useToast() {
  //操作失败
  const useFail = (message: string) => {
    ElMessage.warning({
      type: "warning",
      message,
      offset: 400,
    });
  };
  //操作成功
  const useSuccess = (message: string) => {
    ElMessage.success({
      type: "success",
      message,
      offset: 400,
    });
  };
  //自定义类型
  const useMessage = (
    info: MessageType = {
      type: "success",
      message: "操作成功",
      offset: 400,
      duration: 3000,
    }
  ) => {
    ElMessage(info);
  };
  return {
    useFail,
    useSuccess,
    useMessage,
  };
}
