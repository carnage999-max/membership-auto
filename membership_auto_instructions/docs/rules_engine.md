Membership Rules Engine - Spec
=============================

Purpose:
- Decide recommended services, benefits remaining, and whether a request is covered.

Inputs:
- vehicle (make, model, year, mileage)
- membership plan
- service history
- telematics alerts / DTCs

Rules (examples):
1. Oil change:
  - Frequency by plan: Basic every 6 months or 6,000 miles; Plus every 8 months or 8,000 miles.
  - If last_oil_change < threshold -> not due.

2. Brake pads:
  - Recommend when friction material reported low by shop or when telematics indicate abnormal deceleration events.

3. Coverage decision:
  - If DTC indicates abuse or pre-existing damage flagged in first vehicle review -> deny coverage.

Engine outputs:
- recommendations: [ { code: 'OIL_CHANGE', dueAt: '2026-03-01', reason: 'mileage' } ]
- coverageDecision: { isCovered: true, explanation: 'within membership coverage' }

Implementation:
- Rules expressed in JSON (rules tree) or implemented in code (TypeScript/Python)
- Store historical decisions for auditability

