// Next Imports
import { notFound } from 'next/navigation'

// Component Imports
import { EmailProviderEdit } from '@/components/admin/email-provider-edit'

// Utility Imports
import { getEmailProvider } from '@/lib/actions/email-providers'

const EmailProviderEditPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const provider = await getEmailProvider(slug)
  if (!provider) {
    notFound()
  }
  return <EmailProviderEdit provider={provider} />
}

export default EmailProviderEditPage
