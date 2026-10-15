# Rationale: 0002. Backend persistence & auth architecture

## Context

The current salon demonstration relies entirely on in memory React state initialized from static seed files. When a customer books an appointment or an administrator modifies a schedule, any browser reload or tab close immediately erases the data. Furthermore, all appointment records and client telephone numbers are exposed directly inside the client bundle, posing a severe data privacy risk.

Helen operates an active hair salon in Ibadan, Oyo State, Nigeria. She requires reliable data storage where customer booking requests persist across sessions. She also requires strict administrative protection so only she can inspect customer contact numbers, confirm bookings, or update services.

The system must satisfy these needs while keeping operational costs at zero Naira, avoiding ongoing server maintenance, and enforcing double booking prevention through relational database constraints.

## Options considered

### Option 1: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Supabase Storage)

Adopt Supabase as the backend service. Appointments, services, and schedules reside in a managed PostgreSQL database. Helen authenticates using Supabase Auth, while client telephone numbers and administrative actions are protected by database Row Level Security policies. Hairstyle media resides in Supabase Storage.

**Pros**:
- Relational schema with transactional integrity and foreign keys matches salon appointments and services.
- Atomic constraints and stored procedures prevent conflicting double bookings.
- Row Level Security enforces client data privacy directly at the database engine level.
- Generous free tier with zero ongoing server hosting costs and no virtual machine maintenance.
- Built in authentication and object storage eliminate third party service sprawl.

**Cons**:
- Requires network connectivity to the Supabase cloud project.
- Free tier projects pause after extended inactivity, though active salon bookings prevent dormancy.

### Option 2: Custom Node.js Express API with standalone PostgreSQL database

Build a custom REST API server using Express and deploy it alongside a hosted PostgreSQL database (such as Render or Railway).

**Pros**:
- Full programmatic control over server routes and middleware.
- Independent of any specific cloud platform client libraries.

**Cons**:
- Introduces ongoing server hosting maintenance, deployment pipelines, and cold start delays on free hosting tiers.
- Requires building custom JWT authentication, password hashing, and token refresh logic.
- Adds unnecessary architectural complexity for a single salon business.

### Option 3: Google Firebase (Cloud Firestore and Firebase Authentication)

Adopt Google Firebase using the Firestore document database and Firebase Auth.

**Pros**:
- Fast setup and generous free tier for document reads and writes.
- Realtime document subscriptions work smoothly out of the box.

**Cons**:
- Firestore is a NoSQL document store that lacks relational foreign key constraints and atomic range overlap checks needed to prevent double bookings.
- Complex booking state queries and date filtering require complex indexing and client side aggregation.
- Storing images requires setting up Google Cloud Storage rules separately.

## Rationale

We choose Option 1 (Supabase). Salon bookings are relational by nature: an appointment references a specific service, belongs to a time slot, and transitions across strict status lifecycles. Preventing double bookings requires atomic checks that PostgreSQL handles natively.

Supabase provides enterprise grade Row Level Security, built in email authentication, and media storage within a single platform. This architecture completely resolves the prototype privacy flaw, eliminates operational server overhead for Helen, and keeps monthly infrastructure costs at zero.
