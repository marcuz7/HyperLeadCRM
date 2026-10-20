/**
 * HyperLeadAI ↔ HyperLeadCRM bridge contract (v1).
 * Pure types and validation: no network calls, database writes or automatic sends.
 * CRM is the system of record for contacts, opportunities and bookings.
 */
export const HYPERLEAD_BRIDGE_VERSION = "1.0" as const;

export const HYPERLEAD_EVENT_TYPES = [
  "ai.lead.discovered",
  "ai.opportunity.signal",
  "ai.outreach.requested",
  "crm.contact.upserted",
  "crm.conversation.replied",
  "crm.appointment.confirmed",
  "crm.opportunity.won",
  "crm.opportunity.lost",
] as const;

export type HyperLeadEventType = (typeof HYPERLEAD_EVENT_TYPES)[number];

export interface HyperLeadBridgeEvent {
  schema_version: typeof HYPERLEAD_BRIDGE_VERSION;
  event_id: string;
  event_type: HyperLeadEventType;
  agency_id: string;
  tenant_id: string;
  correlation_id: string;
  idempotency_key: string;
  occurred_at: string;
  source: "hyperleadai" | "hyperleadcrm";
  entity_id?: string;
  evidence_ref?: string;
  payload: Record<string, unknown>;
}

const requiredKeys = [
  "event_id",
  "agency_id",
  "tenant_id",
  "correlation_id",
  "idempotency_key",
  "occurred_at",
] as const;

export function isHyperLeadBridgeEvent(value: unknown): value is HyperLeadBridgeEvent {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const event = value as Record<string, unknown>;
  if (event.schema_version !== HYPERLEAD_BRIDGE_VERSION) return false;
  if (!HYPERLEAD_EVENT_TYPES.includes(event.event_type as HyperLeadEventType)) return false;
  if (event.source !== "hyperleadai" && event.source !== "hyperleadcrm") return false;
  if (!requiredKeys.every((key) => typeof event[key] === "string" && (event[key] as string).trim().length > 0)) return false;
  if (typeof event.payload !== "object" || event.payload === null || Array.isArray(event.payload)) return false;
  if (Number.isNaN(Date.parse(event.occurred_at as string))) return false;
  return true;
}

/**
 * Fail closed if the event belongs to another tenant.
 * Callers MUST also enforce authenticated agency and tenant authorization.
 */
export function assertHyperLeadTenant(event: HyperLeadBridgeEvent, tenantId: string): void {
  if (!tenantId || event.tenant_id !== tenantId) {
    throw new Error("HYPERLEAD_TENANT_MISMATCH");
  }
}
