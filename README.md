<div align="center">
  <img alt="AI Content Studio - Next.js + Supabase + Creem" src="./public/readme-image.jpeg">
  
  <h1>🚀 AI Content Studio SaaS</h1>
  
  <p>Production-ready AI Content Platform with Next.js 15, Supabase, Creem Payments, and Credits System</p>

  <p>
    <a href="#-features"><strong>Features</strong></a> ·
    <a href="#-quick-start"><strong>Quick Start</strong></a> ·
    <a href="#-tech-stack"><strong>Tech Stack</strong></a> ·
    <a href="#-demo"><strong>Demo</strong></a> ·
    <a href="#-deployment"><strong>Deployment</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15">
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
    <img src="https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  </p>
</div>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      
### 🔐 Authentication
- ✅ Email/Password authentication
- ✅ Social login (Google, GitHub)
- ✅ Magic link authentication
- ✅ Email verification
- ✅ Password reset flow
- ✅ Role-based access control (Admin/User)
- ✅ Protected routes with middleware

### 💳 Payments & Subscriptions
- ✅ **Creem Payments** integration
- ✅ Subscription management (create, upgrade, downgrade)
- ✅ Proration handling for plan changes
- ✅ Customer billing portal
- ✅ One-time purchases
- ✅ Webhook event handling
- ✅ Invoice generation

### 🎨 UI & Design
- ✅ Modern landing page with hero section
- ✅ Complete pricing page (3 tiers)
- ✅ Professional dashboard with sidebar
- ✅ Billing management interface
- ✅ Dark mode with theming
- ✅ Fully responsive design
- ✅ shadcn/ui components (Radix Nova)

    </td>
    <td width="50%">

### 💰 Credits System (AI-Powered)
- ✅ **Credits wallet** for AI content generation
- ✅ Earn credits via subscriptions (1K-20K/month)
- ✅ Purchase credit packages
- ✅ Track usage by content type (copywriting, images, voice)
- ✅ Admin analytics dashboard
- ✅ Full transaction history
- ✅ Auto top-up with active subscriptions

### 👨‍💼 Admin Dashboard
- ✅ User management
- ✅ Subscription analytics
- ✅ Credit wallet management
- ✅ Manual credit grants
- ✅ Credit products manager
- ✅ Revenue analytics
- ✅ System settings

### 🛠️ Developer Experience
- ✅ TypeScript strict mode
- ✅ Tailwind CSS v4
- ✅ ESLint configuration
- ✅ Database migrations
- ✅ RLS policies
- ✅ Type-safe API routes
- ✅ One-click Vercel deployment

    </td>
  </tr>
