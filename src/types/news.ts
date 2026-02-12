// src/types/news.ts
export interface News {
  id: number
  newsName: string
  newsContent: string
  newsCategory: string | string[]
  newsDescription: string
  hasImage: boolean
  imageUrl?: string
  newsTags: string | string[]
  
  // ✅ 新增字段
  status?: string        // pending | approved | rejected
  creatorName?: string   // 发布者姓名
}

export interface NewsListParams {
  page: number
  pageSize: number
  keyword?: string
  category?: string
  status?: string  // ✅ 管理员筛选用
}

export interface NewsListResult {
  list: News[]
  total: number
}