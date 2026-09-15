import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
const config = {
  // baseURL: "",
  // 设置超时时间
  timeout: HTTP.RequestEnums.TIMEOUT as number,
};
/**
 *
 */
class RequestHttp {
  service: AxiosInstance;
  constructor(config: AxiosRequestConfig) {
    this.service = axios.create(config);
    //设置请求头
    this.service.interceptors.request.use(
      (config) => {
        const token = "1234"; // 自定义token
        config.headers["token"] = `${token}`; // 在请求头中携带token
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
    //设置响应
    this.service.interceptors.response.use(
      (response): any => {
        const data = response.data as HTTP.ResultData<any>;
        if (data.code && data.code !== HTTP.RequestEnums.SUCCESS) {
          return Promise.reject(data);
        }
        return data;
      },
      (error: AxiosError) => {
        const { response } = error;
        if (response) {
          this.handleCode(response.status);
        }
        return Promise.reject(error);
      }
    );
  }
  handleCode(code: number) {
    switch (code) {
      case 401:
        console.log("登录失败，请重新登录");
        break;
      default:
        console.log("请求失败");
        break;
    }
  }
  //封装get请求
  get<T>(url: string, params?: object): Promise<HTTP.ResultData<T>> {
    return this.service.get(url, params);
  }
  //封装post请求
  post<T>(url: string, data?: object): Promise<HTTP.ResultData<T>> {
    return this.service.post(url, data);
  }
  //封装request请求
  request<T>(req: HTTP.Request): Promise<HTTP.ResultData<T>> {
    return this.service.request({
      ...req,
    });
  }
}
const request = new RequestHttp(config);
export default request;

// request.get('/aaa',{})
// request.post('/aaa',{})
// request.request({method: "get",url: '/aaa',params: {} })
