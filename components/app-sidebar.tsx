'use client'

import { ComponentType } from 'react'
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  Users,
  FileText,
  BarChart3,
  User,
  ChevronDown,
  DollarSign,
  Coins,
  Wand2
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
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PermissionGate } from '@/components/permission-gate'
import Logo from '@/components/logo'

type MenuItem = {
  title: string
  url?: string
  icon: ComponentType<{ className?: string }>
  permission?: string | string[]
  items?: {
    title: string
    url: string
    icon?: ComponentType<{ className?: string }>
    permission?: string | string[]
  }[]
}

const menuStructure: MenuItem[] = [
  {
    title: 'Dashboard',
    url: '/user',
    icon: LayoutDashboard
  },
  {
    title: 'Pricing',
    url: '/user/pricing',
    icon: DollarSign
  },
  {
    title: 'Billing & Payments',
    url: '/user/billing',
    icon: CreditCard
  },
  {
    title: 'Credits',
    url: '/user/credits',
    icon: Coins
  },
  {
    title: 'AI Content Studio',
    url: '/user/demo',
    icon: Wand2
  },
  {
    title: 'Analytics',
    url: '/user/analytics',
    icon: BarChart3,
    permission: 'analytics.read'
  },
  {
    title: 'Team',
    url: '/user/team',
    icon: Users,
    permission: 'team.read'
  },
  {
    title: 'Documents',
    url: '/user/documents',
    icon: FileText,
    permission: 'documents.read'
  },
  {
    title: 'Account Settings',
    icon: Settings,
    items: [
      {
        title: 'My Profile',
        url: '/user/my-profile',
        icon: User
      },
      {
        title: 'Settings',
        url: '/user/settings',
        icon: Settings,
        permission: 'settings.write'
      }
    ]
  }
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className='border-b px-4 py-3'>
        <Link href='/'>
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuStructure.map(item => {
                const itemContent =
                  item.items && item.items.length > 0 ? (
                    <Collapsible key={item.title} asChild className='group/collapsible'>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            <item.icon className='h-4 w-4' />
                            <span>{item.title}</span>
                            <ChevronDown className='ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180' />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map(subItem => {
                              const subItemContent = (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                    <Link href={subItem.url}>
                                      {subItem.icon && <subItem.icon className='h-4 w-4' />}
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )

                              // Wrap sub-item with permission gate if it has permissions
                              return subItem.permission ? (
                                <PermissionGate key={subItem.title} permissions={subItem.permission}>
                                  {subItemContent}
                                </PermissionGate>
                              ) : (
                                subItemContent
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : item.url ? (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                        <Link href={item.url}>
                          <item.icon className='h-4 w-4' />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : null

                if (!itemContent) return null

                // Wrap entire section with permission gate if it has permissions
                return item.permission ? (
                  <PermissionGate key={item.title} permissions={item.permission}>
                    {itemContent}
                  </PermissionGate>
                ) : (
                  itemContent
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
