import axios from 'axios';
import { logger } from './logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://jp-2.frp.one:35661';

const instance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

instance.interceptors.request.use(
  (config) => {
    logger.debug(`API请求: ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });
    
    const token = localStorage.getItem('wishbridge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error('API请求拦截器错误', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    logger.debug(`API响应: ${response.config?.method?.toUpperCase()} ${response.config?.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
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
    };
    
    logger.error(`API错误: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, errorInfo);
    
    if (error.response?.status === 401) {
      logger.warn('认证失败，清除登录状态');
      localStorage.removeItem('wishbridge_token');
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
    return Promise.reject(error);
  }
);

export const API_BASE = API_BASE_URL;

export async function checkServerStatus() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    return {
      success: true,
      connected: data?.success === true,
      message: data?.message || '服务器正常'
    };
  } catch (err) {
    logger.error('健康检查失败', err);
    return {
      success: false,
      connected: false,
      error: getErrorMessage(err)
    };
  }
}

export function getErrorMessage(error) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return '网络已断开，请检查网络连接';
  }
  
  if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
    return '连接超时，服务器响应太慢';
  }
  
  if (error.code === 'ERR_NETWORK' || 
      error.message === 'Network Error' || 
      error.message?.includes('Failed to fetch') ||
      !error.response) {
    return `无法连接服务器 (${API_BASE_URL})`;
  }
  
  if (error.response?.data?.error) {
    const errData = error.response.data.error;
    if (errData.message) {
      return errData.message;
    }
  }
  
  const statusMessages = {
    400: '请求参数错误',
    401: '未授权访问，请重新登录',
    403: '无权访问',
    404: '请求的资源不存在',
    409: '资源冲突',
    500: '服务器内部错误，请稍后重试',
    502: '网关错误',
    503: '服务暂不可用，请稍后重试'
  };
  
  return statusMessages[error.response?.status] || 
         error.response?.data?.error?.message ||
         error.response?.data?.error || 
         error.message || 
         '请求失败';
}

export function handleApiError(error, context = '') {
  const message = getErrorMessage(error);
  
  if (context) {
    logger.error(`${context}: ${message}`, error);
  } else {
    logger.error(message, error);
  }
  
  if (window.$toast) {
    window.$toast.error(message);
  }
  
  return message;
}

export default instance;