</table>

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) with App Router |
| **Language** | [TypeScript 5.0](https://www.typescriptlang.org) |
| **Database** | [Supabase](https://supabase.com) (PostgreSQL) |
| **Authentication** | [Supabase Auth](https://supabase.com/auth) |
| **Payments** | [Creem SDK](https://creem.io) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Components** | [shadcn/ui](https://ui.shadcn.com) (Radix Nova) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and pnpm
- Supabase account ([sign up free](https://supabase.com))
- Creem account ([sign up](https://creem.io))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/creem-boilerplate.git
cd creem-boilerplate
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Creem Payments
CREEM_API_KEY=your_creem_api_key
CREEM_WEBHOOK_SECRET=your_creem_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

<details>
<summary>📝 Where to find these values</summary>

- **Supabase URL & Keys**: [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → API
- **Creem API Key**: [Creem Dashboard](https://app.creem.io) → Settings → API Keys
- **App URL**: Your deployment URL (use `http://localhost:3000` for local development)

</details>

### 4. Run Database Migrations

The project includes SQL migrations in `supabase/migrations/`:

```bash
# If using Supabase CLI (recommended)
npx supabase db push

# Or manually run migrations in Supabase Dashboard SQL Editor
```

**Migrations include:**
- User profiles table
- Pricing plans table
- Subscriptions tracking
- Credits wallet system
- Credit transactions log
- RLS policies for security

### 5. Configure Creem Webhooks

Set up a webhook endpoint in your [Creem Dashboard](https://app.creem.io):

- **Webhook URL**: `https://your-domain.com/api/webhooks/creem`
- **Events**: Select all subscription and checkout events
- **Secret**: Copy this to verify webhook signatures

### 6. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app! 🎉

---

## 📂 Project Structure

```
creem-boilerplate/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── pricing/                      # Pricing page
│   ├── auth/                         # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── ...
│   ├── user/                         # User dashboard
│   │   ├── page.tsx                  # Dashboard home
│   │   ├── billing/                  # Billing & subscriptions
│   │   ├── credits/                  # Credits management
│   │   ├── demo/                     # Credits demo page
│   │   ├── settings/
│   │   └── ...
│   ├── admin/                        # Admin dashboard
│   │   ├── users/                    # User management
│   │   ├── billing/                  # Subscription analytics
│   │   ├── credits/                  # Credit management
│   │   │   ├── products/             # Credit product manager
│   │   │   └── analytics/            # Credit analytics
│   │   └── settings/
│   └── api/
│       ├── webhooks/creem/           # Creem webhook handler
│       └── example-credit-usage/     # Example credit integration
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── admin/                        # Admin components
│   ├── app-sidebar.tsx               # User dashboard sidebar
│   ├── admin-sidebar.tsx             # Admin dashboard sidebar
│   ├── features-section.tsx          # Landing page sections
│   └── ...
├── lib/
│   ├── actions/
│   │   ├── billing.ts                # Subscription actions
│   │   ├── credits.ts                # Credit management actions
│   │   ├── users.ts                  # User actions
│   │   └── notifications.ts          # Notification actions
│   └── supabase/
│       ├── client.ts                 # Client-side Supabase client
│       └── server.ts                 # Server-side Supabase client
├── supabase/
│   └── migrations/                   # Database migrations
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_seed_admin_user.sql
└── components.json                   # shadcn/ui configuration
```

---

## 📱 Pages & Routes

### 🌐 Public Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, pricing preview, testimonials |
| `/pricing` | Full pricing page (3 tiers, monthly/annual toggle, FAQ) |
| `/auth/login` | Email/password and social login |
| `/auth/sign-up` | User registration |
| `/auth/forgot-password` | Password reset request |
| `/auth/update-password` | Set new password |

### 👤 User Dashboard (Protected)

| Route | Description |
|-------|-------------|
| `/user` | Dashboard overview with stats |
| `/user/billing` | Subscription management, plan upgrades |
| `/user/credits` | Credit balance, transaction history |
| `/user/demo` | **AI Assistant** - Try AI-powered actions with credits |
| `/user/analytics` | User analytics (if enabled) |
| `/user/settings` | Profile, account settings |
| `/user/team` | Team member management |
| `/my-profile` | Quick profile access |

### 👨‍💼 Admin Dashboard (Admin Only)

| Route | Description |
|-------|-------------|
| `/admin` | Admin overview |
| `/admin/users` | User management table |
| `/admin/billing` | Subscription analytics |
| `/admin/credits` | Credit wallets overview |
| `/admin/credits/products` | Manage credit packages for sale |
| `/admin/credits/analytics` | Credit usage insights |
| `/admin/settings` | System settings |
| `/admin/roles` | Role management |

---

## 💰 Credits System Deep Dive

### What is the Credits System?

The credits system is a **metered billing infrastructure** that allows you to:
- Charge for individual actions (API calls, AI generations, exports, etc.)
- Track usage across your application
- Offer subscription-based or one-time credit top-ups
- Provide a flexible monetization model beyond subscriptions

### Try the AI Assistant

Visit **`/user/demo`** to interact with the AI Assistant:
- View your current balance
- Try different AI-powered actions (Image generation, text completion, file conversion, export)
- Watch your balance decrease in real-time
- See transaction history update

### Integration Example

<details>
<summary>Click to see how to integrate credits into your features</summary>

```typescript
// Step 1: Check if user has enough credits
const creditCheck = await hasCredits(CREDIT_COST)
if (!creditCheck.hasCredits) {
  return Response.json({ error: 'Insufficient credits' }, { status: 402 })
}

// Step 2: Perform your action
const result = await yourFeatureLogic()

// Step 3: Deduct credits after success
await spendCredits({
  amount: CREDIT_COST,
  description: 'Feature name',
  source: 'usage',
  referenceId: result.id
})
```

See [app/api/example-credit-usage/route.ts](app/api/example-credit-usage/route.ts) for a complete example.
</details>

### Credit Cost Examples

| Feature Type | Typical Credit Cost | Example |
|--------------|---------------------|---------|
| **AI Text Generation** | 5-10 credits | GPT-4 completion, 500 words |
| **AI Image Generation** | 10-20 credits | DALL-E image, 1024x1024 |
| **File Conversion** | 3-5 credits | PDF to Word, up to 10MB |
| **Data Export** | 2-8 credits | CSV export, database query |
| **API Call** | 1-5 credits | Third-party API request |
| **Storage** | 0.1 per MB | File upload/storage |

### Admin Features

#### Credit Products Management
Create and manage credit packages for sale:
- Set credit amount and price
- Configure Creem product integration
- Track sales and revenue
- Manage active/archived products

#### Manual Credit Grants
Admins can manually grant credits to users:
- Promotional credits
- Refunds
- Customer support
- Loyalty rewards

#### Analytics Dashboard
- Total credits granted vs. spent
- Revenue from credit sales
- Top spenders
- Usage trends over time
- Transaction history

---

## 🎨 Customization Guide

### Branding

<details>
<summary><strong>1. Logo & App Name</strong></summary>

Update in [components/app-sidebar.tsx](components/app-sidebar.tsx)
</details>

<details>
<summary><strong>2. Theme Colors</strong></summary>

Modify [app/globals.css](app/globals.css) to customize color variables
</details>

<details>
<summary><strong>3. Metadata</strong></summary>

Update [app/layout.tsx](app/layout.tsx) with your app name and description
</details>

### Pricing Plans

<details>
<summary><strong>Database Configuration</strong></summary>

Configure plans in the `pricing_plans` table in Supabase
</details>

<details>
<summary><strong>UI Display</strong></summary>

Update [components/pricing-preview.tsx](components/pricing-preview.tsx) to match your pricing tiers
</details>

### Email Templates

Customize Supabase Auth email templates:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Update templates for:
   - Confirmation email
   - Magic link
   - Password reset
   - Email change

---

## 🔌 API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/creem` | POST | Creem webhook handler (subscription events) |
| `/api/example-credit-usage` | POST | Example API showing credit integration |

### Webhook Events Handled

The Creem webhook handler processes these events:

| Event | Action |
|-------|--------|
| `subscription.paid` | Store payment record, grant credits |
| `subscription.active` | Create/update subscription record |
| `subscription.canceled` | Mark subscription as canceled |
| `subscription.expired` | Mark subscription as expired |
| `subscription.paused` | Update subscription status |
| `checkout.completed` | Process one-time purchases |

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Click the Deploy Button**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/creem-boilerplate)

2. **Set Environment Variables** (in Vercel dashboard)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CREEM_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your production URL)

3. **Run Database Migrations**
   ```bash
   npx supabase db push --db-url "your-production-db-url"
   ```

4. **Update Creem Webhook URL**
   - Go to [Creem Dashboard](https://app.creem.io) → Webhooks
   - Update URL to: `https://your-domain.vercel.app/api/webhooks/creem`

5. **Done!** Your app is live 🎉

---

## 🧪 Development Tips

### Database Management

**View database locally:**
```bash
npx supabase start
npx supabase db reset  # Reset to migration state
```

**Create new migration:**
```bash
npx supabase migration new your_migration_name
```

### Type Safety


### Type Safety

**Generate TypeScript types from Supabase:**
```bash
npx supabase gen types typescript --local > types/supabase.ts
```

### Testing Webhooks Locally

Use [ngrok](https://ngrok.com) to expose your local server:
```bash
ngrok http 3000
# Update Creem webhook URL to: https://your-ngrok-url.ngrok.io/api/webhooks/creem
```

---

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Creem Documentation](https://docs.creem.io)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

- 📧 Email: heetbhalodiya007@gmail.com
- 🐦 Twitter: [@HeetBhalodiya2](https://x.com/HeetBhalodiya2)

---

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) for Next.js
- [Supabase](https://supabase.com) for database and auth
- [Creem](https://creem.io) for payments
- [shadcn](https://twitter.com/shadcn) for the amazing UI components

---

<div align="center">
  <p>Made with ❤️ by developers, for developers</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>

