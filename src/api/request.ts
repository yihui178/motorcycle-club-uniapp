// src/api/request.ts - 完全重写版本
const BASE_URL = '/api'
const TIMEOUT = 10000
const PUBLIC_APIS = ['/auth/login', '/auth/register', '/auth/verifyCaptcha', '/auth/refreshToken']
let isRefreshing = false
let refreshPromise: Promise<string> | null = null
function getToken(): string {
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
function getRefreshToken(): string {
  try {
    const authData = uni.getStorageSync('auth')
    if (authData) {
      const parsed = JSON.parse(authData)
      return parsed.refreshToken || ''
    }
  } catch (e) {
    console.error('读取 Refresh Token 失败:', e)
  }
  return ''
}
function updateToken(newAccessToken: string) {
  try {
    const authData = uni.getStorageSync('auth')
    if (authData) {
      const parsed = JSON.parse(authData)
      parsed.accessToken = newAccessToken
      uni.setStorageSync('auth', JSON.stringify(parsed))
      console.log('✅ Token 已更新')
    }
  } catch (e) {
    console.error('更新 Token 失败:', e)
  }
}
async function doRefreshToken(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    console.log('⏳ 复用正在进行的刷新')
    return refreshPromise
  }
  
  isRefreshing = true
  refreshPromise = new Promise(async (resolve, reject) => {
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        throw new Error('Refresh Token 不存在')
      }
      
      console.log('🔄 开始刷新 Token')
      
      const res: any = await new Promise((resolveRequest, rejectRequest) => {
        uni.request({
          url: BASE_URL + '/auth/refreshToken',
          method: 'POST',
          data: { refreshToken },
          header: {
            'Content-Type': 'application/json'
          },
          timeout: TIMEOUT,
          success: resolveRequest,
          fail: rejectRequest
        })
      })
      
      console.log('🔵 刷新响应:', res)
      
      if (res.statusCode === 200) {
        const resData = res.data as any
        if (resData.code === 0) {
          const newAccessToken = resData.data.accessToken || resData.data
          updateToken(newAccessToken)
          console.log('✅ Token 刷新成功')
          resolve(newAccessToken)
        } else {
          throw new Error('刷新失败: ' + resData.message)
        }
      } else {
        throw new Error('刷新失败，状态码: ' + res.statusCode)
      }
    } catch (error) {
      console.error('❌ Token 刷新失败:', error)
      reject(error)
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })
  
  return refreshPromise
}
function requestInterceptor(config: UniApp.RequestOptions) {
  const url = config.url || ''
  
  if (PUBLIC_APIS.some(api => url.includes(api))) {
    return config
  }
  
  const token = getToken()
  
  if (token) {
    config.header = {
      'Content-Type': 'application/json',
      ...config.header,
      'Authorization': `Bearer ${token}`
    }
  }
  
  return config
}
export function request<T = any>(options: UniApp.RequestOptions & { _retry?: boolean }): Promise<T> {
  return new Promise((resolve, reject) => {
    const config = requestInterceptor({
      ...options,
      url: BASE_URL + (options.url || ''),
      timeout: TIMEOUT,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      }
    })
    
    uni.request({
      ...config,
      success: async (res: UniApp.RequestSuccessCallbackResult) => {
        const { statusCode, data } = res
        
        console.log(`📡 [${options.method}] ${config.url} → ${statusCode}`)
        
        // ✅ 修复：在 success 回调中直接处理 401
        if (statusCode === 401) {
          console.log('🔴 收到 401 响应')
          
          // ✅ 自动刷新 Token
          if (!options._retry) {
            try {
              console.log('🔄 检测到 401，尝试刷新 Token')
              
              const newToken = await doRefreshToken()
              
              console.log('✅ Token 刷新成功，重试原请求')
              
              const retryResult = await request<T>({
                ...options,
                _retry: true
              })
              
              resolve(retryResult)
              return  // ✅ 重要：提前返回
            } catch (refreshError) {
              console.error('❌ Token 刷新失败，跳转登录')
              uni.removeStorageSync('auth')
              uni.showToast({ title: '登录已过期', icon: 'none' })
              setTimeout(() => {
                uni.reLaunch({ url: '/pages/login/login' })
              }, 1500)
              reject(refreshError)
              return  // ✅ 重要：提前返回
            }
          } else {
            console.log('❌ 已重试过，不再刷新')
            uni.showToast({ title: '登录已过期', icon: 'none' })
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/login/login' })
            }, 1500)
            reject({ statusCode: 401, message: 'Token 过期' })
            return
          }
        }
        
        // ✅ 处理其他状态码
        if (statusCode !== 200) {
          uni.showToast({ title: `请求失败(${statusCode})`, icon: 'none' })
          reject({ statusCode, message: '请求失败' })
          return
        }
        
        // ✅ 处理业务错误
        const resData = data as { code: number; data: any; message?: string }
        
        if (resData.code !== 0) {
          uni.showToast({ title: resData.message || '请求失败', icon: 'none' })
          reject(resData)
          return
        }
        
        // ✅ 成功返回数据
        resolve(resData.data)
      },
      fail: (error: UniApp.GeneralCallbackResult) => {
        console.error('❌ 网络请求失败:', error)
        uni.showToast({ title: '网络异常', icon: 'none' })
        reject(error)
      }
    })
  })
}
export const http = {
  get<T = any>(url: string, params?: any) {
    return request<T>({ url, method: 'GET', data: params })
  },
  
  post<T = any>(url: string, data?: any) {
    return request<T>({ url, method: 'POST', data })
  },
  
  put<T = any>(url: string, data?: any) {
    return request<T>({ url, method: 'PUT', data })
  },
  
  delete<T = any>(url: string, data?: any) {
    return request<T>({ url, method: 'DELETE', data })
  }
}