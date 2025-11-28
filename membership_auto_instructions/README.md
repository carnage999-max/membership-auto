Membership Auto - Developer Package
=====================================

Included in this ZIP:
- openapi.yaml — OpenAPI spec covering core endpoints (auth, vehicles, telematics, appointments, offers, referrals, chat, files).
- db_schema.sql — Postgres schema (CREATE TABLE statements) to start the DB.
- rn_starter/ — React Native (TypeScript + Expo) starter skeleton (package.json, App.tsx, sample services).
- api_examples/ — Example requests/responses and Postman-friendly JSON samples.
- docs/obd_integration.md — Detailed OBD-II / Reed device integration engineering doc.
- docs/rules_engine.md — Membership rules & diagnostics engine logic.
- docs/wireframes.md — Screen-by-screen wireframes in text form (Figma-ready spec).
- docs/push_mapping.md — Push event → notification → deep link mapping.
- docs/websocket_protocol.md — Chat WebSocket protocol.
- docs/devops_arch.md — DevOps & deployment map (AWS + CI notes).
- docs/ci_cd.md — GitHub Actions example for tests/build/deploy.
- LICENSE.txt — MIT example license.

How to use:
1. Extract the ZIP.
2. Import db_schema.sql into a Postgres instance.
3. Serve the openapi.yaml with Swagger UI (or import to Postman).
4. Open rn_starter in your dev environment (Expo recommended).

Notes:
This package is a comprehensive engineering starting point. It contains detailed endpoint shapes and engineering docs, but it is **not** a finished production codebase. Use it to accelerate development, and adapt to your infra and conventions.

