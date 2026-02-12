// src/api/course.ts
import { http } from './request'
import type { Course, CourseListParams } from '@/types/course'
export function getCourseListApi(params: CourseListParams) {
  return http.get('/course/page', params)
}
export function getCourseDetailApi(id: number) {
  return http.get(`/course/${id}`)
}