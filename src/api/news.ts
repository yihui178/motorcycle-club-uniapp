// src/api/news.ts
import { http } from './request'
import type { News, NewsListParams } from '@/types/news'
/** 获取动态列表（普通用户/会员） */
export function getNewsListApi(params: NewsListParams) {
  return http.get('/news/page', params)
}
/** ✅ 管理员获取所有动态（包含待审核） */
export function getNewsListAdminApi(params: NewsListParams & { status?: string }) {
  return http.get('/news/page-admin', params)
}
/** ✅ 发布动态 */
export function addNewsApi(data: Partial<News>) {
  return http.post('/news/add', data)
}
/** ✅ 审核动态 */
export function reviewNewsApi(newsId: number, action: string) {
  return http.post('/news/review', { newsId, action })
}
/** ✅ 删除动态 */
export function deleteNewsApi(id: number) {
  return http.post('/news/delete', { id })
}
/** ✅ 上传图片（支持拍照和相册） */
export function uploadNewsImageApi(filePath: string) {
  return new Promise((resolve, reject) => {
    // 创建上传任务
    const uploadTask = uni.uploadFile({
      url: '/api/upload/news-image',
      filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${getAccessToken()}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0) {
              resolve(data.data)
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (e) {
            reject(new Error('解析响应失败'))
          }
        } else {
          reject(new Error(`上传失败：HTTP ${res.statusCode}`))
        }
      },
      fail: (error) => {
        console.error('上传失败:', error)
        reject(new Error('网络异常，上传失败'))
      }
    })
    // ✅ 监听上传进度
    uploadTask.onProgressUpdate((res) => {
      console.log('上传进度:', res.progress)
      // 可以在这里更新进度条
    })
  })
}
// 辅助函数：获取 Token
function getAccessToken(): string {
  try {
    const authData = uni.getStorageSync('auth')
    if (authData) {
      const parsed = JSON.parse(authData)
      return parsed.accessToken || ''
    }
  } catch (e) {
    console.error('读取 Token 失败:', e)
  }
  return ''
}