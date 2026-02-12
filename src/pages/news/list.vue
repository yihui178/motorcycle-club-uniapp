<template>
  <view class="page">
    <!-- ✅ 顶部操作栏 -->
    <view class="header" v-if="isMember || isAdmin">
      <view class="header-left">
        <text class="header-title">俱乐部动态</text>
      </view>
      <view class="header-right">
        <!-- 管理员：筛选审核状态 -->
        <picker 
          v-if="isAdmin" 
          :range="statusOptions" 
          @change="handleStatusChange"
          class="status-picker"
        >
          <view class="picker-btn">
            <text>{{ selectedStatus || '全部状态' }}</text>
          </view>
        </picker>
        
        <!-- 发布按钮 -->
        <button class="publish-btn" @tap="openPublishDialog">
          <text>+ 发布</text>
        </button>
      </view>
    </view>

    <!-- 动态列表 -->
    <scroll-view 
      scroll-y 
      :class="['scroll-view', (isMember || isAdmin) ? 'has-header' : '']"
      @scrolltolower="loadMore"
    >
      <view 
        v-for="news in newsList" 
        :key="news.id"
        class="news-card"
      >
        <!-- 图片 -->
        <image 
          v-if="news.hasImage && news.imageUrl" 
          :src="news.imageUrl" 
          class="news-image"
          mode="aspectFill"
          @error="handleImageError"
        />
        
        <view class="card-content">
          <!-- 标题 + 审核状态 -->
          <view class="title-row">
            <text class="title">{{ news.newsName }}</text>
            <view 
              v-if="isAdmin || news.status !== 'approved'" 
              class="status-badge" 
              :class="getStatusClass(news.status)"
            >
              {{ getStatusText(news.status) }}
            </view>
          </view>
          
          <text class="content">{{ news.newsContent }}</text>
          
          <!-- 发布者（管理员可见） -->
          <text v-if="isAdmin && news.creatorName" class="creator">
            发布者：{{ news.creatorName }}
          </text>
          
          <view class="categories">
            <text 
              v-for="cat in parseArray(news.newsCategory)" 
              :key="cat"
              class="category-tag"
            >
              {{ cat }}
            </text>
          </view>
          
          <view class="tags">
            <text 
              v-for="tag in parseArray(news.newsTags)" 
              :key="tag"
              class="tag"
            >
              #{{ tag }}
            </text>
          </view>

          <!-- ✅ 操作按钮（管理员） -->
          <view class="actions" v-if="isAdmin">
            <button 
              v-if="news.status === 'pending'" 
              class="action-btn approve"
              @tap="reviewNews(news.id, 'approve')"
            >
              ✓ 通过
            </button>
            <button 
              v-if="news.status === 'pending'" 
              class="action-btn reject"
              @tap="reviewNews(news.id, 'reject')"
            >
              ✗ 拒绝
            </button>
            <button 
              class="action-btn delete"
              @tap="deleteNews(news.id)"
            >
              删除
            </button>
          </view>
        </view>
      </view>
      
      <view class="empty" v-if="!loading && newsList.length === 0">
        <text class="empty-text">暂无动态</text>
      </view>
    </scroll-view>

    <!-- ✅ 发布弹窗 -->
    <view class="publish-modal" v-if="publishVisible" @tap="closePublish">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">发布动态</text>
        
        <view class="form-item">
          <text class="label">标题 *</text>
          <input 
            v-model="form.newsName" 
            placeholder="请输入动态标题（20字内）" 
            maxlength="20"
            class="input"
          />
        </view>

        <view class="form-item">
          <text class="label">内容 *</text>
          <textarea 
            v-model="form.newsContent" 
            placeholder="请输入动态内容（200字内）" 
            maxlength="200"
            class="textarea"
          />
        </view>

        <view class="form-item">
          <text class="label">分类 *</text>
          <picker 
            mode="multiSelector" 
            :range="[categoryOptions]" 
            @change="handleCategoryChange"
          >
            <view class="picker">
              {{ form.newsCategory.length > 0 ? form.newsCategory.join(', ') : '请选择分类' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">标签 *</text>
          <picker 
            mode="multiSelector" 
            :range="[tagOptions]" 
            @change="handleTagChange"
          >
            <view class="picker">
              {{ form.newsTags.length > 0 ? form.newsTags.join(', ') : '请选择标签' }}
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">简介 *</text>
          <textarea 
            v-model="form.newsDescription" 
            placeholder="一句话概括（50字内）" 
            maxlength="50"
            class="textarea"
          />
        </view>

        <!-- ✅ 图片上传 -->
        <view class="form-item">
          <text class="label">配图（可选）</text>
          <view class="image-upload">
            <view v-if="!form.imageUrl" class="upload-btn" @tap="chooseImage">
              <text class="upload-icon">+</text>
              <text class="upload-text">点击上传</text>
            </view>
            <view v-else class="image-preview">
              <image :src="previewUrl" class="preview-image" mode="aspectFill" />
              <button class="remove-btn" @tap="removeImage">删除</button>
            </view>
          </view>
        </view>

        <view class="form-actions">
          <button class="cancel-btn" @tap="closePublish">取消</button>
          <button class="submit-btn" @tap="submitPublish" :loading="submitting">
            {{ submitting ? '发布中...' : '发布' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { 
  getNewsListApi, 
  getNewsListAdminApi, 
  addNewsApi, 
  reviewNewsApi, 
  deleteNewsApi,
  uploadNewsImageApi 
} from '@/api/news'
import { isLoggedIn } from '@/store/auth'
import { useMemberStore } from '@/store/member'
import type { News } from '@/types/news'

const memberStore = useMemberStore()

// ========== 角色判断 ==========
const isMember = computed(() => memberStore.isMember)
const isAdmin = computed(() => {
  try {
    const authData = uni.getStorageSync('auth')
    if (authData) {
      const parsed = JSON.parse(authData)
      const role = parsed.userInfo?.role
      return role === 'admin' || role === 'super'
    }
  } catch (e) {
    console.error('读取角色失败:', e)
  }
  return false
})
// ========== 列表状态 ==========
const loading = ref(false)
const newsList = ref<News[]>([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
// ========== 筛选状态（管理员用） ==========
const selectedStatus = ref('')
const statusOptions = ['全部状态', '待审核', '已通过', '已拒绝']
// ========== 发布表单 ==========
const publishVisible = ref(false)
const submitting = ref(false)
const form = ref({
  newsName: '',
  newsContent: '',
  newsCategory: [] as string[],
  newsTags: [] as string[],
  newsDescription: '',
  hasImage: false,
  imageUrl: ''
})
const previewUrl = ref('')  // 用于显示图片预览
const categoryOptions = ['俱乐部活动', '骑行技巧', '安全知识', '车辆保养', '最新动态', '会员风采']
const tagOptions = ['动态', '活动', '教学', '安全', '保养', '推荐']
// ========== 获取动态列表 ==========
async function fetchNews(refresh = false) {
  if (!isLoggedIn()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.reLaunch({ url: '/pages/login/login' }), 1500)
    return
  }
  
  if (loading.value) return
  
  if (refresh) {
    page.value = 1
    newsList.value = []
    hasMore.value = true
  }
  
  try {
    loading.value = true
    
    // ✅ 管理员调用 page-admin 接口
    const apiFunc = isAdmin.value ? getNewsListAdminApi : getNewsListApi
    const params: any = {
      page: page.value,
      pageSize: pageSize.value
    }
    
    // 管理员可筛选状态
    if (isAdmin.value && selectedStatus.value) {
      const statusMap: Record<string, string> = {
        '待审核': 'pending',
        '已通过': 'approved',
        '已拒绝': 'rejected'
      }
      params.status = statusMap[selectedStatus.value] || ''
    }
    
    const res = await apiFunc(params)
    const data = res as any
    const list = data.list || data || []
    
    if (refresh) {
      newsList.value = list
    } else {
      newsList.value.push(...list)
    }
    
    hasMore.value = list.length >= pageSize.value
  } catch (error) {
    console.error('获取新闻列表失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}
// ========== 筛选状态变更 ==========
function handleStatusChange(e: any) {
  const index = e.detail.value
  selectedStatus.value = statusOptions[index] === '全部状态' ? '' : statusOptions[index]
  fetchNews(true)
}
// ========== 打开发布弹窗 ==========
function openPublishDialog() {
  if (!isMember.value && !isAdmin.value) {
    uni.showToast({ title: '只有会员才能发布动态', icon: 'none' })
    return
  }
  
  // 重置表单
  form.value = {
    newsName: '',
    newsContent: '',
    newsCategory: [],
    newsTags: [],
    newsDescription: '',
    hasImage: false,
    imageUrl: ''
  }
  previewUrl.value = ''
  publishVisible.value = true
}
// ========== 关闭发布弹窗 ==========
function closePublish() {
  publishVisible.value = false
}
// ========== 选择图片 ==========
function chooseImage() {
  uni.showActionSheet({
    itemList: ['拍照', '从相册选择'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 拍照
        takePhoto()
      } else if (res.tapIndex === 1) {
        // 从相册选择
        chooseFromAlbum()
      }
    }
  })
}
/** ✅ 拍照上传 */
function takePhoto() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],  // 压缩图片（节省流量）
    sourceType: ['camera'],    // ✅ 只允许拍照
    success: (res) => {
      uploadImage(res.tempFilePaths[0])
    },
    fail: (error) => {
      console.error('拍照失败:', error)
      uni.showToast({ title: '拍照失败', icon: 'none' })
    }
  })
}
/** ✅ 从相册选择 */
function chooseFromAlbum() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],  // 压缩图片
    sourceType: ['album'],     // ✅ 只允许从相册选择
    success: (res) => {
      uploadImage(res.tempFilePaths[0])
    },
    fail: (error) => {
      console.error('选择图片失败:', error)
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    }
  })
}
/** ✅ 统一的上传逻辑 */
async function uploadImage(tempFilePath: string) {
  // 1. 检查文件大小（可选，提前校验）
  try {
    const fileInfo = await uni.getFileInfo({ filePath: tempFilePath })
    if (fileInfo.size > 5 * 1024 * 1024) {
      uni.showToast({ title: '图片大小不能超过5MB', icon: 'none' })
      return
    }
  } catch (e) {
    console.warn('获取文件信息失败:', e)
  }
  
  // 2. 显示本地预览
  previewUrl.value = tempFilePath
  
  // 3. 上传到服务器
  try {
    uni.showLoading({ title: '上传中...' })
    
    const result = await uploadNewsImageApi(tempFilePath) as any
    
    form.value.imageUrl = result.url  // 保存后端返回的文件路径
    form.value.hasImage = true
    
    uni.hideLoading()
    uni.showToast({ title: '上传成功', icon: 'success' })
  } catch (error: any) {
    uni.hideLoading()
    console.error('上传失败:', error)
    uni.showToast({ title: error.message || '上传失败', icon: 'none' })
    previewUrl.value = ''  // 清除预览
  }
}
/** ✅ 删除图片 */
function removeImage() {
  form.value.imageUrl = ''
  form.value.hasImage = false
  previewUrl.value = ''
  uni.showToast({ title: '图片已移除', icon: 'success' })
}
// ========== 分类/标签选择 ==========
function handleCategoryChange(e: any) {
  const indexes = e.detail.value
  form.value.newsCategory = indexes.map((i: number) => categoryOptions[i])
}
function handleTagChange(e: any) {
  const indexes = e.detail.value
  form.value.newsTags = indexes.map((i: number) => tagOptions[i])
}
// ========== 提交发布 ==========
async function submitPublish() {
  // 表单验证
  if (!form.value.newsName.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  if (!form.value.newsContent.trim()) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }
  if (form.value.newsCategory.length === 0) {
    uni.showToast({ title: '请选择分类', icon: 'none' })
    return
  }
  if (form.value.newsTags.length === 0) {
    uni.showToast({ title: '请选择标签', icon: 'none' })
    return
  }
  if (!form.value.newsDescription.trim()) {
    uni.showToast({ title: '请输入简介', icon: 'none' })
    return
  }
  
  try {
    submitting.value = true
    
    await addNewsApi(form.value)
    
    uni.showToast({ 
      title: isAdmin.value ? '发布成功' : '提交成功，请等待审核', 
      icon: 'success' 
    })
    
    publishVisible.value = false
    fetchNews(true)  // 刷新列表
  } catch (error) {
    console.error('发布失败:', error)
    uni.showToast({ title: '发布失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
// ========== 审核动态（管理员） ==========
async function reviewNews(newsId: number, action: string) {
  const actionText = action === 'approve' ? '通过' : '拒绝'
  
  uni.showModal({
    title: '确认审核',
    content: `确定${actionText}该动态吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await reviewNewsApi(newsId, action)
          uni.showToast({ title: `${actionText}成功`, icon: 'success' })
          fetchNews(true)
        } catch (error) {
          console.error('审核失败:', error)
          uni.showToast({ title: '审核失败', icon: 'none' })
        }
      }
    }
  })
}
// ========== 删除动态（管理员） ==========
async function deleteNews(newsId: number) {
  uni.showModal({
    title: '确认删除',
    content: '确定删除该动态吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteNewsApi(newsId)
          uni.showToast({ title: '删除成功', icon: 'success' })
          fetchNews(true)
        } catch (error) {
          console.error('删除失败:', error)
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}
// ========== 辅助函数 ==========
function parseArray(value: any): string[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return value.split(',').filter(v => v)
  return []
}
function getStatusText(status?: string): string {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return map[status || ''] || '未知'
}
function getStatusClass(status?: string): string {
  const map: Record<string, string> = {
    pending: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected'
  }
  return map[status || ''] || ''
}
function handleImageError(e: any) {
  console.error('图片加载失败:', e)
}
function loadMore() {
  if (hasMore.value && !loading.value) {
    page.value++
    fetchNews()
  }
}
// ========== 生命周期 ==========
onMounted(() => {
  if (isLoggedIn()) {
    memberStore.checkMemberStatus()
    fetchNews(true)
  } else {
    uni.reLaunch({ url: '/pages/login/login' })
  }
})
onPullDownRefresh(() => {
  fetchNews(true)
})
</script>
<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}
/* ========== 顶部操作栏 ========== */
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-bottom: 2rpx solid #e0e0e0;
}
.header-left {
  flex: 1;
}
.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.status-picker {
  margin-right: 16rpx;
}
.picker-btn {
  padding: 12rpx 24rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
}
.publish-btn {
  padding: 0rpx 20rpx;
  background: #667eea;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
  border: none;
}
/* ========== 滚动区域 ========== */
.scroll-view {
  height: 100vh;
  padding: 24rpx;
}
.scroll-view.has-header {
  height: calc(100vh - 120rpx);  /* 减去顶部栏高度 */
}
/* ========== 动态卡片 ========== */
.news-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}
.news-image {
  width: 100%;
  height: 400rpx;
  background: #f5f5f5;
}
.card-content {
  padding: 32rpx;
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}
.title {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-right: 16rpx;
}
/* ========== 审核状态徽章 ========== */
.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  white-space: nowrap;
}
.status-pending {
  background: #fff7e6;
  color: #fa8c16;
}
.status-approved {
  background: #f6ffed;
  color: #52c41a;
}
.status-rejected {
  background: #fff1f0;
  color: #ff4d4f;
}
.content {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16rpx;
}
.creator {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
}
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.category-tag {
  padding: 8rpx 16rpx;
  background: #667eea;
  color: #fff;
  border-radius: 8rpx;
  font-size: 24rpx;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.tag {
  padding: 8rpx 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
}
/* ========== 操作按钮（管理员） ========== */
.actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #f0f0f0;
}
.action-btn {
  flex: 1;
  height: 64rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  border: none;
}
.approve {
  background: #52c41a;
  color: #fff;
}
.reject {
  background: #ff4d4f;
  color: #fff;
}
.delete {
  background: #f5f5f5;
  color: #ff4d4f;
}
/* ========== 发布弹窗 ========== */
.publish-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-content {
  width: 90%;
  max-height: 80vh;
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 32rpx;
  overflow-y: auto;
}
.modal-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 32rpx;
  text-align: center;
}
/* ========== 表单项 ========== */
.form-item {
  margin-bottom: 32rpx;
}
.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}
.input {
  width: 100%;
  height: 88rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.textarea {
  width: 100%;
  min-height: 200rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}
.picker {
  width: 100%;
  height: 88rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  line-height: 88rpx;
  color: #666;
  box-sizing: border-box;
}
/* ========== 图片上传 ========== */
.image-upload {
  width: 100%;
}
.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #e0e0e0;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}
.upload-icon {
  font-size: 64rpx;
  color: #999;
}
.upload-text {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}
.image-preview {
  position: relative;
  width: 100%;
  height: 400rpx;
  border-radius: 12rpx;
  overflow: hidden;
}
.preview-image {
  width: 100%;
  height: 100%;
}
.remove-btn {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 8rpx 24rpx;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 8rpx;
  font-size: 24rpx;
  border: none;
}
/* ========== 弹窗操作按钮 ========== */
.form-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 40rpx;
}
.cancel-btn {
  flex: 1;
  height: 88rpx;
  background: #f5f5f5;
  color: #666;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}
.submit-btn {
  flex: 1;
  height: 88rpx;
  background: #667eea;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
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