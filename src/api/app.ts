import http from "@/https/request";

export function getUserList(params = {}) {
  return http.request({
    method: "get",
    url: "/api/user/getList",
    params,
  });
}
