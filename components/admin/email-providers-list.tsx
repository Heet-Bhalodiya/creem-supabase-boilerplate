'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { emailProviderColumns } from './email-providers-columns'
import type { EmailProvider } from '@/lib/actions/email-providers'

type EmailProvidersListProps = {
  providers: EmailProvider[]
}

export function EmailProvidersList({ providers }: EmailProvidersListProps) {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Email Providers</h1>
        </div>
      </div>

      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <DataTable columns={emailProviderColumns} data={providers} searchKey='name' searchPlaceholder='Search' />
        </CardContent>
      </Card>
    </div>
  )
}
