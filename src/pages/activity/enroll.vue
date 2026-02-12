<template>
  <view class="page">
    <view class="form-card">
      <text class="form-title">活动报名</text>
      
      <view class="form-item">
        <text class="label">姓名 <text class="required">*</text></text>
        <input 
          v-model="form.memberName" 
          placeholder="请输入您的姓名" 
          class="input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">联系电话 <text class="required">*</text></text>
        <input 
          v-model="form.memberPhone" 
          type="number"
          placeholder="请输入您的手机号" 
          maxlength="11"
          class="input"
        />
      </view>
      
      <view class="form-item">
        <text class="label">备注</text>
        <textarea 
          v-model="form.remark" 
          placeholder="请输入备注信息（选填）" 
          class="textarea"
          maxlength="200"
        />
      </view>
      
      <view class="tips">
        <text class="tips-icon">💡</text>
        <text class="tips-text">提交后将进入审核状态，请耐心等待管理员审核</text>
      </view>
      
      <button class="submit-btn" @tap="handleSubmit">提交报名</button>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { enrollActivityApi } from '@/api/activity'
const form = ref({
  activityId: 0,
  memberName: '',
  memberPhone: '',
  remark: ''
})
onLoad((options: any) => {
  form.value.activityId = Number(options.id)
})
async function handleSubmit() {
  if (!form.value.memberName.trim()) {
    uni.showToast({ title: '请输入姓名', icon: 'none' })
    return
  }
  
  if (!form.value.memberPhone.trim()) {
    uni.showToast({ title: '请输入联系电话', icon: 'none' })
    return
  }
  
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(form.value.memberPhone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  
  try {
    uni.showLoading({ title: '提交中...' })
    
    await enrollActivityApi(form.value)
    
    uni.hideLoading()
    uni.showToast({ title: '报名成功，请等待审核', icon: 'success' })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    console.error('报名失败:', error)
  }
}
</script>
<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
}
.form-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 32rpx;
}
.form-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 40rpx;
  text-align: center;
}
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
.required {
  color: #ff4d4f;
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
.tips {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  padding: 24rpx;
  background: #fff7e6;
  border-radius: 12rpx;
  margin-bottom: 32rpx;
}
.tips-icon {
  font-size: 32rpx;
  line-height: 1.5;
}
.tips-text {
  flex: 1;
  font-size: 24rpx;
  color: #fa8c16;
  line-height: 1.6;
}
.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>