<template>
  <view class="page">
    <!-- 用户卡片 -->
    <view class="user-card">
      <view class="user-info">
        <view class="avatar-box">
          <text class="avatar-text">{{ getAvatarText() }}</text>
        </view>
        <view class="info">
          <text class="name">{{ authState.userInfo?.name || '未登录' }}</text>
          <text class="role">{{ getRoleName() }}</text>
        </view>
      </view>
      
      <view class="member-badge" v-if="memberState.isMember">
        <text class="badge-text">✨ 会员</text>
      </view>
    </view>
    
    <!-- 快捷入口 -->
    <view class="quick-nav">
      <text class="section-title">快捷入口</text>
      <view class="nav-grid">
        <view 
          v-for="item in navItems" 
          :key="item.path"
          class="nav-item"
          @tap="handleNavClick(item)"
        >
          <text class="nav-icon">{{ item.icon }}</text>
          <text class="nav-text">{{ item.title }}</text>
        </view>
      </view>
    </view>
    
    <!-- 数据统计 -->
    <view class="stats">
      <text class="section-title">数据概览</text>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ stats.memberCount }}</text>
          <text class="stat-label">会员总数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.activityCount }}</text>
          <text class="stat-label">活动总数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.courseCount }}</text>
          <text class="stat-label">课程总数</text>
        </view>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @tap="handleLogout">退出登录</button>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthState, logout, isLoggedIn } from '@/store/auth'
import { useMemberState, checkMemberStatus } from '@/store/member'
import { http } from '@/api/request'
const authState = useAuthState()
const memberState = useMemberState()
// ✅ 修复：给每个入口添加 isTab 标记
const navItems = [
  { title: '会员管理', icon: '👥', path: '/pages/member/list', isTab: true },
  { title: '活动报名', icon: '🚴', path: '/pages/activity/list', isTab: true },
  { title: '培训课程', icon: '📚', path: '/pages/course/list', isTab: true },
  { title: '俱乐部动态', icon: '📰', path: '/pages/news/list', isTab: true },
]
const stats = ref({
  memberCount: 0,
  activityCount: 0,
  courseCount: 0
})
async function fetchStats() {
  if (!isLoggedIn()) return
  
  try {
    const [memberRes, activityRes, courseRes] = await Promise.all([
      http.get('/member/page', { page: 1, pageSize: 1 }),
      http.get('/activity/page', { page: 1, pageSize: 1 }),
      http.get('/course/page', { page: 1, pageSize: 1 })
    ])
    
    stats.value = {
      memberCount: memberRes.total || 0,
      activityCount: activityRes.total || 0,
      courseCount: courseRes.total || 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}
// ✅ 修复：统一的导航处理
function handleNavClick(item: any) {
  if (!isLoggedIn()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/login/login' })
    }, 1500)
    return
  }
  
  // TabBar 页面用 switchTab
  if (item.isTab) {
    uni.switchTab({ url: item.path })
  } else {
    uni.navigateTo({ url: item.path })
  }
}
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        logout()
      }
    }
  })
}
function getRoleName() {
  const role = authState.value.userInfo?.role
  const map: Record<string, string> = {
    'super': '超级管理员',
    'admin': '管理员',
    'user': '普通用户'
  }
  return map[role || ''] || '游客'
}
function getAvatarText() {
  return authState.value.userInfo?.name?.charAt(0) || 'U'
}
onMounted(() => {
  if (isLoggedIn()) {
    checkMemberStatus()
    fetchStats()
  } else {
    uni.reLaunch({ url: '/pages/login/login' })
  }
})
</script>
<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f5f5f5;
}
.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  margin-bottom: 32rpx;
  color: #fff;
}
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}
.avatar-box {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}
.avatar-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
}
.info {
  flex: 1;
}
.name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}
.role {
  font-size: 26rpx;
  opacity: 0.9;
}
.member-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
}
.badge-text {
  font-size: 28rpx;
  font-weight: 500;
}
.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}
.nav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
  margin-bottom: 32rpx;
}
.nav-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 16rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
.nav-icon {
  display: block;
  font-size: 64rpx;
  margin-bottom: 16rpx;
}
.nav-text {
  font-size: 24rpx;
  color: #666;
}
.stats {
  margin-bottom: 32rpx;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}
.stat-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;
}
.stat-value {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8rpx;
}
.stat-label {
  font-size: 24rpx;
  color: #999;
}
.logout-section {
  margin-top: 48rpx;
}
.logout-btn {
  width: 100%;
  height: 88rpx;
  background: #fff;
  color: #ff4d4f;
  border: 2rpx solid #ff4d4f;
  border-radius: 12rpx;
  font-size: 28rpx;
}
</style>