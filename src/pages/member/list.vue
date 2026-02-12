<template>
  <view class="page">
  
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input 
        v-model="keyword" 
        placeholder="搜索会员姓名、手机号" 
        class="search-input"
        @confirm="handleSearch"
      />
      <button class="search-btn" @tap="handleSearch">搜索</button>
    </view>
    
    <!-- 会员列表 -->
    <scroll-view 
      scroll-y 
      class="scroll-view"
      @scrolltolower="loadMore"
    >
      <view 
        v-for="member in memberList" 
        :key="member.id"
        class="member-card"
      >
        <view class="card-header">
          <text class="name">{{ member.memberName }}</text>
          <text class="tag" :class="member.gender === '男' ? 'tag-blue' : 'tag-pink'">
            {{ member.gender }}
          </text>
        </view>
        
        <view class="card-body">
          <text class="info">📱 {{ member.phone }}</text>
          <text class="info">🏍️ {{ member.motorcycleBrand || '暂无' }}</text>
          <text class="info">📅 {{ member.joinDate }}</text>
        </view>
      </view>
      
      <view class="empty" v-if="!loading && memberList.length === 0">
        <text class="empty-text">暂无会员数据</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { getMemberListApi } from '@/api/member'
import { isLoggedIn } from '@/store/auth'
import type { Member } from '@/types/member'
import NavBar from '@/components/NavBar.vue'  // ✅ 导入导航栏组件

const loading = ref(false)
const memberList = ref<Member[]>([])
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

async function fetchMembers(refresh = false) {
  if (!isLoggedIn()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 1500)
    return
  }
  
  if (loading.value) return
  
  if (refresh) {
    page.value = 1
    memberList.value = []
    hasMore.value = true
  }
  
  try {
    loading.value = true
    
    const res = await getMemberListApi({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    
    if (refresh) {
      memberList.value = res.list
    } else {
      memberList.value.push(...res.list)
    }
    
    hasMore.value = res.list.length >= pageSize.value
  } catch (error) {
    console.error('获取会员列表失败:', error)
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

function handleSearch() {
  fetchMembers(true)
}

function loadMore() {
  if (hasMore.value && !loading.value) {
    page.value++
    fetchMembers()
  }
}

onMounted(() => {
  fetchMembers(true)
})

onPullDownRefresh(() => {
  fetchMembers(true)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

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

.scroll-view {
  height: calc(100vh - 208rpx);  /* ✅ 状态栏 + 导航栏 + 搜索栏 */
  padding: 24rpx;
}

.member-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.tag {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #fff;
}

.tag-blue {
  background: #667eea;
}

.tag-pink {
  background: #ff6b9d;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info {
  font-size: 26rpx;
  color: #666;
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