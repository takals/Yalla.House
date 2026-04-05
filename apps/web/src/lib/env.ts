import { z } from 'zod'

/**
 * Server-side environment variables (not exposed to browser).
 * These are secret keys and configuration values that must only
 * be accessed in server-side code (Server Components, API routes, Inngest functions).
 */
const serverSchema = z.object({
  // Supabase (REQUIRED - core to app functionality)
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required'),

  // Stripe (REQUIRED - billing is core)
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is required'),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, 'Stripe webhook secret is required'),

  // Resend (email service)
  RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
  RESEND_FROM_EMAIL: z
    .string()
    .email('Invalid email address for RESEND_FROM_EMAIL')
    .default('noreply@yalla.house'),

  // Twilio (Voice + SMS - OPTIONAL)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_DE: z.string().optional(),

  // WhatsApp (360dialog - OPTIONAL)
  WHATSAPP_API_KEY: z.string().optional(),
  WHATSAPP_PHONE_ID: z.string().optional(),

  // Immoscout24 portal connector (OPTIONAL)
  IMMOSCOUT24_CLIENT_ID: z.string().optional(),
  IMMOSCOUT24_CLIENT_SECRET: z.string().optional(),
  IMMOSCOUT24_SANDBOX: z
    .enum(['true', 'false'])
    .optional()
    .default('true')
    .transform((v) => v === 'true'),

  // Immowelt portal connector (OPTIONAL)
  IMMOWELT_API_KEY: z.string().optional(),
  IMMOWELT_SANDBOX: z
    .enum(['true', 'false'])
    .optional()
    .default('true')
    .transform((v) => v === 'true'),

  // Inngest (background jobs - OPTIONAL)
  INNGEST_SIGNING_KEY: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),

  // Upstash Redis (caching - OPTIONAL)
  UPSTASH_REDIS_REST_URL: z.string().url('Invalid Upstash Redis URL').optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // App configuration
  DEFAULT_LOCALE: z.enum(['de', 'en']).default('de'),
})

/**
 * Client-side environment variables (exposed to browser via NEXT_PUBLIC_ prefix).
 * These are public values that are safe to expose to the client.
 */
const clientSchema = z.object({
  // Supabase (REQUIRED - core to app functionality)
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('Supabase URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anon key is required'),

  // Stripe (REQUIRED - billing is core)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'Stripe publishable key is required'),

  // App URLs
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('App URL must be a valid URL')
    .default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url('Site URL must be a valid URL')
    .default('https://yalla.house'),
})

/**
 * Combined schema: all environment variables (server + client).
 */
const envSchema = serverSchema.merge(clientSchema)

/**
 * Inferred TypeScript type for all validated environment variables.
 */
export type Env = z.infer<typeof envSchema>

/**
 * Validates environment variables at startup.
 * Throws a descriptive error if any required vars are missing or invalid.
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((issue) => {
        const path = issue.path.join('.')
        const message = issue.message
        return `  ✗ ${path}: ${message}`
      })
      .join('\n')

    const errorMessage =
      '❌ Invalid environment variables:\n' +
      errors +
      '\n\nPlease check your .env file and ensure all required variables are set correctly.'

    console.error(errorMessage)
    throw new Error('Invalid environment variables. See logs for details.')
  }

  return parsed.data
}

/**
 * Validated environment variables. This is computed at module load time,
 * so the app will fail to start if any required variables are missing or invalid.
 */
export const env = validateEnv()
