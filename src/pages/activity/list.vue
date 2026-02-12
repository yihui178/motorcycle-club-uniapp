<template>
  <view class="page">
    <!-- ✅ 改成搜索栏（和 Vben 一样） -->
    <view class="search-bar">
      <input 
        v-model="keyword" 
        placeholder="搜索活动名称、地点..." 
        class="search-input"
        @confirm="handleSearch"
      />
      <button class="search-btn" @tap="handleSearch">搜索</button>
      <button class="reset-btn" @tap="resetSearch">重置</button>
    </view>
    
    <!-- 活动列表 -->
    <scroll-view 
      scroll-y 
      class="scroll-view"
      @scrolltolower="loadMore"
    >
      <view 
        v-for="activity in activityList" 
        :key="activity.id"
        class="activity-card"
      >
        <!-- 活动头部 -->
        <view class="card-header">
          <text class="title">{{ activity.activityName }}</text>
          <text 
            class="type-tag" 
            :class="getTypeClass(activity.activityType)"
          >
            {{ activity.activityType }}
          </text>
        </view>
        
        <!-- 活动信息 -->
        <view class="card-body">
          <view class="info-row">
            <text class="icon">📍</text>
            <text class="text">{{ activity.location }}</text>
          </view>
          
          <view class="info-row">
            <text class="icon">🕐</text>
            <text class="text">{{ formatTime(activity.startTime) }}</text>
          </view>
          
          <view class="info-row">
            <text class="icon">👥</text>
            <text class="text">
              {{ activity.currentParticipants }}
              <text v-if="activity.maxParticipants > 0">
                / {{ activity.maxParticipants }}
              </text>
              人
            </text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="card-footer">
          <button 
            class="btn btn-primary"
            :disabled="!canEnroll(activity)"
            @click="handleEnroll(activity)"
          >
            {{ canEnroll(activity) ? '立即报名' : '已报满' }}
          </button>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty" v-if="!loading && activityList.length === 0">
        <text class="empty-text">暂无活动</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { getActivityListApi } from '@/api/activity'
import { useMemberStore } from '@/store/member'
import { isLoggedIn } from '@/store/auth'
import type { Activity } from '@/types/activity'

const memberStore = useMemberStore()

// ========== 状态 ==========
const loading = ref(false)
const activityList = ref<Activity[]>([])
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// ========== 是否可以报名 ==========
const canEnroll = (activity: Activity) => {
  if (!memberStore.isMember) return false
  if (activity.maxParticipants === 0) return true
  return activity.currentParticipants < activity.maxParticipants
}

// ========== 获取活动列表 ==========
async function fetchActivities(refresh = false) {
  if (!isLoggedIn()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 1500)
    return
  }
  
  if (loading.value) return
  
  if (refresh) {
    page.value = 1
    activityList.value = []
    hasMore.value = true
  }
  
  try {
    loading.value = true
    
    const res = await getActivityListApi({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    
    if (refresh) {
      activityList.value = res.list
    } else {
      activityList.value.push(...res.list)
    }
    
    hasMore.value = res.list.length >= pageSize.value
  } catch (error) {
    console.error('获取活动列表失败:', error)
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

// ========== 搜索 ==========
function handleSearch() {
  fetchActivities(true)
}

// ========== 重置 ==========
function resetSearch() {
  keyword.value = ''
  fetchActivities(true)
}

// ========== 加载更多 ==========
function loadMore() {
  if (hasMore.value && !loading.value) {
    page.value++
    fetchActivities()
  }
}

// ========== 报名活动 ==========
async function handleEnroll(activity: Activity) {
  if (!memberStore.isMember) {
    uni.showModal({
      title: '提示',
      content: '只有会员才能报名活动',
      showCancel: false
    })
    return
  }
  
  uni.navigateTo({
    url: `/pages/activity/enroll?id=${activity.id}`
  })
}

// ========== 格式化时间 ==========
function formatTime(time: string) {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

// ========== 获取类型样式 ==========
function getTypeClass(type: string) {
  const map: Record<string, string> = {
    '骑行': 'type-primary',
    '聚会': 'type-success',
    '培训': 'type-warning',
    '比赛': 'type-danger'
  }
  return map[type] || 'type-info'
}

// ========== 生命周期 ==========
onMounted(() => {
  memberStore.checkMemberStatus()
  fetchActivities(true)
})

// ========== 下拉刷新 ==========
onPullDownRefresh(() => {
  fetchActivities(true)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* ✅ 搜索栏（和 Vben 功能一致） */
.search-bar {
  display: flex;
  padding: 24rpx;
  background: #fff;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  height: 72rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.search-btn {
  width: 140rpx;
  height: 72rpx;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.reset-btn {
  width: 120rpx;
  height: 72rpx;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.scroll-view {
  height: calc(100vh - 120rpx);
  padding: 24rpx;
}

.activity-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.title {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
}

.type-tag {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #fff;
  flex-shrink: 0;
}

.type-primary { background: #667eea; }
.type-success { background: #2ec7c9; }
.type-warning { background: #ffb980; }
.type-danger { background: #ff6b9d; }

.card-body {
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.icon {
  width: 40rpx;
  font-size: 28rpx;
  margin-right: 16rpx;
}

.text {
  flex: 1;
  font-size: 26rpx;
  color: #666;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 16rpx 40rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}

.btn-primary {
  background: #667eea;
  color: #fff;
}

.btn-primary[disabled] {
  background: #ccc;
  color: #999;
}

.empty {
  text-align: center;
  padding: 200rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>