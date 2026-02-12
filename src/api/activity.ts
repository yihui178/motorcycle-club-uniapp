// src/api/activity.ts
import { http } from './request'
export interface Activity {
  id: number
  activityName: string
  activityType: string
  description: string
  startTime: string
  location: string
  maxParticipants: number
  currentParticipants: number
  contactPerson?: string
  contactPhone?: string
}
export interface ActivityListParams {
  page: number
  pageSize: number
  keyword?: string
  type?: string
}
export interface EnrollParams {
  activityId: number
  memberName: string
  memberPhone: string
  remark?: string
}
// 获取活动列表
export function getActivityListApi(params: ActivityListParams) {
  return http.get('/activity/page', params)
}
// 报名活动
export function enrollActivityApi(data: EnrollParams) {
  return http.post('/enrollment/enroll', data)
}
// 获取我的报名记录
export function getMyEnrollmentsApi(memberId: number) {
  return http.get(`/enrollment/list/member/${memberId}`)
}