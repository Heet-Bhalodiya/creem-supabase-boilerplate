'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

type Notification = {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome to AI Content Studio! ✨',
      message: 'Thanks for signing up. Get started by exploring the dashboard.',
      time: '5m ago',
      read: false,
      type: 'info'
    },
    {
      id: '2',
      title: 'Payment Successful',
      message: 'Your subscription has been activated successfully.',
      time: '1h ago',
      read: false,
      type: 'success'
    },
    {
      id: '3',
      title: 'New Feature Available',
      message: 'Check out our new analytics dashboard.',
      time: '2h ago',
      read: true,
      type: 'info'
    },
    {
      id: '4',
      title: 'Security Alert',
      message: 'A new device signed into your account.',
      time: '1d ago',
      read: true,
      type: 'warning'
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-blue-500'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full p-0 text-xs'
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <div className='flex items-center justify-between p-4 pb-2'>
          <h3 className='font-semibold'>Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='text-muted-foreground hover:text-foreground h-auto p-0 text-xs'
              onClick={markAllAsRead}
            >
              <CheckCheck className='mr-1 h-3 w-3' />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className='text-muted-foreground p-8 text-center text-sm'>
            <Bell className='mx-auto mb-2 h-8 w-8 opacity-50' />
            <p>No notifications</p>
          </div>
        ) : (
          <ScrollArea className='h-100'>
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={`group hover:bg-muted/50 relative p-4 transition-colors ${
                    !notification.read ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        !notification.read ? getTypeColor(notification.type) : 'bg-transparent'
                      }`}
                    />
                    <div className='flex-1 space-y-1'>
                      <div className='flex items-start justify-between gap-2'>
                        <p className='text-sm leading-none font-medium'>{notification.title}</p>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
                          onClick={() => removeNotification(notification.id)}
                        >
                          <X className='h-3 w-3' />
                        </Button>
                      </div>
                      <p className='text-muted-foreground line-clamp-2 text-xs'>{notification.message}</p>
                      <div className='flex items-center justify-between pt-1'>
                        <p className='text-muted-foreground text-xs'>{notification.time}</p>
                        {!notification.read && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-primary hover:text-primary/80 h-auto p-0 text-xs'
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className='mr-1 h-3 w-3' />
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {index < notifications.length - 1 && <DropdownMenuSeparator />}
              </div>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
