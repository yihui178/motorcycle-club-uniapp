// src/store/auth.ts - 优化版（保留关键日志）
import { createPersistedStore } from '@/utils/store'
import { loginApi, getUserInfoApi, logoutApi } from '@/api/auth'
import type { LoginParams, UserInfo } from '@/api/auth'
interface AuthState {
  accessToken: string
  refreshToken: string
  userInfo: UserInfo | null
  loginLoading: boolean
}
const initialState: AuthState = {
  accessToken: '',
  refreshToken: '',
  userInfo: null,
  loginLoading: false
}
const authStore = createPersistedStore('auth', initialState)
export const useAuthState = () => authStore.state
export async function login(params: LoginParams) {
  try {
    authStore.setState({ loginLoading: true })
    
    const res = await loginApi(params)
    
    authStore.setState({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken
    })
    
    const userInfo = await getUserInfoApi()
    authStore.setState({ userInfo })
    
    console.log(' 登录成功:', userInfo.name) 
    
    uni.reLaunch({ url: '/pages/index/index' })
    uni.showToast({ title: '登录成功', icon: 'success' })
  } catch (error: any) {
    console.error('❌ 登录失败:', error)  
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
    throw error
  } finally {
    authStore.setState({ loginLoading: false })
  }
}
export async function logout() {
  try {
    await logoutApi()
  } catch (e) {
    console.error('登出失败:', e)  
  } finally {
    authStore.reset()
    authStore.clearStorage()
    uni.reLaunch({ url: '/pages/login/login' })
  }
}
export function isLoggedIn(): boolean {
  try {
    const authData = uni.getStorageSync('auth')
    if (authData) {
      const parsed = JSON.parse(authData)
      return !!parsed.accessToken
    }
  } catch (e) {
    console.error('检查登录状态失败:', e) 
  }
  return false
}
export function getAccessToken(): string {
  try {
    const authData = uni.getStorageSync('auth')
    if (authData) {
      const parsed = JSON.parse(authData)
      return parsed.accessToken || ''
    }
  } catch (e) {
    console.error('获取 Token 失败:', e)  
  }
  return ''
}
export function getUserInfo(): UserInfo | null {
  return authStore.state.value.userInfo
}
export const useAuthStore = () => ({
  state: authStore.state.value,
  login,
  logout,
  isLoggedIn
})
