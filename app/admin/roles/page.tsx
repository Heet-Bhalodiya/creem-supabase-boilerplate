// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import { RolesTable } from '@/components/admin/roles-table'

// Utility Imports
import { getRoles } from '@/lib/actions/users'

const AdminRolesPage = async () => {
  const roles = await getRoles()

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Roles</h2>
        <p className='text-muted-foreground'>Manage user roles and access control for your application</p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <RolesTable initialRoles={roles} />
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminRolesPage
