<template>
  <view class="login-container">
    <view class="logo-box">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="title">摩托车骑行俱乐部</text>
    </view>
    
    <view class="form-box">
      <view class="input-item">
        <text class="label">用户名</text>
        <input 
          v-model="form.username" 
          placeholder="请输入用户名" 
          class="input"
        />
      </view>
      
      <view class="input-item">
        <text class="label">密码</text>
        <input 
          v-model="form.password" 
          type="password" 
          placeholder="请输入密码" 
          class="input"
        />
      </view>
      
      <!-- ✅ 优化后的验证码区域 -->
      <view class="captcha-item">
        <text class="label">验证码</text>
        <view class="captcha-row">
          <input 
            v-model="form.captcha" 
            placeholder="请输入验证码" 
            class="captcha-input"
          />
          <!-- ✅ 点击验证码图片刷新 -->
          <view class="captcha-box" @tap="refreshCaptcha">
            <text class="captcha-code">{{ captchaCode }}</text>
            <text class="refresh-hint">点击刷新</text>
          </view>
        </view>
      </view>
      
      <button 
        class="login-btn" 
        :loading="authState.loginLoading"
        @tap="handleLogin"
      >
        登录
      </button>
      
      <view class="footer">
        <text class="link" @tap="goToRegister">还没有账号？立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { login, useAuthState } from '@/store/auth'

const authState = useAuthState()

const form = ref({
  username: '',
  password: '',
  captcha: ''
})

const captchaCode = ref('')

/** ✅ 刷新验证码（点击图片触发） */
function refreshCaptcha() {
  captchaCode.value = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  // ✅ 添加触觉反馈（可选）
  uni.vibrateShort({
    success: () => console.log('振动反馈')
  })
}

async function handleLogin() {
  if (!form.value.username || !form.value.password || !form.value.captcha) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }
  
  if (form.value.captcha.toUpperCase() !== captchaCode.value) {
    uni.showToast({
      title: '验证码错误',
      icon: 'none'
    })
    refreshCaptcha()
    return
  }
  
  try {
    await login({
      username: form.value.username,
      password: form.value.password,
      captcha: `${form.value.captcha}_${Date.now()}`
    })
  } catch (error) {
    refreshCaptcha()
  }
}

function goToRegister() {
  uni.navigateTo({ url: '/pages/register/register' })
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
}

.logo-box {
  text-align: center;
  margin-top: 120rpx;
  margin-bottom: 80rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
}

.title {
  display: block;
  margin-top: 40rpx;
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
}

.form-box {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.input-item {
  margin-bottom: 40rpx;
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

/* ========== ✅ 优化后的验证码区域 ========== */
.captcha-item {
  margin-bottom: 40rpx;
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.captcha-input {
  flex: 1;
  min-width: 200rpx;
  height: 88rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

/* ✅ 可点击的验证码盒子 */
.captcha-box {
  flex-shrink: 0;
  width: 200rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

/* ✅ 点击时的动画效果 */
.captcha-box:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}

.captcha-code {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  letter-spacing: 4rpx;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.refresh-hint {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4rpx;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.footer {
  text-align: center;
  margin-top: 40rpx;
}

.link {
  color: #667eea;
  font-size: 28rpx;
}
</style>