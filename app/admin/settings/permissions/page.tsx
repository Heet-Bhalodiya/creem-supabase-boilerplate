// Component Imports
import { PermissionsTable } from '@/components/admin/permissions-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Utility Imports
import { createClient } from '@/lib/supabase/server'

const PermissionsPage = async () => {
  const supabase = await createClient()

  // Fetch all permissions
  const { data: permissions } = await supabase
    .from('permissions')
    .select('*')
    .order('resource', { ascending: true })
    .order('action', { ascending: true })

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Permissions</h2>
        <p className='text-muted-foreground'>Manage system permissions and access control</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Permissions</CardTitle>
          <CardDescription>
            Create, edit, or delete permissions. Permissions can be assigned to roles to control access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionsTable permissions={permissions || []} />
        </CardContent>
      </Card>
    </div>
  )
}

export default PermissionsPage
