// src/types/member.ts
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