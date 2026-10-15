# Rationale: 0004. Availability & conflict prevention

## Context

Braids by Helen operates as an active styling studio in Ibadan, Oyo State, Nigeria. Intricate braiding sessions often require several consecutive hours of focused work. Booking two clients for the same time slot leads to severe client disappointment, extended waiting times, and salon stress.

The salon needs the ability to declare when Helen is unavailable. Helen occasionally requires full day closures for family events, church commitments, or salon sanitation, as well as partial day blocks for errands or personal breaks. Currently, the customer reservation modal relies on hardcoded date indexes to simulate booked days, which fails to reflect Helen's real schedule.

Furthermore, client privacy must be preserved. When prospective clients check schedule openings, the system must reveal which slots are occupied without exposing customer names, phone numbers, or private styling notes to anonymous internet visitors.

Finally, under Policy B, multiple client booking requests can arrive for the same time slot while awaiting Helen's review. When Helen confirms one appointment, the system must atomically ensure that no duplicate confirmation can take place for that slot, and Helen must be alerted to resolve any competing requests cleanly.

## Options considered

### Option 1: Two tier availability management with privacy safe public procedure, interactive studio modal, and atomic database confirmation checks

A dedicated availability table tracks full day closures and blocked slot arrays with date uniqueness constraints. A PostgreSQL stored procedure aggregates confirmed bookings and blocked hours into anonymous schedule data for clients. Helen manages closures via an interactive studio calendar modal, while an atomic database stored procedure blocks double bookings during confirmation.

**Pros**:
- High data privacy: Anonymous visitors only see slot availability flags with zero customer contact details exposed.
- Atomic integrity: Relational database transaction locks prevent race conditions and accidental double confirmations.
- Helen gains full operational freedom to close entire holidays or specific errand hours effortlessly.

**Cons**:
- Requires creating and maintaining two PostgreSQL stored procedures in Supabase migrations.
- Closing a date with existing confirmed clients requires deliberate confirmation from Helen.

### Option 2: Client side filtering with direct table reads and optimistic locking

The frontend client directly queries the bookings table and availability table, computing available time slots in React state before submitting updates.

**Pros**:
- Simpler database schema with fewer custom stored procedures.
- Rapid initial development without PostgreSQL plpgsql functions.

**Cons**:
- Severe data privacy vulnerability if anonymous clients query the bookings table directly.
- Race conditions remain possible when two tabs confirm overlapping appointments simultaneously.

### Option 3: Whole day closures only without hourly slot blocking

Helen can only mark entire dates as open or closed, with no granular controls over individual hours or time slots.

**Pros**:
- Minimal UI controls consisting only of a simple date toggle list.
- Simpler data structure requiring only a list of closed dates.

**Cons**:
- Inflexible for salon reality: Helen cannot block two hours for an errand without canceling an entire day of business.
- Fails to accommodate partial day bookings or custom styling shifts.

## Rationale

We choose Option 1. It provides complete schedule control for Helen while protecting customer data privacy and guaranteeing schedule integrity through PostgreSQL stored procedures.

Salon operations in Ibadan require flexibility: Helen needs to easily take an afternoon off for an errand without shutting down an entire working day. Option 1 delivers both whole day and slot specific blocking in an intuitive dashboard modal.

Crucially, Option 1 addresses the data privacy requirement. By using a dedicated database procedure to expose only slot availability flags, clients can see real time openings without exposing any client telephone numbers or personal notes. Combined with atomic transaction locks in PostgreSQL, Helen is protected from double booking mistakes while keeping the salon running smoothly.
