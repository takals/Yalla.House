import {
  Home, BedDouble, Bath, Building, CalendarDays,
  Car, Trees, Zap, Clock,
} from 'lucide-react'

interface KeyFact {
  icon: React.ReactNode
  label: string
  value: string
}

interface Props {
  listing: Record<string, unknown>
  translations: Record<string, string>
}

function tr(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

/**
 * Structured key facts grid — like Rightmove/Zoopla property details.
 * Server component, no interactivity needed.
 */
export function KeyFactsGrid({ listing, translations: t }: Props) {
  const facts: KeyFact[] = []

  // Property type
  if (listing.property_type) {
    const typeKey = `factType${String(listing.property_type).charAt(0).toUpperCase()}${String(listing.property_type).slice(1)}`
    facts.push({
      icon: <Home size={18} />,
      label: tr(t, 'factPropertyType'),
      value: t[typeKey] ?? String(listing.property_type),
    })
  }

  // Bedrooms
  if (listing.bedrooms != null) {
    facts.push({
      icon: <BedDouble size={18} />,
      label: tr(t, 'factBedrooms'),
      value: String(listing.bedrooms),
    })
  }

  // Bathrooms
  if (listing.bathrooms != null) {
    facts.push({
      icon: <Bath size={18} />,
      label: tr(t, 'factBathrooms'),
      value: String(listing.bathrooms),
    })
  }

  // Living space
  if (listing.size_sqm) {
    facts.push({
      icon: <Home size={18} />,
      label: tr(t, 'factLivingSpace'),
      value: `${listing.size_sqm} m²`,
    })
  }

  // Floor
  if (listing.floor != null) {
    facts.push({
      icon: <Building size={18} />,
      label: tr(t, 'factFloor'),
      value: String(listing.floor),
    })
  }

  // Year built
  if (listing.construction_year) {
    facts.push({
      icon: <CalendarDays size={18} />,
      label: tr(t, 'factBuiltYear'),
      value: String(listing.construction_year),
    })
  }

  // Parking
  if (listing.parking != null) {
    facts.push({
      icon: <Car size={18} />,
      label: tr(t, 'factParking'),
      value: listing.parking ? tr(t, 'factYes') : tr(t, 'factNo'),
    })
  }

  // Garden
  if (listing.garden != null) {
    facts.push({
      icon: <Trees size={18} />,
      label: tr(t, 'factGarden'),
      value: listing.garden ? tr(t, 'factYes') : tr(t, 'factNo'),
    })
  }

  // Energy rating
  if (listing.energy_rating) {
    facts.push({
      icon: <Zap size={18} />,
      label: tr(t, 'factEnergyRating'),
      value: String(listing.energy_rating),
    })
  }

  if (facts.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {facts.map((fact, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-4 bg-bg rounded-xl border border-border-default"
        >
          <div className="text-brand flex-shrink-0 mt-0.5">{fact.icon}</div>
          <div className="min-w-0">
            <p className="text-xs text-text-secondary uppercase tracking-wide font-semibold">{fact.label}</p>
            <p className="text-sm font-bold text-text-primary mt-0.5">{fact.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
