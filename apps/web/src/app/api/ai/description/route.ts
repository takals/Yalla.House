import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
  }

  const body = await request.json()
  const { property_type, intent, city, postcode, bedrooms, bathrooms, size_sqm, construction_year, title } = body

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  // Build a concise prompt from the listing details
  const details = [
    property_type && `Property type: ${property_type}`,
    intent && `Intent: ${intent}`,
    city && `Location: ${postcode ? `${postcode}, ` : ''}${city}`,
    bedrooms && `Bedrooms: ${bedrooms}`,
    bathrooms && `Bathrooms: ${bathrooms}`,
    size_sqm && `Size: ${size_sqm} m²`,
    construction_year && `Built: ${construction_year}`,
  ].filter(Boolean).join('\n')

  const prompt = `Write a compelling property listing description in English for a property with the title "${title}".

Property details:
${details}

Requirements:
- Write 3-4 paragraphs, around 150-200 words total
- Highlight location benefits, property features, and lifestyle appeal
- Be professional but warm — like a top estate agent would write
- Do NOT include the price or make up features not mentioned
- Focus on what makes this property special based on the details given
- If details are sparse, keep it concise and genuine rather than padding with generic filler

Return ONLY the description text, no headers or labels.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Anthropic API error:', errText)
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    const data = await res.json()
    const description = data.content?.[0]?.text ?? ''

    return NextResponse.json({ description })
  } catch (err) {
    console.error('AI description error:', err)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }
}
