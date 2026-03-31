// Third-party Imports
import { Shield, User as UserIcon, CreditCard } from 'lucide-react'

// Component Imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EnhancedUsersTable } from '@/components/admin/enhanced-users-table'

// Utility Imports
import { getUsers, getUserStats } from '@/lib/actions/users'

const AdminUsersPage = async () => {
  const [users, stats] = await Promise.all([getUsers(), getUserStats()])

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Users</h2>
        <p className='text-muted-foreground'>Manage {stats.totalUsers} user accounts and permissions</p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <UserIcon className='h-4 w-4' />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalUsers}</div>
            <p className='text-muted-foreground text-xs'>Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <Shield className='h-4 w-4' />
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalAdmins}</div>
            <p className='text-muted-foreground text-xs'>Active administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <CreditCard className='h-4 w-4' />
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.activeSubscriptions}</div>
            <p className='text-muted-foreground text-xs'>Paying customers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <EnhancedUsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminUsersPage
