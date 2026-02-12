// src/api/auth.ts
import { http } from './request'
// ========== 类型定义 ==========
export interface LoginParams {
  username: string
  password: string
  captcha: string
}
export interface LoginResult {
  accessToken: string
  refreshToken: string
}
export interface UserInfo {
  id: number
  name: string
  email: string
  role: string
  roles?: readonly string[]
}
// ========== API 接口 ==========
export function loginApi(data: LoginParams) {
  return http.post<LoginResult>('/auth/login', data)
}
export function getUserInfoApi() {
  return http.get<UserInfo>('/user/info')
}
export function logoutApi() {
  return http.post('/auth/logout')
}
export function getAccessCodesApi() {
  return http.get<string[]>('/auth/codes')
}