// src/api/member.ts
import { http } from './request'
export interface Member {
  id: number
  userId: number
  memberName: string
  phone: string
  idCard?: string
  gender: string
  joinDate: string
  motorcycleBrand?: string
  motorcycleModel?: string
  plateNumber?: string
  address?: string
  remark?: string
}
export interface MemberListParams {
  page: number
  pageSize: number
  keyword?: string
}
export interface MemberListResult {
  list: Member[]
  total: number
}
// 获取会员列表
export function getMemberListApi(params: MemberListParams) {
  return http.get<MemberListResult>('/member/page', params)
}
// 新增会员
export function addMemberApi(data: Partial<Member>) {
  return http.post('/member/add', data)
}
// 更新会员
export function updateMemberApi(data: Partial<Member>) {
  return http.put('/member/update', data)
}
// 删除会员
export function deleteMemberApi(id: number) {
  return http.post('/member/delete', { id })
}
// 检查当前用户是否为会员
export function checkMemberStatusApi() {
  return http.get<boolean>('/user/is-member')
}