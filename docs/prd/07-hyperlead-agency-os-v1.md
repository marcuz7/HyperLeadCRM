---
title: HyperLeadCRM — Agency OS PRD Addendum
version: 1.0-proposal
date: 2026-10-21
status: proposed-for-review
owner_product: HyperLead
parent_prd: docs/prd/00-prd-master.md
---

# HyperLeadCRM — AI-Native Agency OS (GHL-Class) | PRD Addendum v1.0

## 0. Scope and non-destructive transition

This is a **new HyperLead product overlay**, not a retroactive rewrite of the upstream DeskcommCRM PRD. Preserve its existing WhatsApp, tenant RLS, RBAC, LGPD, audit, AI handoff, pipeline, deployment, and API contracts. Validate actual implementation status against code and tests; `docs/current-state.md` is explicitly a historical snapshot, not current evidence.

**Architecture decision:** `marcuz7/HyperLeadCRM` is the owned Agency CRM / Agency OS. `marcuz7/HyperLeadAI` remains the autonomous revenue intelligence engine. **HANH** is the first multi-vertical, multi-region agency operator, beginning with Vietnamese aesthetic clinics. **Paperclip** is a proposed governed workforce orchestration integration, not a replacement for either product. Orca is not built.

Do not replace HyperLeadCRM with Twenty, SeldonFrame or Open Agency OS. They are optional reference implementations/adapters. BigLead.live remains an optional engagement adapter until tested; no automatic retirement of existing integrations.

## 1. Product thesis and success

An agency can onboard a client from a website URL, create a governed workspace, configure CRM/inbox/booking/campaigns/AI workers, launch only after approval, and track evidence-backed leads, appointments and revenue. Build toward **full GoHighLevel-class breadth**, but ship a clinic-focused commercial slice first.

Primary business objective: HANH acquires **10 paying Vietnamese clinic customers**. Initial experimental operating budget target: **USD 1,000/month** excluding pass-through messaging and approved acquisition spend; not a validated cost forecast.

North-star metric: verified client revenue attributable to governed HyperLead actions. Supporting KPIs: qualified leads, consented contacts, response SLA, conversations, confirmed bookings, show rate, closed-won, retention, cost per booked appointment, human escalations, agent error rate.

## 2. Product boundaries and source-of-truth

| Capability | Owning system |
|---|---|
| Agency accounts, client tenants, contacts, companies, opportunities, pipelines, conversations, bookings, campaigns, permissions, customer-facing records | HyperLeadCRM |
| Prospect discovery, signals, opportunity scoring, decision recommendations, experiment/learning logic | HyperLeadAI |
| Agent scheduling, task dispatch, execution supervision | Paperclip adapter (proposed) |
| Client acquisition and service delivery | HANH operating on both systems |
| Messaging and external booking channels | Replaceable channel/provider adapters |

HyperLeadAI may propose or request actions; HyperLeadCRM enforces tenant-scoped permissions and records resulting customer operations. Never silently let both apps become independent CRM systems of record.

## 3. GHL-class module roadmap

**P0 — first billable vertical slice**
1. Agency Command Center: client portfolio, statuses, KPI drill-down, alerts, approvals.
2. Agency-client hierarchy and workspace provisioning: scoped identity, roles, quotas, lifecycle, isolation.
3. CRM + configurable pipelines: contacts, leads, opportunities, custom fields, attribution.
4. Unified inbox: retain WhatsApp strength; add other channels only behind tested adapters.
5. AI receptionist and supervised SDR: approved knowledge, qualification, staff handoff.
6. Calendar and booking: live availability verification, confirmations, cancellations, reminders.
7. Lead capture and website-to-launch: business extraction, landing page/intake draft, review before publish.
8. Workflow builder: triggers, guards, retries, idempotency, human approvals.
9. Revenue outcome dashboard: source-to-booking trace and verified conversions.
10. HyperLeadAI bridge: lead/signal ingest, action requests, outcome feedback.

**P1 — agency commercialization**
Email/SMS/WhatsApp campaign studio; website and funnel builder; review/reputation management; vertical snapshots; billing, subscriptions, usage metering; white-label client portals/domains; agency SaaS provisioning.

**P2 — broader GHL parity**
Social publishing; memberships/courses; affiliate/referral management; marketplace and reusable agent packs.

These are target capabilities, **not claims of current implementation**.

## 4. HyperLeadAI ↔ HyperLeadCRM bridge contract

Transport: versioned REST APIs and signed webhooks backed by a durable outbox/inbox event ledger. MCP may support agent tooling/provisioning, **not** replace delivery guarantees.

Required canonical identifiers: `agency_id`, `tenant_id`, `workspace_id`, `contact_id`, `opportunity_id`, `external_source_id`, `correlation_id`, `event_id`, `idempotency_key`, `schema_version`.

