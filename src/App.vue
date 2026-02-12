<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { isLoggedIn } from '@/store/auth'
import { checkMemberStatus } from '@/store/member'
onLaunch(() => {
  console.log('App Launch')
  
  // ✅ 修复：直接调用函数
  if (isLoggedIn()) {
    checkMemberStatus()
  }
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>
<style>
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
/* ✅ 全局设置 box-sizing */
* {
  box-sizing: border-box;
}

button {
  border: none;
  outline: none;
}
button::after {
  border: none;
}
</style>