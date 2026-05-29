import axios from 'axios'
import { logger } from './logger'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://jp-2.frp.one:35661'

const instance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

instance.interceptors.request.use(
  (config) => {
    logger.debug(`API请求: ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    })
    
    const token = localStorage.getItem('wishbridge_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    logger.error('API请求拦截器错误', error)
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => {
    logger.debug(`API响应: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    })
    return response
  },
  (error) => {
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    }
    
    logger.error(`API错误: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, errorInfo)
    
    if (error.response?.status === 401) {
      logger.warn('认证失败，清除登录状态')
      localStorage.removeItem('wishbridge_token')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default instance
