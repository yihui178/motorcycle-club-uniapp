<template>
  <view>
    <!-- 状态栏占位 -->
    <view :style="{ height: statusBarHeight + 'px' }" class="status-bar"></view>
    
    <!-- 自定义导航栏 -->
    <view class="nav-bar">
      <!-- 左侧：Logo + 标题 -->
      <view class="nav-left">
        <view class="logo-box" @tap="goHome">
          <image class="logo" src="/static/logo.png" mode="aspectFit" />
        </view>
        <text class="nav-title">{{ title }}</text>
      </view>
      
      <!-- 右侧：自定义插槽 -->
      <view class="nav-right">
        <slot></slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  title: string
}

defineProps<Props>()

const statusBarHeight = ref(0)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
})

function goHome() {
  uni.vibrateShort()
  uni.reLaunch({ url: '/pages/index/index' })
}
</script>

<style scoped>
.status-bar {
  background: #667eea;
}

.nav-bar {
  height: 88rpx;
  background: #667eea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.nav-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
}

.logo-box {
  flex-shrink: 0;
  width: 56rpx;
  height: 56rpx;
  transition: transform 0.2s;
}

.logo-box:active {
  transform: scale(0.9);
}

.logo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-right {
  flex-shrink: 0;
}
</style>