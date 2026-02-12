<template>
  <view class="page">
    <scroll-view 
      scroll-y 
      class="scroll-view"
      @scrolltolower="loadMore"
    >
      <view 
        v-for="course in courseList" 
        :key="course.id"
        class="course-card"
      >
        <view class="card-header">
          <text class="title">{{ course.courseName }}</text>
          <text class="category-tag">{{ course.category }}</text>
        </view>
        
        <text class="description">{{ course.description }}</text>
        
        <view class="info-list">
          <view class="info-item">
            <text class="icon">🕐</text>
            <text class="label">上课时间：</text>
            <text class="value">{{ course.scheduleTime || '待定' }}</text>
          </view>
          
          <view class="info-item">
            <text class="icon">📍</text>
            <text class="label">上课地点：</text>
            <text class="value">{{ course.location || '待定' }}</text>
          </view>
          
          <view class="info-item">
            <text class="icon">👨‍🏫</text>
            <text class="label">讲师：</text>
            <text class="value">{{ course.instructor || '专业教练' }}</text>
          </view>
        </view>
        
        <!-- ✅ 补全：底部区域 -->
        <view class="course-footer">
          <view class="online-tag" :class="course.online ? 'tag-online' : 'tag-offline'">
            <text>{{ course.online ? '线上课程' : '线下实操' }}</text>
          </view>
          
          <!-- ✅ 补全：前往报名按钮 -->
          <button class="enroll-btn" @tap="goToEnroll(course)">
            <text>前往报名</text>
          </button>
        </view>
      </view>
      
      <view class="empty" v-if="!loading && courseList.length === 0">
        <text class="empty-text">暂无课程</text>
      </view>
    </scroll-view>
  </view>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { getCourseListApi } from '@/api/course'
import { isLoggedIn } from '@/store/auth'
import { useMemberStore } from '@/store/member'
import type { Course } from '@/types/course'
const memberStore = useMemberStore()
const loading = ref(false)
const courseList = ref<Course[]>([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
async function fetchCourses(refresh = false) {
  if (!isLoggedIn()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 1500)
    return
  }
  
  if (loading.value) return
  
  if (refresh) {
    page.value = 1
    courseList.value = []
    hasMore.value = true
  }
  
  try {
    loading.value = true
    
    const res = await getCourseListApi({
      page: page.value,
      pageSize: pageSize.value
    })
    
    const data = res as any
    const list = data.list || data || []
    
    if (refresh) {
      courseList.value = list
    } else {
      courseList.value.push(...list)
    }
    
    hasMore.value = list.length >= pageSize.value
  } catch (error) {
    console.error('获取课程列表失败:', error)
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}
// ✅ 补全：前往报名功能
function goToEnroll(course: Course) {
  if (!memberStore.isMember) {
    uni.showModal({
      title: '提示',
      content: '只有会员才能报名课程',
      showCancel: false
    })
    return
  }
  
  uni.showModal({
    title: '报名提示',
    content: `课程"${course.courseName}"对应的培训活动在活动页面，是否立即跳转？`,
    success: (res) => {
      if (res.confirm) {
        uni.switchTab({ url: '/pages/activity/list' })
      }
    }
  })
}
function loadMore() {
  if (hasMore.value && !loading.value) {
    page.value++
    fetchCourses()
  }
}
onMounted(() => {
  if (isLoggedIn()) {
    memberStore.checkMemberStatus()
    fetchCourses(true)
  } else {
    uni.reLaunch({ url: '/pages/login/login' })
  }
})
onPullDownRefresh(() => {
  fetchCourses(true)
})
</script>
<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}
.scroll-view {
  height: 100vh;
  padding: 24rpx;
}
.course-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}
.title {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
}
.category-tag {
  padding: 8rpx 20rpx;
  background: #f3f3f3;
  color: #4fb86e;
  border-radius: 8rpx;
  font-size: 24rpx;
  flex-shrink: 0;
}
.description {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 24rpx;
}
.info-list {
  margin-bottom: 20rpx;
}
.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}
.icon {
  width: 40rpx;
  font-size: 28rpx;
  margin-right: 8rpx;
}
.label {
  font-size: 26rpx;
  color: #999;
}
.value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}
/* ✅ 补全：底部样式 */
.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24rpx;
}
.online-tag {
  display: inline-block;
  padding: 8rpx 24rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}
.tag-online {
  background: #e6f7ff;
  color: #1890ff;
}
.tag-offline {
  background: #fff7e6;
  color: #fa8c16;
}
/* ✅ 补全：报名按钮样式 */
.enroll-btn {
  padding: 0rpx 20rpx;
  background: #667eea;
  color: #fff;
  border-radius: 8rpx;
  font-size: 24rpx;
  border: none;
  margin-right: 0rpx;
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