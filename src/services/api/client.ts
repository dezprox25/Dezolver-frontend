import axios from 'axios'
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { API_BASE_URL } from '@/lib/constants'

const IS_MOCK = import.meta.env.VITE_APP_MODE === 'mock'

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: IS_MOCK ? '/api/v1' : `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: !IS_MOCK,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.method === 'post') {
    config.headers['Idempotency-Key'] = crypto.randomUUID()
  }
  config.headers['X-Request-Id'] = crypto.randomUUID()
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const newToken: string = (res.data as { data: { accessToken: string } }).data.accessToken
        useAuthStore.getState().setAccessToken(newToken)
        onRefreshed(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

