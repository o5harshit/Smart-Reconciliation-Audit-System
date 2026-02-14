# Smart Reconciliation & Audit System (MERN)

## Overview
This project is a full-stack reconciliation system built with:
- `MongoDB` (data store)
- `Express.js` + `Node.js` (API layer)
- `React` + `Vite` (frontend UI)

Core capabilities:
- CSV upload with column mapping
- Automated reconciliation (`MATCHED`, `PARTIAL`, `UNMATCHED`, `DUPLICATE`)
- Global and per-file dashboards
- Record management (update/delete with re-reconciliation)
- Immutable audit trail and visual audit timeline
- Role-based access control (`admin`, `analyst`, `viewer`)

---

## Architecture

### Backend (`server/`)
- `Routes/`: API route registration and role guard wiring.
- `Controllers/`: Business logic for auth, uploads, reconciliation, records, and audit.
- `Models/`: Mongoose schemas (`User`, `UploadJob`, `Record`, `ReconciliationResult`, `AuditLog`).
- `utils/`: CSV processing, matching rules, reconciliation logic, hashing, Cloudinary helper, audit logger.

Key backend flows:
1. Upload preview stores `UploadJob` and first 20 rows.
2. Mapping submit triggers async CSV processing.
3. Processor creates `Record` + `ReconciliationResult` and audit events.
4. Dashboards query aggregated reconciliation summaries.
5. Record update/delete re-runs reconciliation and writes audit deltas.

### Frontend (`client/`)
- `Pages/`: Auth, dashboard, upload, reconciliation view, records, audit logs.
- `components/`: reusable UI pieces (filters, cards, chart, timeline, tables).
- Redux auth state + route guards for authentication/role-based pages.

---

## Reconciliation Logic

Configured in `server/utils/matchingRules.js`:
- Exact match: `transactionId + amount`
- Partial match: `referenceNumber` and amount within `±2%`
- Duplicate: same `transactionId`
- Unmatched: none of the above

Order of evaluation:
1. `DUPLICATE`
2. `MATCHED`
3. `PARTIAL`
4. `UNMATCHED`

---

## Idempotency & Data Consistency

Implemented behavior:
- File content hash (`fileHash`) + mapping hash (`mappingHash`) is stored in `UploadJob`.
- Re-uploading the same file with unchanged mapping reuses existing completed results.
- New duplicate records are not created for reused uploads.
- Reconciliation endpoint resolves reused job links (`reusedFromJobId`) transparently.

---

## Audit Trail

`AuditLog` is immutable:
- update/delete operations are blocked at schema level.

Captured audit event data:
- `field`
- `oldValue`, `newValue`
- `changedBy`
- `source`
- timestamp (`createdAt`)

Supported entities:
- `RECORD` changes (record edits, status changes, create/delete)
- `USER` changes (role change, enable/disable)

---

## Authentication & Authorization

Roles:
- `admin`: full access
- `analyst`: upload + reconcile + record edits
- `viewer`: read-only

Enforced in both:
- Backend route middleware (`verifyToken`, `authorizeRoles`)
- Frontend route guards (`PrivateRoute`, role-aware route wrapper)

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB instance

### 1) Server
```bash
cd server
npm install
npm start
```

Required `server/.env`:
```env
PORT=8747
DB_URL=<mongodb-connection-string>
JWT_KEY=<jwt-secret>
ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

### 2) Client
```bash
cd client
npm install
npm run dev
```

Required `client/.env`:
```env
VITE_SERVER_URL=http://localhost:8747
```

---

## Demo Credentials

Admin login:
- Email: `srivastavaharshit400@gmail.com`
- Password: `Admin@123`

---

## Demo Video

Project walkthrough video:
- https://drive.google.com/file/d/1ehJASSz1H9IEXZtui8r7DyHxoQvqzdrr/view?usp=sharing

---

## API Surface (High-Level)

- Auth:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/user-info`
  - `GET /api/auth/user` (admin)
  - `PATCH /api/auth/user/:userId/role` (admin)
  - `PATCH /api/auth/user/:userId/status` (admin)

- Upload:
  - `POST /api/uploads/preview`
  - `POST /api/uploads/map`
  - `GET /api/uploads/upload-jobs`
  - `GET /api/uploads/upload-jobs/:uploadJobId`

- Reconciliation:
  - `GET /api/reconciliation/global-summary`
  - `GET /api/reconciliation/GetReconciliationDataById/:uploadJobId`
  - `PATCH /api/reconciliation/records/:recordId/manual-correction`

- Records:
  - `GET /api/record`
  - `PATCH /api/record/:recordId`
  - `DELETE /api/record/:recordId`

- Audit:
  - `GET /api/audit/logs`
  - `GET /api/audit/record/:recordId/timeline`

---

## API Documentation (Postman)

Postman collection file:
- `postman/Smart-Reconciliation-System.postman_collection.json`

Import this collection into Postman, set `baseUrl` if needed, run `Auth -> Login` first, then call protected endpoints.

---

## Assumptions

- CSV headers are mappable to mandatory fields: `transactionId`, `amount`, `referenceNumber`, `date`.
- Cloudinary upload failures should not block preview/mapping flow completely.
- Reconciliation rules are global and consistent across uploads.
- Role bootstrapping for first admin is handled outside this repository workflow.

---

## Trade-offs

- Reconciliation checks use DB lookups per record for correctness and simplicity over max throughput.
- Idempotency uses file+mapping hashing; this is reliable for exact re-uploads but does not deduplicate semantically equivalent transformed files.
- Recompute-on-edit favors consistency/auditability over minimal compute.
- Audit logs are append-only and can grow quickly; no archival/TTL strategy is included yet.

---

## Limitations

- No distributed job queue (processing runs in app process).
- No chunked/batched import optimization for very large files.
- No pagination yet on audit logs/record lists in UI.
- Some existing lint issues remain in UI utility files (not functionally blocking).

---

## Sample Input Files

Included under `test-data/`:
- `test-data/sample-upload-1.csv`
- `test-data/sample-upload-2.csv`

Suggested test:
1. Upload `sample-upload-1.csv`
2. Upload `sample-upload-2.csv`
3. Open global dashboard + file-specific dashboard
4. Edit/delete a record from Records page and verify:
   - reconciliation status changes
   - audit logs/timeline entries are created
