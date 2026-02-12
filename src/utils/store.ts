// src/utils/store.ts - 修复类型错误
import { ref, readonly, type Ref } from 'vue'
/**
 * 创建响应式状态
 */
export function createStore<T extends Record<string, any>>(initialState: T) {
  const state = ref<T>(initialState) as Ref<T>
  
  return {
    state: readonly(state),
    setState: (newState: Partial<T>) => {
      // ✅ 修复：确保类型正确
      state.value = { ...state.value, ...newState } as T
    },
    reset: () => {
      state.value = { ...initialState } as T
    }
  }
}
/**
 * 持久化状态（支持本地存储）
 */
export function createPersistedStore<T extends Record<string, any>>(
  key: string, 
  initialState: T
) {
  // 从本地存储恢复
  let savedState: T = initialState
  try {
    const saved = uni.getStorageSync(key)
    if (saved) {
      savedState = JSON.parse(saved) as T
    }
  } catch (e) {
    console.error('恢复状态失败:', e)
  }
  
  const state = ref<T>(savedState) as Ref<T>
  
  // 自动持久化
  function persist() {
    try {
      uni.setStorageSync(key, JSON.stringify(state.value))
    } catch (e) {
      console.error('存储失败:', e)
    }
  }
  
  return {
    state: readonly(state),
    setState: (newState: Partial<T>) => {
      // ✅ 修复：确保类型正确
      state.value = { ...state.value, ...newState } as T
      persist()
    },
    reset: () => {
      state.value = { ...initialState } as T
      persist()
    },
    clearStorage: () => {
      uni.removeStorageSync(key)
      state.value = { ...initialState } as T
    }
  }
}