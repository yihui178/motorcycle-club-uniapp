// src/types/activity.ts
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
export interface ActivityListResult {
  list: Activity[]
  total: number
}