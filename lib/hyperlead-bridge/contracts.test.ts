import { describe, expect, it } from "vitest";
import {
  assertHyperLeadTenant,
  isHyperLeadBridgeEvent,
  type HyperLeadBridgeEvent,
} from "./contracts";

const valid: HyperLeadBridgeEvent = {
  schema_version: "1.0",
  event_id: "evt_1",
  event_type: "crm.appointment.confirmed",
  agency_id: "agency_1",
  tenant_id: "tenant_1",
  correlation_id: "corr_1",
  idempotency_key: "booking_1_confirmed",
  occurred_at: "2026-10-21T00:00:00Z",
  source: "hyperleadcrm",
  payload: { appointment_id: "booking_1" },
};

describe("HyperLead bridge contract", () => {
  it("accepts a valid versioned event", () => {
    expect(isHyperLeadBridgeEvent(valid)).toBe(true);
  });

  it("rejects a missing tenant", () => {
    expect(isHyperLeadBridgeEvent({ ...valid, tenant_id: "" })).toBe(false);
  });

  it("rejects an unknown event type", () => {
    expect(isHyperLeadBridgeEvent({ ...valid, event_type: "crm.unknown" })).toBe(false);
  });

  it("rejects a malformed timestamp", () => {
    expect(isHyperLeadBridgeEvent({ ...valid, occurred_at: "not-a-date" })).toBe(false);
  });

  it("fails closed across tenants", () => {
    expect(() => assertHyperLeadTenant(valid, "tenant_2")).toThrow("HYPERLEAD_TENANT_MISMATCH");
    expect(() => assertHyperLeadTenant(valid, "tenant_1")).not.toThrow();
  });
});
