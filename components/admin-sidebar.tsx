'use client'

import { ComponentType } from 'react'
import {
  LayoutDashboard,
  Users,
  Settings,
  Rocket,
  CreditCard,
  UserCog,
  ShoppingCart,
  ChevronDown,
  Receipt,
  Package,
  Percent,
  Mail,
  DollarSign,
  Settings2,
  UserCircle,
  Image,
  FileText,
  Lock,
  Coins,
  Wallet,
  TrendingUp,
  Plus
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/logo'

type MenuItem = {
  title: string
  url?: string
  icon: ComponentType<{ className?: string }>
  badge?: string
  items?: {
    title: string
    url: string
    icon?: ComponentType<{ className?: string }>
  }[]
}

const menuStructure: MenuItem[] = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Revenue',
    icon: Rocket,
    items: [
      {
        title: 'Orders',
        url: '/admin/revenue/orders',
        icon: ShoppingCart
      },
      {
        title: 'Subscriptions',
        url: '/admin/revenue/subscriptions',
        icon: Receipt
      },
      {
        title: 'Transactions',
        url: '/admin/revenue/transactions',
        icon: DollarSign
      }
    ]
  },
  {
    title: 'Products',
    icon: Package,
    items: [
      {
        title: 'One-time Products',
        url: '/admin/products/one-time',
        icon: ShoppingCart
      },
      {
        title: 'Subscriptions',
        url: '/admin/products/subscription',
        icon: Receipt
      },
      {
        title: 'Pricing Plans',
        url: '/admin/products/plans',
        icon: CreditCard
      },
      {
        title: 'Discounts',
        url: '/admin/products/discounts',
        icon: Percent
      }
    ]
  },
  {
    title: 'Credits',
    icon: Coins,
    items: [
      {
        title: 'Credits Overview',
        url: '/admin/credits',
        icon: Wallet
      },
      {
        title: 'Credit Products',
        url: '/admin/credits/products',
        icon: Plus
      },
      {
        title: 'Analytics',
        url: '/admin/credits/analytics',
        icon: TrendingUp
      }
    ]
  },
  {
    title: 'Users',
    icon: Users,
    items: [
      {
        title: 'All Users',
        url: '/admin/users',
        icon: Users
      },
      {
        title: 'Roles',
        url: '/admin/roles',
        icon: UserCog
      },
      {
        title: 'Permissions',
        url: '/admin/settings/permissions',
        icon: Lock
      }
    ]
  },
  {
    title: 'Settings',
    icon: Settings,
    items: [
      {
        title: 'My Profile',
        url: '/admin/my-profile',
        icon: UserCircle
      },
      {
        title: 'General',
        url: '/admin/settings/general',
        icon: Settings2
      },
      {
        title: 'Creem Config',
        url: '/admin/settings/creem',
        icon: CreditCard
      },
      {
        title: 'Email Providers',
        url: '/admin/settings/email-providers',
        icon: Mail
      },
      {
        title: 'Open Graph',
        url: '/admin/settings/open-graph',
        icon: Image
      },
      {
        title: 'Invoice',
        url: '/admin/settings/invoice',
        icon: FileText
      }
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className='border-b px-4 py-3'>
        <Link href='/admin' className='flex items-center gap-2'>
          <Logo />
          <Badge variant='secondary' className='text-xs'>
            Admin
          </Badge>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuStructure.map(item => {
                if (item.items && item.items.length > 0) {
                  const hasActiveChild = item.items.some(subItem => pathname === subItem.url)
                  return (
                    <Collapsible key={item.title} asChild className='group/collapsible' defaultOpen={hasActiveChild}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title} className={hasActiveChild ? 'bg-background/80' : ''}>
                            <item.icon className='h-4 w-4' />
                            <span>{item.title}</span>
                            <ChevronDown className='ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180' />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map(subItem => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                  <Link href={subItem.url}>
                                    {subItem.icon && <subItem.icon className='h-4 w-4' />}
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                if (!item.url) {
                  return null
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon className='h-4 w-4' />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant='secondary' className='ml-auto text-xs'>
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