Minimum operations:
- `upsertLead`: HyperLeadAI → CRM; consent/provenance required; deterministic dedup.
- `submitOpportunitySignal`: AI → CRM; evidence, score, source and timestamp.
- `requestOutreach`: AI → CRM; policy/approval gate before any send.
- `getConversationOutcome`: CRM → AI; authorized, minimal necessary data.
- `appointmentConfirmed`: CRM → AI; only after booking provider acknowledgment.
- `opportunityWon/Lost`: CRM → AI; verified outcome with attribution confidence.

Required behavior: tenant-aware authorization on **both** sides; scoped service credentials; replay-safe events; retries with backoff and dead-letter queue; reconciliation; event ordering policy; audit of agent and human actors; no raw secrets or sensitive clinic details in cross-system telemetry.

Example event:
```json
{
  "schema_version": "1.0",
  "event_id": "evt_example",
  "event_type": "crm.appointment.confirmed",
  "agency_id": "agency_example",
  "tenant_id": "tenant_example",
  "contact_id": "contact_example",
  "correlation_id": "corr_example",
  "idempotency_key": "booking_example_confirmed",
  "occurred_at": "2026-10-21T00:00:00Z",
  "source": "hyperleadcrm",
  "evidence_ref": "provider_confirmation_example"
}
```

## 5. HANH clinic vertical pack

`AestheticClinicPack`: bilingual Vietnamese/English business profile, service catalog, clinic-approved FAQ, appointment types, qualification form, consent language, outreach templates, booking and cancellation policies, staff escalation rules, reporting dashboard, AI worker budgets and evals.

Clinical boundaries: no diagnosis, prescribing, unapproved efficacy claims, deceptive testimonials or automatic publication of medical advice. Route medical, pricing-exception and sensitive data requests to authorized staff. Use only approved contact channels and compliant opt-out handling.

## 6. AI workforce governance

AgentSpec includes role, purpose, tenant, skill/tool allowlist, data scope, policies, memory scope, budgets, timeouts, stop conditions, approval gates, evaluation suite, and KPI. Modes: OFF / SUPERVISED / BOUNDED AUTONOMY. Default to SUPERVISED for external communication until a tenant-specific policy is approved.

Workers: Agency Manager, Revenue Hunter, SDR, Receptionist, Booking, Follow-up, Reactivation, Campaign Manager, Revenue Analyst. Paperclip may coordinate these; CRM enforces action authority and logs outcomes.

## 7. Engineering sequence and exit gates

**Phase 0 — gap audit:** inventory actual CRM routes, UI, tenant model, API, inbox, automation, booking, campaign, AI, test coverage, and licensing. Classify each feature `implemented / partial / missing / unverified`; do not infer from historical docs.

**Phase 1 — integration contract:** schema + auth + event ledger + idempotent upsert; two isolated test tenants; contract tests.

**Phase 2 — clinic MVP:** workspace provisioning, lead intake, inbox, supervised receptionist, verified booking, outcome dashboard; one end-to-end pilot trace.

**Phase 3 — agency monetization:** snapshots, funnel/campaign minimums, billing, white label, reputation; pilot under human supervision.

**Phase 4 — GHL-class expansion:** remaining P1/P2 modules prioritized by paying customer demand.

Acceptance gates: no cross-tenant leakage, no duplicate lead on replay, no booking without provider confirmation, no unapproved external message, auditable AI actions, successful event recovery, privacy/consent enforcement, and rollback of any new adapter. Preserve upstream CRM migrations and baseline invariants.

## 8. Explicit decisions and non-goals

- **ADOPT:** HyperLeadCRM as Agency OS; HyperLeadAI as intelligence engine; HANH as first operator.
- **EVALUATE, NOT ADOPT BY DEFAULT:** SeldonFrame, Open Agency OS, Twenty, Chatwoot, Cal.com, Mautic, n8n where a capability gap is demonstrated.
- **PRESERVE:** existing DeskcommCRM code, docs, data, integrations, tests and legal notices until assessed.
- **DEFER:** full GHL parity as a launch gate; production migration; CRM replacement; autonomous medical claims; unreviewed licensing changes.
- **REQUIRES REVIEW:** third-party license obligations, cross-repository identity model, messaging provider compliance, clinic data retention, actual deployment costs.

## 9. Next engineering deliverables

1. Current-state feature inventory with file/test evidence.
2. GHL feature gap matrix with build-versus-adapt choices.
3. HyperLeadAI–CRM API/event OpenAPI and schema contracts.
4. HANH clinic pilot user journeys and acceptance tests.
5. Implementation tickets sized from inspected code, not speculative dates.

**Status:** additive PRD proposal. No runtime feature is implemented by this document.
