// src/store/member.ts
import { createPersistedStore } from '@/utils/store'
import { checkMemberStatusApi } from '@/api/member'
interface MemberState {
  isMember: boolean
  loading: boolean
}
const initialState: MemberState = {
  isMember: false,
  loading: false
}
const memberStore = createPersistedStore('member', initialState)
export const useMemberState = () => memberStore.state
export async function checkMemberStatus(): Promise<boolean> {
  try {
    memberStore.setState({ loading: true })
    const res = await checkMemberStatusApi()
    memberStore.setState({ isMember: res })
    return res
  } catch (error) {
    console.error('检查会员状态失败:', error)
    memberStore.setState({ isMember: false })
    return false
  } finally {
    memberStore.setState({ loading: false })
  }
}
export function clearMemberCache() {
  memberStore.reset()
  memberStore.clearStorage()
}
export const useMemberStore = () => ({
  isMember: memberStore.state.value.isMember,
  checkMemberStatus
})