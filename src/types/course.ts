// src/types/course.ts
export interface Course {
  id: number
  courseName: string
  category: string
  description: string
  online: boolean
  scheduleTime?: string
  duration?: string
  instructor?: string
  location?: string
  maxStudents?: number
  contactPhone?: string
}
export interface CourseListParams {
  page: number
  pageSize: number
  keyword?: string
}
export interface CourseListResult {
  list: Course[]
  total: number
}