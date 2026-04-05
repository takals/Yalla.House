// =============================================================================
// Portal Connector Registry
// Maps portal slugs to their connector implementations.
// Add new connectors here as they are implemented.
// =============================================================================

import type { PortalConnector } from './types'
import { ImmobilienScout24Connector } from './immoscout24'
import { ImmoweltConnector } from './immowelt'

class ConnectorRegistry {
  private connectors = new Map<string, PortalConnector>()

  register(connector: PortalConnector): void {
    this.connectors.set(connector.slug, connector)
  }

  get(slug: string): PortalConnector {
    const c = this.connectors.get(slug)
    if (!c) throw new Error(`No connector registered for portal slug: "${slug}"`)
    return c
  }

  has(slug: string): boolean {
    return this.connectors.has(slug)
  }

  list(): PortalConnector[] {
    return Array.from(this.connectors.values())
  }
}

// Singleton registry pre-populated with all known connectors
export const connectorRegistry = new ConnectorRegistry()

connectorRegistry.register(new ImmobilienScout24Connector())
connectorRegistry.register(new ImmoweltConnector())
