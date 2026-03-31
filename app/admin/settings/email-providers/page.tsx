// Component Imports
import { EmailProvidersList } from '@/components/admin/email-providers-list'

// Utility Imports
import { getEmailProviders } from '@/lib/actions/email-providers'

const EmailProvidersPage = async () => {
  const providers = await getEmailProviders()

  return <EmailProvidersList providers={providers} />
}

export default EmailProvidersPage
