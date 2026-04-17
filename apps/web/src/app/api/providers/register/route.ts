import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      businessName,
      email,
      phone,
      website,
      categoryId,
      areas,
      accreditation,
      accreditationRef,
    } = body

    // Basic validation
    if (!businessName || !email || !phone || !categoryId || !areas) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Create provider record
    // Use type assertion since marketplace tables were added after initial type generation
    const { data: rawProvider, error: providerError } = await (supabase
      .from('providers' as 'users') as unknown as ReturnType<typeof supabase.from>)
      .insert({
        business_name: businessName,
        email,
        phone,
        website: website || null,
        accreditation_body: accreditation || null,
        accreditation_ref: accreditationRef || null,
        status: 'pending',
        source: 'self_signup',
      } as Record<string, unknown>)
      .select('id')
      .single()

    if (providerError) {
      console.error('Provider insert error:', providerError)
      return NextResponse.json(
        { error: 'Failed to create provider' },
        { status: 500 }
      )
    }

    const provider = rawProvider as { id: string } | null

    // Link to service category
    if (provider) {
      await (supabase.from('provider_services' as 'users') as unknown as ReturnType<typeof supabase.from>)
        .insert({
          provider_id: provider.id,
          category_id: categoryId,
        } as Record<string, unknown>)

      // Add coverage areas (split by comma, trim whitespace)
      const postcodes = areas
        .split(',')
        .map((p: string) => p.trim().toUpperCase())
        .filter(Boolean)

      if (postcodes.length > 0) {
        await (supabase.from('provider_coverage_areas' as 'users') as unknown as ReturnType<typeof supabase.from>)
          .insert(
            postcodes.map((prefix: string) => ({
              provider_id: provider.id,
              postcode_prefix: prefix,
            } as Record<string, unknown>))
          )
      }
    }

    return NextResponse.json({ success: true, id: provider?.id })
  } catch (err) {
    console.error('Provider registration error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
