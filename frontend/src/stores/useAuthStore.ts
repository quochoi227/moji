import { create } from 'zustand'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import type { AuthState } from '@/types/store'
import { persist } from 'zustand/middleware'
import { useChatStore } from './useChatStore'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      setAccessToken: (accessToken) => {
        set({ accessToken })
      },
      clearState: () => {
        set({ accessToken: null, user: null, loading: false })
        localStorage.removeItem('auth-storage')
        useChatStore.getState().reset()
      },

      signUp: async (username, password, firstname, lastname, email) => {
        try {
          set({ loading: true })

          await authService.signUp(username, password, firstname, lastname, email)

          toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
          toast.error('Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.')
          throw error
        } finally {
          set({ loading: false })
        }
      },
      signIn: async (username, password) => {
        try {
          set({ loading: true })
          localStorage.removeItem('auth-storage')
          useChatStore.getState().reset()
          const { accessToken } = await authService.signIn(username, password)
          get().setAccessToken(accessToken)
          await get().fetchMe()
          useChatStore.getState().fetchConversations()
          toast.success('Chào mừng bạn đến với Moji 🎉!')
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
          toast.error('Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.')
          throw error
        } finally {
          set({ loading: false })
        }
      },
      signOut: async () => {
        try {
          get().clearState()
          await authService.signOut()
          toast.success('Đăng xuất thành công!')
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
          toast.error('Đã xảy ra lỗi trong quá trình đăng xuất. Vui lòng thử lại.')
          throw error
        } finally {
          set({ loading: false })
        }
      },
      fetchMe: async () => {
        try {
          set({ loading: true })
          const user = await authService.fetchMe()
          set({ user })
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
          set({ user: null, accessToken: null })
          toast.error('Đã xảy ra lỗi khi lấy thông tin người dùng.')
        } finally {
          set({ loading: false })
        }
      },
      refresh: async () => {
        try {
          set({ loading: true })
          const { user, fetchMe, setAccessToken } = get()
          const accessToken = await authService.refresh()
          setAccessToken(accessToken)
          if (!user) {
            await fetchMe()
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
          toast.error('Phiên đã hết hạn. Vui lòng đăng nhập lại.')
          get().clearState()
        } finally {
          set({ loading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user
      })
    }
  )
)
