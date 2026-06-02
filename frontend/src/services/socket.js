import { io } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth'
import { useWishesStore } from '@/stores/wishes'
import { useMoodsStore } from '@/stores/moods'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://jp-2.frp.one:35661'

let socket = null
let reconnectAttempts = 0
const maxReconnectAttempts = 5

export function initSocket() {
  if (socket?.connected) {
    return socket
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: maxReconnectAttempts
  })

  socket.on('connect', () => {
    console.log('Socket connected')
    reconnectAttempts = 0
    
    const authStore = useAuthStore()
    if (authStore.token) {
      socket.emit('auth', { token: authStore.token })
    }
  })

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
    reconnectAttempts++
  })

  socket.on('auth:success', (data) => {
    console.log('Socket auth success:', data)
  })

  socket.on('auth:failed', (data) => {
    console.error('Socket auth failed:', data)
  })

  socket.on('wish:new', (data) => {
    console.log('New wish received:', data)
    const wishesStore = useWishesStore()
    wishesStore.addWish(data.wish)
    showNotification('新愿望', `${data.wish.sender.username} 发来了新愿望`)
  })

  socket.on('wish:updated', (data) => {
    console.log('Wish updated:', data)
    const wishesStore = useWishesStore()
    wishesStore.updateWish(data.wish)
    
    if (data.wish.status === 'realized') {
      showNotification('愿望已实现', '你的愿望已被实现啦！')
    }
  })

  socket.on('wish:modifyRequest', (data) => {
    console.log('Modify request:', data)
    showNotification('修改申请', `${data.requester} 想修改你的愿望`)
  })

  socket.on('wish:modifyResponse', (data) => {
    console.log('Modify response:', data)
    const wishesStore = useWishesStore()
    const wish = wishesStore.wishes.find(w => w.id === data.wishId)
    if (wish) {
      wish.modify_status = data.modify_status
    }
    
    const message = data.accept ? '接受了你的修改申请' : '拒绝了你的修改申请'
    showNotification('申请结果', message)
  })

  socket.on('mood:updated', (data) => {
    console.log('Mood updated:', data)
    const moodsStore = useMoodsStore()
    const authStore = useAuthStore()
    
    if (data.userId && data.userId !== authStore.user?.id) {
      // 来自对方的心情更新
      moodsStore.setPartnerMood(data)
      showNotification('心情更新', `${data.username} 的心情变成了 ${data.mood}`)
    } else {
      // 自己的心情更新
      moodsStore.setCurrentMood(data)
    }
  })

  socket.on('notification', (data) => {
    showNotification(data.title, data.body)
  })

  socket.on('error', (data) => {
    console.error('Socket error:', data)
  })

  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

function showNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico'
    })
  }
  
  const event = new CustomEvent('app-notification', {
    detail: { title, body }
  })
  window.dispatchEvent(event)
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}
